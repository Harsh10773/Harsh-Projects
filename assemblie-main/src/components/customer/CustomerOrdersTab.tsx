import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Calendar, Package, FileDown, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';

export interface Order {
  id: string;
  created_at: string;
  status: string;
  total_price?: number;
  grand_total: number;
  tracking_id: string;
  // Add missing properties that are used in the component
  estimated_delivery: string;
  build_charge: number;
  shipping_charge: number;
  gst_amount: number;
  // Optional field that might be needed
  order_date?: string;
  // Add the components property that was missing and causing the error
  components?: any[];
}

interface CustomerOrdersTabProps {
  orders: Order[];
  isLoadingOrders: boolean;
}

const CustomerOrdersTab = ({ orders, isLoadingOrders }: CustomerOrdersTabProps) => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderComponents, setOrderComponents] = useState<Record<string, any[]>>({});
  const [invoices, setInvoices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrderDetails();
    }
  }, [user, orders]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      if (!orders.length) {
        setLoading(false);
        return;
      }
      
      // Fetch order items and invoices for all orders
      const orderIds = orders.map(order => order.id);
      await Promise.all([
        fetchOrderItemsForOrders(orderIds),
        fetchInvoicesForOrders(orderIds)
      ]);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItemsForOrders = async (orderIds: string[]) => {
    if (!orderIds.length) return;
    
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (error) throw error;

      if (data) {
        // Group components by order_id
        const componentsMap: Record<string, any[]> = {};
        
        data.forEach(item => {
          if (!componentsMap[item.order_id]) {
            componentsMap[item.order_id] = [];
          }
          componentsMap[item.order_id].push(item);
        });
        
        setOrderComponents(componentsMap);
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const fetchInvoicesForOrders = async (orderIds: string[]) => {
    if (!orderIds.length) return;
    
    try {
      const { data, error } = await supabase
        .from("tracking_files")
        .select("*")
        .in("order_id", orderIds)
        .eq("file_type", "invoice");

      if (error) throw error;

      if (data) {
        // Create a map of order_id to invoice URL
        const invoiceMap: Record<string, string> = {};
        
        data.forEach(file => {
          invoiceMap[file.order_id] = file.file_url;
        });
        
        setInvoices(invoiceMap);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const handleViewInvoice = (url: string) => {
    window.open(url, "_blank");
  };

  const handleTrackOrder = (trackingId: string) => {
    window.open(`/tracking?id=${trackingId}`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "order_placed":
      case "order_received":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoadingOrders || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No orders yet</h3>
        <p className="text-muted-foreground mt-2">
          When you place an order, it will appear here.
        </p>
        <Button className="mt-6" onClick={() => window.location.href = "/user"}>
          Build Your PC
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Your Orders</h3>
      
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <div 
            className="bg-muted p-4 cursor-pointer flex justify-between items-center"
            onClick={() => toggleOrderDetails(order.id)}
          >
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={`${getStatusColor(order.status)} text-white`}>
                {formatStatus(order.status)}
              </Badge>
              <div>
                <p className="font-medium">Order #{order.tracking_id}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                  {" "}
                  ({formatDistanceToNow(new Date(order.created_at), { addSuffix: true })})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatCurrency(order.grand_total)}</p>
              <p className="text-xs text-muted-foreground">
                {selectedOrder === order.id ? "Hide Details" : "View Details"}
              </p>
            </div>
          </div>
          
          {selectedOrder === order.id && (
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Order Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date:</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tracking ID:</span>
                      <span>{order.tracking_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className={`${getStatusColor(order.status)} text-white`}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Delivery:</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.estimated_delivery).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Components Total:</span>
                      <span>
                        {formatCurrency(order.grand_total - order.build_charge - order.shipping_charge - order.gst_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Build Charge:</span>
                      <span>{formatCurrency(order.build_charge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span>{formatCurrency(order.shipping_charge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (18%):</span>
                      <span>{formatCurrency(order.gst_amount)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(order.grand_total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {orderComponents[order.id] && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Components</h4>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {orderComponents[order.id].map((component, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground mr-1">{component.component_name}:</span>
                          <span className="font-medium">
                            {component.price_at_time > 0 && `${formatCurrency(component.price_at_time)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => handleTrackOrder(order.tracking_id)}
                >
                  <ExternalLink className="h-4 w-4" /> Track Order
                </Button>
                
                {invoices[order.id] && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleViewInvoice(invoices[order.id])}
                  >
                    <FileDown className="h-4 w-4" /> View Invoice
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default CustomerOrdersTab;
