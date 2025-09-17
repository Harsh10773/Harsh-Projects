
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { order_id, status } = await req.json()
    
    if (!order_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // First check if the tracking file exists
    const { data: trackingFile, error: checkError } = await supabase
      .from('tracking_files')
      .select('id')
      .eq('order_id', order_id)
      .maybeSingle()
      
    if (checkError) {
      console.error('Error checking tracking file:', checkError)
      return new Response(
        JSON.stringify({ error: 'Error checking tracking file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!trackingFile) {
      // Create a new tracking file record
      const { data: newTrackingFile, error: createError } = await supabase
        .from('tracking_files')
        .insert({
          order_id: order_id,
          file_name: `order_${order_id}_tracking`,
          file_type: 'tracking',
          file_url: '' // Empty for now
        })
        .select()
      
      if (createError) {
        console.error('Error creating tracking file:', createError)
        return new Response(
          JSON.stringify({ error: 'Error creating tracking file' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Now add the status to the order_updates table
    const { data: updateData, error: updateError } = await supabase
      .from('order_updates')
      .insert({
        order_id: order_id,
        status: status,
        message: `Order status updated to ${status}`
      })
      .select()
    
    if (updateError) {
      console.error('Error creating order update:', updateError)
      return new Response(
        JSON.stringify({ error: 'Error creating order update' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Update the order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: status })
      .eq('id', order_id)
    
    if (orderError) {
      console.error('Error updating order status:', orderError)
      // Continue anyway as the update record was created
    }
    
    return new Response(
      JSON.stringify({ success: true, data: updateData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
