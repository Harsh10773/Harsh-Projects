import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OrdersTable from "./OrdersTable";
import OrderDetailsDialog from "./OrderDetailsDialog";
import { fetchOrderItems } from "@/utils/orderItems";

interface OrderItem {
  id: string;
  component_name: string;
  quantity: number;
  price_at_time: number;
  component_id?: string;
  component_details?: any;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  customer_email: string;
  order_date: string;
  status: string;
  grand_total: number;
  estimated_delivery?: string;
  items?: OrderItem[];
  customer_address?: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching orders...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });
      
      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setError('Failed to load orders');
        throw ordersError;
      }
      
      console.log('Orders data:', ordersData);
      
      if (!ordersData || ordersData.length === 0) {
        console.log('No orders found');
        setOrders([]);
        setLoading(false);
        return;
      }
      
      const customerIds = ordersData.map((order: any) => order.customer_id).filter(Boolean);
      
      let customerProfiles: any = {};
      
      if (customerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('customer_profiles')
          .select('id, address, city, state, zipcode')
          .in('id', customerIds);
          
        if (profilesData) {
          profilesData.forEach((profile: any) => {
            customerProfiles[profile.id] = profile;
          });
        }
      }
      
      const orderIds = ordersData.map((order: any) => order.id);
      
      console.log('Fetching order items for order IDs:', orderIds);
      
      const allOrderItemsPromises = orderIds.map(async (orderId: string) => {
        const items = await fetchOrderItems(orderId);
        return { orderId, items };
      });
      
      const allOrderItemsResults = await Promise.all(allOrderItemsPromises);
      
      const orderItemsMap: Record<string, OrderItem[]> = {};
      allOrderItemsResults.forEach(({ orderId, items }) => {
        orderItemsMap[orderId] = items;
      });
      
      const formattedOrders = ordersData.map((order: any) => {
        const customerProfile = order.customer_id && customerProfiles[order.customer_id];
        let customerAddress = 'No address provided';
        
        if (customerProfile) {
          const addressParts = [
            customerProfile.address,
            customerProfile.city,
            customerProfile.state,
            customerProfile.zipcode
          ].filter(Boolean);
          
          if (addressParts.length > 0) {
            customerAddress = addressParts.join(', ');
          }
        }
        
        const orderItems = orderItemsMap[order.id] || [];
          
        return {
          id: order.id,
          tracking_id: order.tracking_id || 'N/A',
          customer_name: order.customer_name || 'Unknown Customer',
          customer_email: order.customer_email || 'No Email',
          order_date: order.order_date,
          status: order.status || 'pending',
          grand_total: order.grand_total || 0,
          estimated_delivery: order.estimated_delivery,
          customer_address: customerAddress,
          items: orderItems
        };
      });
      
      console.log('Formatted orders with items:', formattedOrders);
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (order: Order) => {
    setIsLoadingOrderDetails(true);
    setSelectedOrder(order); // Set selected order immediately with any existing items
    setIsDialogOpen(true);
    
    try {
      console.log('Fetching detailed order details with component names for order ID:', order.id);
      
      const items = await fetchOrderItems(order.id);
      
      console.log('Fresh order items with detailed component names for selected order:', items);
      
      if (items && items.length > 0) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          items: items
        } : null);
      } else {
        console.log('No items found for this order');
        setSelectedOrder(prev => prev ? {
          ...prev,
          items: []
        } : null);
      }
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing orders data...");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedOrder(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'processing':
      case 'order_received':
      case 'components_ordered':
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'cancelled':
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  const formatOrderStatus = (status: string) => {
    return status?.replace(/_/g, ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Unknown';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading orders...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-12 flex-col">
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <p className="text-red-500 mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      );
    }

    return (
      <OrdersTable 
        orders={orders} 
        onViewDetails={fetchOrderDetails}
        getStatusBadgeClass={getStatusBadgeClass}
        formatOrderStatus={formatOrderStatus}
      />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Customer Orders</CardTitle>
          <CardDescription>View and manage customer orders</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
      
      <OrderDetailsDialog 
        selectedOrder={selectedOrder}
        isOpen={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        isLoadingOrderDetails={isLoadingOrderDetails}
        getStatusBadgeClass={getStatusBadgeClass}
        formatOrderStatus={formatOrderStatus}
      />
    </Card>
  );
};

export default AdminOrders;
