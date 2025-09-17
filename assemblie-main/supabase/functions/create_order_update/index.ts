
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
    const { order_id, status, message } = await req.json()
    
    if (!order_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Update order status in orders table
    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: status })
      .eq('id', order_id)
    
    if (orderError) {
      console.error('Error updating order status:', orderError)
      return new Response(
        JSON.stringify({ error: 'Failed to update order status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create order update record
    const { data: updateData, error: updateError } = await supabase
      .from('order_updates')
      .insert({
        order_id: order_id,
        status: status,
        message: message
      })
      .select()
    
    if (updateError) {
      console.error('Error creating order update:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order update' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Also update tracking_files if exists
    try {
      const { data: trackingData } = await supabase
        .from('tracking_files')
        .select('id')
        .eq('order_id', order_id)
        .maybeSingle()
        
      if (trackingData) {
        // Just update the updated_at timestamp to trigger any relevant triggers
        await supabase
          .from('tracking_files')
          .update({ updated_at: new Date().toISOString() })
          .eq('order_id', order_id)
      } else {
        // Create a new tracking file record if it doesn't exist
        await supabase
          .from('tracking_files')
          .insert({
            order_id: order_id,
            file_name: `order_${order_id}_tracking`,
            file_type: 'tracking',
            file_url: '' // Empty for now
          })
      }
    } catch (error) {
      console.error('Error updating tracking file:', error)
      // Continue anyway as the main updates succeeded
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
