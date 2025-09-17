import React, { useState, useEffect } from "react";
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
  AlertCircle, 
  Check, 
  Clock, 
  Loader2, 
  Package, 
  RefreshCw, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import OrderQuotationForm from "./OrderQuotationForm";
import { fetchOrderItems, fetchCustomerOrderedComponents } from "@/utils/orderItems";

interface ComponentDetail {
  name?: string;
  category?: string;
  cores?: string;
  clock_speed?: string;
  memory?: string;
  capacity?: string;
  speed?: string;
  type?: string;
  form_factor?: string;
  description?: string;
  brand?: string;
  model?: string;
  vram?: string;
  specs?: string;
  [key: string]: any;
}

interface OrderComponent {
  id: string;
  component_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  component_details?: ComponentDetail;
  component_id?: string;
  component_category?: string;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  order_date: string;
  updated_at: string;
  components?: OrderComponent[];
  quotation_status?: string;
}

interface OrderManagerProps {
  vendorId: string;
}

const OrderManager: React.FC<OrderManagerProps> = ({ vendorId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [processedOrderIds, setProcessedOrderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("new");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [componentsLoading, setComponentsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchProcessedOrders();
  }, [vendorId]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          tracking_id,
          customer_name,
          customer_email,
          status,
          order_date,
          updated_at
        `)
        .order('order_date', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      if (ordersData && ordersData.length > 0) {
        const ordersWithQuotationStatus = await Promise.all(
          ordersData.map(async (order) => {
            const { data: quotationData, error: quotationError } = await supabase
              .from('vendor_quotations')
              .select('status')
              .eq('vendor_id', vendorId)
              .eq('order_id', order.id)
              .maybeSingle();
              
            return {
              ...order,
              quotation_status: quotationData?.status || null
            };
          })
        );
        
        setOrders(ordersWithQuotationStatus);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessedOrders = async () => {
    try {
      const { data: vendorOrders, error: ordersError } = await supabase
        .from('vendor_orders')
        .select('order_id, status')
        .eq('vendor_id', vendorId);

      if (ordersError) {
        console.error("Error fetching processed orders:", ordersError);
        return;
      }
      
      const { data: quotations, error: quotationsError } = await supabase
        .from('vendor_quotations')
        .select('order_id')
        .eq('vendor_id', vendorId);
        
      if (quotationsError) {
        console.error("Error fetching quotations:", quotationsError);
        return;
      }
      
      const processedIds = new Set<string>();
      
      if (vendorOrders && vendorOrders.length > 0) {
        vendorOrders.forEach(order => processedIds.add(order.order_id));
      }
      
      if (quotations && quotations.length > 0) {
        quotations.forEach(quote => processedIds.add(quote.order_id));
      }
      
      setProcessedOrderIds(Array.from(processedIds));
    } catch (error) {
      console.error("Error in fetchProcessedOrders:", error);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchProcessedOrders();
    toast.info("Refreshing orders...");
  };

  const handleOpenOrder = async (order: Order) => {
    setSelectedOrder(order);
    
    try {
      setComponentsLoading(true);
      
      const response = await fetch(
        "https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/get_vendor_component_quotations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            vendor_id_param: vendorId,
            order_id_param: order.id,
          }),
        }
      );
      
      if (response.ok) {
        const componentData = await response.json();
        console.log("Component data from API:", componentData);
        
        if (Array.isArray(componentData) && componentData.length > 0) {
          const transformedComponents: OrderComponent[] = componentData.map(comp => ({
            id: comp.order_item_id || comp.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            component_name: comp.component_name,
            quantity: comp.quantity || 1,
            unit_price: comp.unit_price || comp.price_at_time || 0,
            total_price: comp.total_price || (comp.unit_price ? comp.unit_price * (comp.quantity || 1) : 0),
            component_details: (comp.component_details as ComponentDetail) || { 
              name: comp.component_name,
              category: comp.component_category || 'component'
            },
            component_id: comp.component_id,
            component_category: comp.component_category
          }));
          
          setSelectedOrder({
            ...order,
            components: transformedComponents
          });
          
          console.log("Components loaded from API:", transformedComponents);
          setComponentsLoading(false);
          return;
        }
      }
      
      const components = await fetchCustomerOrderedComponents(order.id);
      
      if (components && components.length > 0) {
        const transformedComponents: OrderComponent[] = components.map(comp => ({
          id: comp.id,
          component_name: comp.component_name,
          quantity: comp.quantity,
          unit_price: comp.unit_price,
          total_price: comp.total_price,
          component_details: (comp.component_details as unknown) as ComponentDetail,
          component_id: comp.component_id,
          component_category: comp.component_category
        }));
        
        setSelectedOrder({
          ...order,
          components: transformedComponents
        });
        console.log("Found components from customer_ordered_components:", transformedComponents);
      } else {
        const items = await fetchOrderItems(order.id);
        if (items && items.length > 0) {
          const transformedItems: OrderComponent[] = items.map(item => ({
            id: item.id,
            component_name: item.component_name,
            quantity: item.quantity,
            unit_price: item.price_at_time || 0,
            total_price: (item.price_at_time || 0) * item.quantity,
            component_details: item.component_details as ComponentDetail,
            component_id: item.component_id
          }));
          
          setSelectedOrder({
            ...order,
            components: transformedItems
          });
          console.log("Found components from order_items:", transformedItems);
        } else {
          const { data: userBuilds, error: userBuildsError } = await supabase
            .from('user_builds')
            .select('*')
            .eq('build_id', order.id);
          
          if (!userBuildsError && userBuilds && userBuilds.length > 0) {
            const transformedBuilds: OrderComponent[] = userBuilds.map(build => ({
              id: build.id,
              component_name: build.model_name,
              quantity: build.quantity,
              unit_price: build.price || 0,
              total_price: (build.price || 0) * build.quantity,
              component_details: {
                name: build.model_name,
                category: build.component_type,
                description: build.model_name
              },
              component_id: null
            }));
            
            setSelectedOrder({
              ...order,
              components: transformedBuilds
            });
            console.log("Found components from user_builds:", transformedBuilds);
          } else {
            const fallbackComponent: OrderComponent = {
              id: `fallback-${order.id}`,
              component_name: "Complete Computer Build",
              quantity: 1,
              unit_price: 0,
              total_price: 0,
              component_details: {
                name: "Complete Computer Build",
                category: "System",
                description: "Complete computer build as requested by customer"
              }
            };
            
            setSelectedOrder({
              ...order,
              components: [fallbackComponent]
            });
            console.log("No components found, using fallback component");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order components:", error);
      toast.error("Failed to load order components");
      
      const fallbackComponent: OrderComponent = {
        id: `fallback-${order.id}`,
        component_name: "Complete Computer Build",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        component_details: {
          name: "Complete Computer Build",
          category: "System",
          description: "Complete computer build as requested by customer"
        }
      };
      
      setSelectedOrder({
        ...order,
        components: [fallbackComponent]
      });
    } finally {
      setComponentsLoading(false);
    }
  };

  const handleToggleComponents = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    
    setExpandedOrderId(orderId);
    
    const order = orders.find(o => o.id === orderId);
    if (!order || order.components) return;
    
    try {
      setComponentsLoading(true);
      
      const response = await fetch(
        "https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/get_vendor_component_quotations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            vendor_id_param: vendorId,
            order_id_param: orderId,
          }),
        }
      );
      
      if (response.ok) {
        const componentData = await response.json();
        console.log("Component data from API:", componentData);
        
        if (Array.isArray(componentData) && componentData.length > 0) {
          setOrders(prevOrders => prevOrders.map(o => {
            if (o.id === orderId) {
              const transformedComponents: OrderComponent[] = componentData.map(comp => ({
                id: comp.order_item_id || comp.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
                component_name: comp.component_name,
                quantity: comp.quantity || 1,
                unit_price: comp.unit_price || comp.price_at_time || 0,
                total_price: comp.total_price || (comp.unit_price ? comp.unit_price * (comp.quantity || 1) : 0),
                component_details: (comp.component_details as ComponentDetail) || { 
                  name: comp.component_name,
                  category: comp.component_category || 'component'
                },
                component_id: comp.component_id,
                component_category: comp.component_category
              }));
              
              return {
                ...o,
                components: transformedComponents
              };
            }
            return o;
          }));
          
          console.log("Components loaded from API for toggle view");
          setComponentsLoading(false);
          return;
        }
      }
      
      const components = await fetchCustomerOrderedComponents(orderId);
      
      if (components && components.length > 0) {
        setOrders(prevOrders => prevOrders.map(o => {
          if (o.id === orderId) {
            const transformedComponents: OrderComponent[] = components.map(comp => ({
              id: comp.id,
              component_name: comp.component_name,
              quantity: comp.quantity,
              unit_price: comp.unit_price,
              total_price: comp.total_price,
              component_details: (comp.component_details as unknown) as ComponentDetail,
              component_id: comp.component_id,
              component_category: comp.component_category
            }));
            
            return {
              ...o,
              components: transformedComponents
            };
          }
          return o;
        }));
        console.log("Found components from customer_ordered_components for toggle:", components);
      } else {
        const items = await fetchOrderItems(orderId);
        if (items && items.length > 0) {
          setOrders(prevOrders => prevOrders.map(o => {
            if (o.id === orderId) {
              const transformedItems: OrderComponent[] = items.map(item => ({
                id: item.id,
                component_name: item.component_name,
                quantity: item.quantity,
                unit_price: item.price_at_time || 0,
                total_price: (item.price_at_time || 0) * item.quantity,
                component_details: item.component_details as ComponentDetail,
                component_id: item.component_id
              }));
              
              return {
                ...o,
                components: transformedItems
              };
            }
            return o;
          }));
          console.log("Found components from order_items for toggle:", items);
        } else {
          const { data: userBuilds, error: userBuildsError } = await supabase
            .from('user_builds')
            .select('*')
            .eq('build_id', orderId);
          
          if (!userBuildsError && userBuilds && userBuilds.length > 0) {
            setOrders(prevOrders => prevOrders.map(o => {
              if (o.id === orderId) {
                const transformedBuilds: OrderComponent[] = userBuilds.map(build => ({
                  id: build.id,
                  component_name: build.model_name,
                  quantity: build.quantity,
                  unit_price: build.price || 0,
                  total_price: (build.price || 0) * build.quantity,
                  component_details: {
                    name: build.model_name,
                    category: build.component_type,
                    description: build.model_name
                  },
                  component_id: null
                }));
                
                return {
                  ...o,
                  components: transformedBuilds
                };
              }
              return o;
            }));
            console.log("Found components from user_builds for toggle:", userBuilds);
          } else {
            const fallbackComponent: OrderComponent = {
              id: `fallback-${orderId}`,
              component_name: "Complete Computer Build",
              quantity: 1,
              unit_price: 0,
              total_price: 0,
              component_details: {
                name: "Complete Computer Build",
                category: "System",
                description: "Complete computer build as requested by customer"
              }
            };
            
            setOrders(prevOrders => prevOrders.map(o => 
              o.id === orderId ? { ...o, components: [fallbackComponent] } : o
            ));
            console.log("No components found, using fallback component for toggle");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order components:", error);
      toast.error("Failed to load order components");
      
      const fallbackComponent: OrderComponent = {
        id: `fallback-${orderId}`,
        component_name: "Complete Computer Build",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        component_details: {
          name: "Complete Computer Build",
          category: "System",
          description: "Complete computer build as requested by customer"
        }
      };
      
      setOrders(prevOrders => prevOrders.map(o => 
        o.id === orderId ? { ...o, components: [fallbackComponent] } : o
      ));
    } finally {
      setComponentsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || "Unknown"}
          </span>
        );
    }
  };

  const getQuotationStatusBadge = (status: string) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case "accepted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Quotation Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Quotation Rejected
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Quotation Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getComponentSpecs = (component: OrderComponent) => {
    if (!component.component_details) return null;
    
    const details = component.component_details as ComponentDetail;
    const specs = [];
    
    if (details.description) {
      return details.description;
    }
    
    if (details.category === 'CPU' || details.category?.toLowerCase().includes('processor')) {
      if (details.cores) specs.push(`${details.cores} cores`);
      if (details.clock_speed) specs.push(`${details.clock_speed} clock speed`);
    } else if (details.category === 'Graphics Card' || details.category?.toLowerCase().includes('graphics')) {
      if (details.memory) specs.push(`${details.memory} VRAM`);
    } else if (details.category === 'Memory' || details.category?.toLowerCase().includes('memory')) {
      if (details.capacity) specs.push(`${details.capacity} capacity`);
      if (details.speed) specs.push(`${details.speed} speed`);
    } else if (details.category === 'Storage' || details.category?.toLowerCase().includes('storage')) {
      if (details.capacity) specs.push(`${details.capacity} capacity`);
      if (details.type) specs.push(`${details.type}`);
    } else if (details.category === 'Motherboard' || details.category?.toLowerCase().includes('motherboard')) {
      if (details.form_factor) specs.push(`${details.form_factor} form factor`);
    }
    
    return specs.length > 0 ? specs.join(' | ') : null;
  };

  const renderComponentDetails = (component: OrderComponent) => {
    const details = component.component_details as ComponentDetail;
    return (
      <>
        <div className="font-medium">{component.component_name}</div>
        {details && (
          <div className="text-xs text-muted-foreground mt-1">
            {details.category || component.component_category || 'Component'}
          </div>
        )}
      </>
    );
  };

  const fetchOrderDetails = async (order: Order) => {
    try {
      const customerComponents = await fetchCustomerOrderedComponents(order.id);
      
      if (customerComponents && customerComponents.length > 0) {
        const transformedComponents: OrderComponent[] = customerComponents.map(comp => ({
          id: comp.id,
          component_name: comp.component_name,
          quantity: comp.quantity,
          unit_price: comp.unit_price,
          total_price: comp.total_price,
          component_details: (comp.component_details as unknown) as ComponentDetail,
          component_id: comp.component_id,
          component_category: comp.component_category
        }));
        
        setSelectedOrder(prev => prev ? {
          ...prev,
          components: transformedComponents
        } : null);
        
        return; // Exit after finding customer components
      }
      
      const response = await fetch(
        "https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/get_vendor_component_quotations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            vendor_id_param: vendorId,
            order_id_param: order.id,
          }),
        }
      );
      
      if (response.ok) {
        const componentData = await response.json();
        console.log("Component data from API:", componentData);
        
        if (Array.isArray(componentData) && componentData.length > 0) {
          const transformedComponents: OrderComponent[] = componentData.map(comp => ({
            id: comp.order_item_id || comp.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            component_name: comp.component_name,
            quantity: comp.quantity || 1,
            unit_price: comp.unit_price || comp.price_at_time || 0,
            total_price: comp.total_price || (comp.unit_price ? comp.unit_price * (comp.quantity || 1) : 0),
            component_details: (comp.component_details as ComponentDetail) || { 
              name: comp.component_name,
              category: comp.component_category || 'component'
            },
            component_id: comp.component_id,
            component_category: comp.component_category
          }));
          
          setSelectedOrder({
            ...order,
            components: transformedComponents
          });
          
          console.log("Components loaded from API:", transformedComponents);
          setComponentsLoading(false);
          return;
        }
      }
      
      const items = await fetchOrderItems(order.id);
      if (items && items.length > 0) {
        const transformedItems: OrderComponent[] = items.map(item => ({
          id: item.id,
          component_name: item.component_name,
          quantity: item.quantity,
          unit_price: item.price_at_time || 0,
          total_price: (item.price_at_time || 0) * item.quantity,
          component_details: item.component_details as ComponentDetail,
          component_id: item.component_id
        }));
        
        setSelectedOrder({
          ...order,
          components: transformedItems
        });
        console.log("Found components from order_items:", transformedItems);
      } else {
        const { data: userBuilds, error: userBuildsError } = await supabase
          .from('user_builds')
          .select('*')
          .eq('build_id', order.id);
        
        if (!userBuildsError && userBuilds && userBuilds.length > 0) {
          const transformedBuilds: OrderComponent[] = userBuilds.map(build => ({
            id: build.id,
            component_name: build.model_name,
            quantity: build.quantity,
            unit_price: build.price || 0,
            total_price: (build.price || 0) * build.quantity,
            component_details: {
              name: build.model_name,
              category: build.component_type,
              description: build.model_name
            },
            component_id: null
          }));
          
          setSelectedOrder({
            ...order,
            components: transformedBuilds
          });
          console.log("Found components from user_builds:", transformedBuilds);
        } else {
          const fallbackComponent: OrderComponent = {
            id: `fallback-${order.id}`,
            component_name: "Complete Computer Build",
            quantity: 1,
            unit_price: 0,
            total_price: 0,
            component_details: {
              name: "Complete Computer Build",
              category: "System",
              description: "Complete computer build as requested by customer"
            }
          };
          
          setSelectedOrder({
            ...order,
            components: [fallbackComponent]
          });
          console.log("No components found, using fallback component");
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.tracking_id.toLowerCase().includes(searchLower) ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.customer_email.toLowerCase().includes(searchLower)
    );
  });

  const newOrders = filteredOrders.filter(
    (order) => !processedOrderIds.includes(order.id) || 
               (order.quotation_status === 'pending')
  );
  
  const processedOrders = filteredOrders.filter(
    (order) => processedOrderIds.includes(order.id) && 
               (order.quotation_status === 'accepted' || order.quotation_status === 'rejected')
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>View and respond to order requests</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by ID, customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="new">
                New Orders ({newOrders.length})
              </TabsTrigger>
              <TabsTrigger value="processed">
                Processed Orders ({processedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span>Loading orders...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-red-500">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : newOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No new orders available
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Quotation</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <TableRow>
                            <TableCell className="font-medium">
                              {order.tracking_id}
                            </TableCell>
                            <TableCell>
                              <div>{order.customer_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {order.customer_email}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(order.order_date)}
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              {getQuotationStatusBadge(order.quotation_status || '')}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleComponents(order.id)}
                              >
                                <Package className="h-4 w-4 mr-1" />
                                {expandedOrderId === order.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              {!order.quotation_status && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleOpenOrder(order)}
                                >
                                  Quote
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                          
                          {expandedOrderId === order.id && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/20 p-0">
                                <div className="p-4">
                                  <h4 className="font-medium mb-2">Order Components</h4>
                                  
                                  {componentsLoading ? (
                                    <div className="flex justify-center items-center py-4">
                                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                                      <span>Loading components...</span>
                                    </div>
                                  ) : order.components && order.components.length > 0 ? (
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Component</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead className="text-right">Unit Price</TableHead>
                                          <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {order.components.map((component) => (
                                          <TableRow key={component.id}>
                                            <TableCell>
                                              {renderComponentDetails(component)}
                                            </TableCell>
                                            <TableCell>{component.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(component.unit_price)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(component.total_price)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  ) : (
                                    <p className="text-center text-muted-foreground py-2">No component data available</p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="processed" className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span>Loading orders...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-red-500">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : processedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No processed orders found
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Quotation</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <TableRow>
                            <TableCell className="font-medium">
                              {order.tracking_id}
                            </TableCell>
                            <TableCell>
                              <div>{order.customer_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {order.customer_email}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(order.order_date)}
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              {getQuotationStatusBadge(order.quotation_status || '')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleComponents(order.id)}
                              >
                                <Package className="h-4 w-4 mr-1" />
                                {expandedOrderId === order.id ? "Hide" : "View"}
                              </Button>
                            </TableCell>
                          </TableRow>
                          
                          {expandedOrderId === order.id && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/20 p-0">
                                <div className="p-4">
                                  <h4 className="font-medium mb-2">Order Components</h4>
                                  
                                  {componentsLoading ? (
                                    <div className="flex justify-center items-center py-4">
                                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                                      <span>Loading components...</span>
                                    </div>
                                  ) : order.components && order.components.length > 0 ? (
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Component</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead className="text-right">Unit Price</TableHead>
                                          <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {order.components.map((component) => (
                                          <TableRow key={component.id}>
                                            <TableCell>
                                              {renderComponentDetails(component)}
                                            </TableCell>
                                            <TableCell>{component.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(component.unit_price)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(component.total_price)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  ) : (
                                    <p className="text-center text-muted-foreground py-2">No component data available</p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null);
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Quotation</DialogTitle>
              <DialogDescription>
                Submit your quote for order {selectedOrder.tracking_id}
              </DialogDescription>
            </DialogHeader>
            <OrderQuotationForm
              vendorId={vendorId}
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onSubmitSuccess={() => {
                setSelectedOrder(null);
                fetchProcessedOrders();
                fetchOrders();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default OrderManager;
