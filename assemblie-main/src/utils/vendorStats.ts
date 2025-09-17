
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Helper function to update vendor statistics when they win an order
 */
export const incrementVendorStatOrderWon = async (vendorId: string): Promise<void> => {
  try {
    console.log(`Incrementing order win stat for vendor ${vendorId}`);
    
    if (!vendorId) {
      console.error("Invalid vendor ID provided to incrementVendorStatOrderWon");
      return;
    }
    
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      console.error("No access token available for auth");
      toast.error("Authentication error. Please sign in again.");
      return;
    }
    
    // Call the edge function to increment the vendor stat
    const response = await fetch(
      'https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/increment_vendor_stat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          vendor_id: vendorId,
          stat_field: "orders_won"
        })
      }
    );
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error incrementing vendor order won stat:', result);
      toast.error('Failed to update vendor statistics');
      return;
    }
    
    console.log(`Successfully incremented orders_won for vendor ${vendorId}`);
    
    // Also update vendor_orders table to mark the order as processed
    try {
      const { data: quotationsData } = await supabase
        .from('vendor_quotations')
        .select('order_id')
        .eq('vendor_id', vendorId)
        .eq('status', 'accepted');
        
      if (quotationsData && quotationsData.length > 0) {
        for (const quotation of quotationsData) {
          const { error: orderError } = await supabase
            .from('vendor_orders')
            .upsert({
              vendor_id: vendorId,
              order_id: quotation.order_id,
              status: 'accepted'
            }, { onConflict: 'vendor_id,order_id' });
            
          if (orderError) {
            console.error('Error updating vendor order status:', orderError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating vendor orders:', error);
    }
  } catch (error) {
    console.error('Error incrementing vendor order won stat:', error);
    toast.error('Failed to update vendor statistics');
  }
};

/**
 * Helper function to update vendor statistics when they lose an order
 */
export const incrementVendorStatOrderLost = async (vendorId: string): Promise<void> => {
  try {
    console.log(`Incrementing order loss stat for vendor ${vendorId}`);
    
    if (!vendorId) {
      console.error("Invalid vendor ID provided to incrementVendorStatOrderLost");
      return;
    }
    
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken) {
      console.error("No access token available for auth");
      toast.error("Authentication error. Please sign in again.");
      return;
    }
    
    // Call the edge function to increment the vendor stat
    const response = await fetch(
      'https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/increment_vendor_stat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          vendor_id: vendorId,
          stat_field: "orders_lost"
        })
      }
    );
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error incrementing vendor order lost stat:', result);
      toast.error('Failed to update vendor statistics');
      return;
    }
    
    console.log(`Successfully incremented orders_lost for vendor ${vendorId}`);
    
    // Also update vendor_orders table to mark the order as rejected
    try {
      const { data: quotationsData } = await supabase
        .from('vendor_quotations')
        .select('order_id')
        .eq('vendor_id', vendorId)
        .eq('status', 'rejected');
        
      if (quotationsData && quotationsData.length > 0) {
        for (const quotation of quotationsData) {
          const { error: orderError } = await supabase
            .from('vendor_orders')
            .upsert({
              vendor_id: vendorId,
              order_id: quotation.order_id,
              status: 'rejected'
            }, { onConflict: 'vendor_id,order_id' });
            
          if (orderError) {
            console.error('Error updating vendor order status:', orderError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating vendor orders:', error);
    }
  } catch (error) {
    console.error('Error incrementing vendor order lost stat:', error);
    toast.error('Failed to update vendor statistics');
  }
};
