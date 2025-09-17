
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

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
    const { vendor_id_param, order_id_param, status_param } = await req.json()

    if (!vendor_id_param || !order_id_param || !status_param) {
      return new Response(
        JSON.stringify({ error: 'Vendor ID, Order ID, and Status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Make sure status is one of the allowed values to prevent constraint errors
    const allowedStatuses = ['pending', 'accepted', 'rejected'];
    if (!allowedStatuses.includes(status_param)) {
      return new Response(
        JSON.stringify({ error: `Invalid status. Status must be one of: ${allowedStatuses.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Updating component quotations status for vendor ${vendor_id_param}, order ${order_id_param} to ${status_param}`)

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update all component quotations for this vendor/order combination
    const { error: historyError } = await supabase
      .from('vendor_component_quotations_history')
      .update({ status: status_param })
      .eq('vendor_id', vendor_id_param)
      .eq('order_id', order_id_param)

    if (historyError) {
      console.error('Error updating component quotations history status:', historyError)
      // Continue with the process despite this error
    }

    // Get or create the vendor quotation record with the correct status
    const { data: quotationData, error: getQuotationError } = await supabase
      .from('vendor_quotations')
      .select('id, price')
      .eq('vendor_id', vendor_id_param)
      .eq('order_id', order_id_param)
      .maybeSingle()

    if (getQuotationError) {
      console.error('Error checking for existing quotation:', getQuotationError)
    }

    if (quotationData) {
      // Update existing quotation with safe error handling
      const { error: updateError } = await supabase
        .from('vendor_quotations')
        .update({ status: status_param })
        .eq('id', quotationData.id)

      if (updateError) {
        console.error('Error updating vendor quotation status:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update vendor quotation status', details: updateError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Get the price data from component quotations
      const { data: componentPrices, error: pricesError } = await supabase
        .from('vendor_component_quotations_history')
        .select('quoted_price, quantity')
        .eq('vendor_id', vendor_id_param)
        .eq('order_id', order_id_param)

      let totalPrice = 0
      if (!pricesError && componentPrices && componentPrices.length > 0) {
        totalPrice = componentPrices.reduce((sum, item) => {
          return sum + (item.quoted_price * (item.quantity || 1))
        }, 0)
      }

      // Create new quotation record with explicit status validation
      try {
        const { error: insertError } = await supabase
          .from('vendor_quotations')
          .insert({
            vendor_id: vendor_id_param,
            order_id: order_id_param,
            price: totalPrice,
            status: status_param
          })

        if (insertError) {
          console.error('Error creating vendor quotation record:', insertError)
          // Continue with the process despite this error
        }
      } catch (insertError) {
        console.error('Exception inserting vendor quotation:', insertError)
        // Continue with the process despite this error
      }
    }

    // Update vendor_orders table to mark the order as processed
    const { error: vendorOrderError } = await supabase
      .from('vendor_orders')
      .upsert({
        vendor_id: vendor_id_param,
        order_id: order_id_param,
        status: status_param
      }, { onConflict: 'vendor_id,order_id' })

    if (vendorOrderError) {
      console.error('Error updating vendor order status:', vendorOrderError)
      // Continue with the process despite this error
    }

    // Update vendor stats if the status is accepted or rejected
    if (status_param === 'accepted' || status_param === 'rejected') {
      try {
        // Get existing stats
        const { data: existingStats } = await supabase
          .from('vendor_stats')
          .select('*')
          .eq('vendor_id', vendor_id_param)
          .maybeSingle()

        if (existingStats) {
          // Update existing stats
          const updateData = status_param === 'accepted'
            ? { orders_won: existingStats.orders_won + 1 }
            : { orders_lost: existingStats.orders_lost + 1 }

          await supabase
            .from('vendor_stats')
            .update({
              ...updateData,
              updated_at: new Date().toISOString()
            })
            .eq('vendor_id', vendor_id_param)
        } else {
          // Create new stats
          await supabase
            .from('vendor_stats')
            .insert({
              vendor_id: vendor_id_param,
              orders_won: status_param === 'accepted' ? 1 : 0,
              orders_lost: status_param === 'rejected' ? 1 : 0
            })
        }
      } catch (statsError) {
        console.error('Error updating vendor stats:', statsError)
        // Continue with the process despite this error
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in update_component_quotations_status:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
