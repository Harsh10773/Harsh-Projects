
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { updateOrderStatus } from "./orderStatus";
import { incrementVendorStatOrderLost, incrementVendorStatOrderWon } from "./vendorStats";

/**
 * Fetches all vendors from the database
 */
export const fetchAllVendors = async () => {
  try {
    console.log("Fetching all vendors from database...");
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .order('vendor_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} vendors`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchAllVendors:', error);
    toast.error('Failed to load vendors');
    return [];
  }
};

/**
 * Submits a component quote from a vendor
 */
export const submitComponentQuote = async (
  vendorId: string,
  orderId: string,
  orderItemId: string,
  quotedPrice: number,
  componentName?: string,
  quantity?: number
) => {
  try {
    if (!vendorId || !orderId || !orderItemId) {
      throw new Error("Missing required fields");
    }

    console.log(`Submitting quote: vendorId=${vendorId}, orderId=${orderId}, itemId=${orderItemId}, price=${quotedPrice}, component=${componentName}, quantity=${quantity || 1}`);
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      throw new Error("Not authenticated");
    }
    
    try {
      // First try using the Edge Function for reliability
      console.log("Using Edge Function to submit quote");
      const response = await fetch(
        'https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/insert_component_quote',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            vendorId,
            orderId,
            orderItemId,
            quotedPrice,
            componentName, // This will be used as a fallback if exact name not found
            quantity
          })
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log("Quote submitted successfully via Edge Function:", result);
        return { success: true, data: result };
      } else {
        const errorText = await response.text();
        console.error("Edge Function request failed:", errorText);
        throw new Error(`Edge Function failed: ${errorText}`);
      }
    } catch (edgeError) {
      console.error("Error calling Edge Function:", edgeError);
      
      // Fall back to direct database operation
      console.log("Falling back to direct database operation");
      
      // First get the exact component name
      let exactComponentName = componentName || 'Component';
      
      try {
        // Get exact component name from customer_ordered_components first
        const { data: customerComponent } = await supabase
          .from('customer_ordered_components')
          .select('component_name')
          .eq('id', orderItemId)
          .maybeSingle();
          
        if (customerComponent && customerComponent.component_name) {
          exactComponentName = customerComponent.component_name;
          console.log(`Using exact name from customer_ordered_components: ${exactComponentName}`);
        } else {
          // If not found, try order_items
          const { data: orderItem } = await supabase
            .from('order_items')
            .select('component_name')
            .eq('id', orderItemId)
            .maybeSingle();
            
          if (orderItem && orderItem.component_name) {
            exactComponentName = orderItem.component_name;
            console.log(`Using exact name from order_items: ${exactComponentName}`);
          }
        }
      } catch (nameError) {
        console.error("Error getting exact component name:", nameError);
      }
      
      try {
        // Use an RPC function for insertion with the exact component name
        const { data, error } = await supabase.rpc('insert_component_quote_history', {
          vendor_id_param: vendorId,
          order_id_param: orderId,
          order_item_id_param: orderItemId,
          component_name_param: exactComponentName,
          quoted_price_param: quotedPrice,
          quantity_param: quantity || 1
        });
        
        if (error) {
          console.error("RPC error:", error);
          throw new Error(error.message);
        }
        
        console.log("Quote submitted successfully via RPC:", data);
        return { success: true, data };
      } catch (rpcError) {
        console.error("RPC fallback error:", rpcError);
        throw rpcError;
      }
    }
  } catch (error) {
    console.error("Error in submitComponentQuote:", error);
    return { 
      success: false, 
      message: error.message || "Failed to submit quote" 
    };
  }
};

/**
 * Notifies a vendor about their quotation status
 */
export const notifyVendor = async (
  vendorId: string,
  orderId: string,
  isAccepted: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Notifying vendor ${vendorId} about order ${orderId}, status: ${isAccepted ? 'accepted' : 'rejected'}`);
    
    // First check if there's an existing quotation record
    const { data: existingQuotation, error: checkError } = await supabase
      .from('vendor_quotations')
      .select('id')
      .eq('vendor_id', vendorId)
      .eq('order_id', orderId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing quotation:', checkError);
    }
    
    if (existingQuotation && existingQuotation.id) {
      // Update existing quotation
      const { error: quotationError } = await supabase
        .from('vendor_quotations')
        .update({ status: isAccepted ? 'accepted' : 'rejected' })
        .eq('id', existingQuotation.id);
        
      if (quotationError) {
        console.error('Error updating vendor quotation status:', quotationError);
      }
    } else {
      // Calculate total price from component quotations
      const { data: componentPrices } = await supabase
        .from('vendor_component_quotations_history')
        .select('quoted_price, quantity')
        .eq('vendor_id', vendorId)
        .eq('order_id', orderId);
        
      let totalPrice = 0;
      if (componentPrices && componentPrices.length > 0) {
        totalPrice = componentPrices.reduce((sum, item) => {
          return sum + (item.quoted_price * (item.quantity || 1));
        }, 0);
      }
      
      // Create new quotation record
      const { error: createError } = await supabase
        .from('vendor_quotations')
        .insert({
          vendor_id: vendorId,
          order_id: orderId,
          price: totalPrice,
          status: isAccepted ? 'accepted' : 'rejected'
        });
        
      if (createError) {
        console.error('Error creating vendor quotation record:', createError);
      }
    }
    
    // Also update component quotations history using the Edge Function
    try {
      const sessionData = await supabase.auth.getSession();
      const accessToken = sessionData.data.session?.access_token;
      
      if (accessToken) {
        const updateResponse = await fetch(
          'https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/update_component_quotations_status',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              vendor_id_param: vendorId,
              order_id_param: orderId,
              status_param: isAccepted ? 'accepted' : 'rejected'
            })
          }
        );
        
        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          console.error('Error updating component quotations history:', errorData);
        }
      } else {
        console.error('No access token available for auth');
      }
    } catch (error) {
      console.error('Error calling update_component_quotations_status function:', error);
    }
    
    // Update vendor_orders record to mark this order as processed by this vendor
    const { error: orderError } = await supabase
      .from('vendor_orders')
      .upsert({
        vendor_id: vendorId,
        order_id: orderId,
        status: isAccepted ? 'accepted' : 'rejected'
      }, { onConflict: 'vendor_id,order_id' });
      
    if (orderError) {
      console.error('Error updating vendor order status:', orderError);
    }
    
    // Create an order update for the notification
    const { data: adminUser } = await supabase.auth.getUser();
    
    // Create an order update message
    const message = isAccepted
      ? `Vendor quotation has been accepted!`
      : `Vendor quotation was not selected for this order.`;
    
    // Insert directly into order_updates to bypass RLS
    const { error: updateError } = await supabase
      .from('order_updates')
      .insert({
        order_id: orderId,
        status: isAccepted ? 'processing' : 'cancelled',
        message: message
      });
    
    if (updateError) {
      console.error('Error creating order update:', updateError);
      // Continue with the process even if this step fails
    }
    
    // If accepted, update vendor stats using the edge function
    if (isAccepted) {
      await incrementVendorStatOrderWon(vendorId);
    } else {
      await incrementVendorStatOrderLost(vendorId);
    }
    
    return { success: true, message: 'Vendor notification sent successfully' };
  } catch (error) {
    console.error('Error in notifyVendor:', error);
    return { success: false, message: 'Error sending notification' };
  }
};

/**
 * Fetches component quotation details for vendor and order
 */
export const fetchComponentQuotationDetails = async (vendorId: string, orderId: string) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      console.error("No access token available");
      return null;
    }
    
    console.log(`Fetching component quotes for vendor=${vendorId}, order=${orderId}`);
    
    const response = await fetch(
      'https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/get_vendor_component_quotations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          vendor_id_param: vendorId,
          order_id_param: orderId
        })
      }
    );
      
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching quotation details:', errorData);
      return null;
    }
    
    const componentQuotes = await response.json();
    console.log('Received component quotes with exact names:', componentQuotes);
    return componentQuotes;
  } catch (error) {
    console.error('Error fetching component quotation details:', error);
    return null;
  }
};
