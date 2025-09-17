
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { TruckIcon, RefreshCw, CheckCircle2, Clock, Loader2, XCircle, Package, Wrench, TestTube } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { OrderStatus, getDefaultMessageForStatus } from '@/utils/trackingSystem';
import { updateOrderStatus } from '@/utils/orderStatus';

interface OrderUpdate {
  id: string;
  order_id: string;
  status: string;
  message: string;
  update_date: string;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  order_date: string;
  estimated_delivery: string;
}

const AdminOrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateHistory, setUpdateHistory] = useState<OrderUpdate[]>([]);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('order_received');
  const [updateMessage, setUpdateMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched orders:', data);
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderUpdates = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_updates')
        .select('*')
        .eq('order_id', orderId)
        .order('update_date', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched order updates:', data);
      setUpdateHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching order updates:', error);
      toast.error('Failed to load order update history');
    }
  };

  const handleViewUpdates = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderUpdates(order.id);
  };

  const handleUpdateOrder = (order: Order) => {
    setSelectedOrder(order);
    const defaultMessage = getDefaultMessageForStatus(getNextStatus(order.status));
    setNewStatus(getNextStatus(order.status));
    setUpdateMessage(defaultMessage);
    setShowUpdateDialog(true);
  };

  const getNextStatus = (currentStatus: string): OrderStatus => {
    const statusFlow: OrderStatus[] = [
      'order_received',
      'components_ordered',
      'components_received',
      'pc_building',
      'pc_testing',
      'shipped',
      'delivered'
    ];

    const currentIndex = statusFlow.indexOf(currentStatus as OrderStatus);
    
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return 'processing'; // Default if we can't determine next status
    }
    
    return statusFlow[currentIndex + 1];
  };

  const getDefaultMessageForStatus = (status: OrderStatus): string => {
    switch(status) {
      case 'order_received': 
        return 'Your order has been received and is being processed.';
      case 'components_ordered': 
        return 'Components for your build have been ordered from our suppliers.';
      case 'components_received': 
        return 'All components for your build have arrived at our workshop.';
      case 'pc_building': 
        return 'Your PC build is now in progress by our expert technicians.';
      case 'pc_testing': 
        return 'Your PC is undergoing our rigorous testing process to ensure everything works perfectly.';
      case 'shipped': 
        return 'Your PC has been shipped and is on its way to you.';
      case 'delivered': 
        return 'Your PC has been delivered. Enjoy your new build!';
      case 'cancelled': 
        return 'Your order has been cancelled.';
      default:
        return 'Your order status has been updated.';
    }
  };

  const handleSubmitUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      setIsSubmitting(true);
      
      const success = await updateOrderStatus(
        selectedOrder.id,
        newStatus,
        updateMessage
      );
      
      if (!success) {
        throw new Error('Failed to update order status');
      }
      
      toast.success('Order status updated successfully');
      setShowUpdateDialog(false);
      
      // Refresh orders and order history
      setRefreshTrigger(prev => prev + 1);
      if (selectedOrder) {
        fetchOrderUpdates(selectedOrder.id);
      }
      
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'shipped':
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'pc_testing':
        return "bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'pc_building':
        return "bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'components_received':
        return "bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'components_ordered':
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'order_received':
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'cancelled':
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4 text-blue-600" />;
      case 'pc_testing':
        return <TestTube className="h-4 w-4 text-purple-600" />;
      case 'pc_building':
        return <Wrench className="h-4 w-4 text-indigo-600" />;
      case 'components_received':
        return <Package className="h-4 w-4 text-teal-600" />;
      case 'components_ordered':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'order_received':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatOrderStatus = (status: string) => {
    if (!status) return 'Unknown';
    
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Order Tracking Management</CardTitle>
            <CardDescription>Update and track the status of customer orders</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRefreshTrigger(prev => prev + 1)} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : (
            <div className="border border-border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Estimated Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>{order.tracking_id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                        </TableCell>
                        <TableCell>{formatDate(order.order_date)}</TableCell>
                        <TableCell>{formatDate(order.estimated_delivery)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={getStatusBadgeClass(order.status)}>
                              {formatOrderStatus(order.status)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewUpdates(order)}
                            >
                              History
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleUpdateOrder(order)}
                              disabled={order.status === 'delivered' || order.status === 'cancelled'}
                            >
                              Update Status
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                          <TruckIcon className="h-8 w-8 text-muted-foreground" />
                          <p>No orders found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the tracking status for order {selectedOrder?.tracking_id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => {
                  setNewStatus(value as OrderStatus);
                  setUpdateMessage(getDefaultMessageForStatus(value as OrderStatus));
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_received">Order Received</SelectItem>
                  <SelectItem value="components_ordered">Components Ordered</SelectItem>
                  <SelectItem value="components_received">Components Received</SelectItem>
                  <SelectItem value="pc_building">PC Building</SelectItem>
                  <SelectItem value="pc_testing">PC Testing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Update Message</Label>
              <Textarea
                id="message"
                placeholder="Provide details about this status update"
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitUpdate}
              disabled={isSubmitting || !updateMessage.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedOrder !== null && !showUpdateDialog} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Update History</DialogTitle>
            <DialogDescription>
              Tracking updates for order {selectedOrder?.tracking_id}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {updateHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p>No updates found for this order</p>
              </div>
            ) : (
              <div className="space-y-4">
                {updateHistory.map((update) => (
                  <div key={update.id} className="border p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getStatusIcon(update.status)}
                        <span className={`ml-2 ${getStatusBadgeClass(update.status)}`}>
                          {formatOrderStatus(update.status)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(update.update_date)}
                      </span>
                    </div>
                    <p className="text-sm mt-2">{update.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setSelectedOrder(null)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminOrderTracking;
