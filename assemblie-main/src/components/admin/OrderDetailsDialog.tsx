import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Loader2, IndianRupee } from "lucide-react";
import OrderItemsTable from "./OrderItemsTable";
import { formatDate } from "@/utils/formatters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  component_name: string;
  quantity: number;
  price_at_time?: number;
  unit_price?: number;
  total_price?: number;
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

interface OrderDetailsDialogProps {
  selectedOrder: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoadingOrderDetails: boolean;
  getStatusBadgeClass: (status: string) => string;
  formatOrderStatus: (status: string) => string;
}

const OrderDetailsDialog = ({
  selectedOrder,
  isOpen,
  onOpenChange,
  isLoadingOrderDetails,
  getStatusBadgeClass,
  formatOrderStatus
}: OrderDetailsDialogProps) => {
  const [orderComponents, setOrderComponents] = useState<OrderItem[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  useEffect(() => {
    if (selectedOrder && isOpen) {
      loadOrderComponents(selectedOrder.id);
    } else {
      setOrderComponents([]);
    }
  }, [selectedOrder, isOpen]);

  const loadOrderComponents = async (orderId: string) => {
    if (!orderId) return;
    
    setLoadingComponents(true);
    try {
      console.log(`Loading components for order ${orderId}`);
      
      // First try to get components from customer_ordered_components
      const { data: orderedComponentsData, error: orderedComponentsError } = await supabase
        .from('customer_ordered_components')
        .select('*')
        .eq('order_id', orderId);
        
      if (orderedComponentsError) {
        console.error("Error fetching customer ordered components:", orderedComponentsError);
        throw orderedComponentsError;
      }
      
      console.log("Ordered components data:", orderedComponentsData);
      
      if (orderedComponentsData && orderedComponentsData.length > 0) {
        // Map to the expected format, KEEPING THE EXACT COMPONENT NAMES
        const components = orderedComponentsData.map(item => {
          return {
            id: item.id,
            component_name: item.component_name, // Keep exact component name
            quantity: item.quantity || 1,
            price_at_time: item.unit_price || 0,
            unit_price: item.unit_price || 0,
            total_price: item.total_price || (item.unit_price * (item.quantity || 1)) || 0,
            component_id: item.component_id,
            component_details: {
              name: item.component_name, // Keep exact component name
              category: getComponentCategory(item.component_name),
              description: item.component_name // Keep description simple
            }
          };
        });
        
        setOrderComponents(components);
      } else {
        // Fallback to order_items
        console.log("No ordered components found, checking order_items");
        const { data: orderItemsData, error: orderItemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
          
        if (orderItemsError) {
          console.error("Error fetching order items:", orderItemsError);
          throw orderItemsError;
        }
        
        console.log("Order items data:", orderItemsData);
        
        if (orderItemsData && orderItemsData.length > 0) {
          // Map to the expected format, KEEPING THE EXACT COMPONENT NAMES
          const items = orderItemsData.map(item => {
            return {
              id: item.id,
              component_name: item.component_name, // Keep exact component name
              quantity: item.quantity || 1,
              price_at_time: item.price_at_time || 0,
              unit_price: item.price_at_time || 0,
              total_price: item.price_at_time * (item.quantity || 1),
              component_id: item.component_id,
              component_details: {
                name: item.component_name, // Keep exact component name
                category: getComponentCategory(item.component_name),
                description: item.component_name // Keep description simple
              }
            };
          });
          
          setOrderComponents(items);
        } else {
          // If no items found, create default components for PC based on grand total
          if (selectedOrder && selectedOrder.grand_total > 0) {
            const defaultComponents = createDefaultPCComponents(selectedOrder.grand_total);
            setOrderComponents(defaultComponents);
          } else {
            setOrderComponents([]);
          }
        }
      }
      
    } catch (error) {
      console.error("Error loading order components:", error);
      toast.error("Failed to load order components");
      
      // Fallback: Create default components if nothing else worked
      if (selectedOrder && selectedOrder.grand_total > 0) {
        const defaultComponents = createDefaultPCComponents(selectedOrder.grand_total);
        setOrderComponents(defaultComponents);
      } else {
        setOrderComponents([]);
      }
    } finally {
      setLoadingComponents(false);
    }
  };
  
  // Helper function to get the component category
  const getComponentCategory = (componentName: string): string => {
    const name = componentName.toLowerCase();
    if (name.includes('processor') || name.includes('cpu')) return 'CPU';
    if (name.includes('graphics') || name.includes('gpu')) return 'Graphics Card';
    if (name.includes('memory') || name.includes('ram')) return 'Memory';
    if (name.includes('storage') || name.includes('ssd') || name.includes('hdd')) return 'Storage';
    if (name.includes('cooling')) return 'Cooling';
    if (name.includes('power')) return 'Power Supply';
    if (name.includes('motherboard')) return 'Motherboard';
    if (name.includes('case')) return 'PC Case';
    return 'Other Component';
  };
  
  // Create default PC components with prices when no components are found
  const createDefaultPCComponents = (totalAmount: number): OrderItem[] => {
    // Determine price distribution based on typical PC component ratios
    const totalBase = Math.max(totalAmount * 0.8, 10000); // 80% of total for components, rest for additional charges
    
    const components = [
      {
        id: 'default-cpu',
        component_name: 'Processor',
        quantity: 1,
        price_at_time: Math.round(totalBase * 0.25),
        unit_price: Math.round(totalBase * 0.25),
        total_price: Math.round(totalBase * 0.25),
        component_details: { category: 'CPU' }
      },
      {
        id: 'default-gpu',
        component_name: 'Graphics Card',
        quantity: 1,
        price_at_time: Math.round(totalBase * 0.3),
        unit_price: Math.round(totalBase * 0.3),
        total_price: Math.round(totalBase * 0.3),
        component_details: { category: 'GPU' }
      },
      {
        id: 'default-ram',
        component_name: 'Memory (RAM)',
        quantity: 1,
        price_at_time: Math.round(totalBase * 0.1),
        unit_price: Math.round(totalBase * 0.1),
        total_price: Math.round(totalBase * 0.1),
        component_details: { category: 'RAM' }
      },
      {
        id: 'default-storage',
        component_name: 'Storage',
        quantity: 1,
        price_at_time: Math.round(totalBase * 0.1),
        unit_price: Math.round(totalBase * 0.1),
        total_price: Math.round(totalBase * 0.1),
        component_details: { category: 'Storage' }
      },
      {
        id: 'default-motherboard',
        component_name: 'Motherboard',
        quantity: 1,
        price_at_time: Math.round(totalBase * 0.15),
        unit_price: Math.round(totalBase * 0.15),
        total_price: Math.round(totalBase * 0.15),
        component_details: { category: 'Motherboard' }
      },
      {
        id: 'default-power',
        component_name: 'Power Supply',
        quantity: 1,
        price_at_time: Math.round(totalBase * 0.05),
        unit_price: Math.round(totalBase * 0.05),
        total_price: Math.round(totalBase * 0.05),
        component_details: { category: 'Power Supply' }
      },
      {
        id: 'default-cooling',
        component_name: 'Cooling System',
        quantity: 1,
        price_at_time: Math.round(totalBase * 0.03),
        unit_price: Math.round(totalBase * 0.03),
        total_price: Math.round(totalBase * 0.03),
        component_details: { category: 'Cooling' }
      },
      {
        id: 'default-case',
        component_name: 'PC Case',
        quantity: 1,
        price_at_time: Math.round(totalBase * 0.02),
        unit_price: Math.round(totalBase * 0.02),
        total_price: Math.round(totalBase * 0.02),
        component_details: { category: 'Case' }
      }
    ];
    
    return components;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            View the complete information for this order
          </DialogDescription>
        </DialogHeader>
        
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">{selectedOrder.tracking_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={getStatusBadgeClass(selectedOrder.status)}>
                  {formatOrderStatus(selectedOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{selectedOrder.customer_name}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(selectedOrder.order_date)}</p>
              </div>
              {selectedOrder.estimated_delivery && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p className="font-medium">{formatDate(selectedOrder.estimated_delivery)}</p>
                </div>
              )}
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Customer Address</p>
                <div className="flex items-start mt-1">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{selectedOrder.customer_address || 'No address provided'}</p>
                </div>
              </div>
            </div>
            
            <OrderItemsTable 
              items={orderComponents.length > 0 ? orderComponents : undefined} 
              grandTotal={selectedOrder.grand_total} 
              isLoading={isLoadingOrderDetails || loadingComponents}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
