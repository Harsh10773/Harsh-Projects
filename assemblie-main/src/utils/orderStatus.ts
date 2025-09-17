
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OrderStatus } from "./trackingSystem";

/**
 * Updates the status of an order in both the orders table and creates a record in order_updates
 * @param orderId The database ID of the order
 * @param status The new status to set
 * @param message The message explaining the status update
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  message: string
): Promise<boolean> => {
  try {
    console.log(`Updating order ${orderId} status to ${status} with message: ${message}`);
    
    // Get current session for authentication
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    
    if (!accessToken) {
      console.error('No access token available for auth');
      toast.error('Authentication error. Please sign in again.');
      return false;
    }
    
    // Call the edge function to update order status (bypasses RLS)
    const response = await fetch(
      'https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/create_order_update',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          order_id: orderId,
          status: status,
          message: message
        })
      }
    );
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('Error updating order status via Edge Function:', result);
      toast.error('Failed to update order status');
      return false;
    }
    
    toast.success('Order status updated successfully');
    return true;
    
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    toast.error('Failed to update order status');
    return false;
  }
};
