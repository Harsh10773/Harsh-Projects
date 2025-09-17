
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, ArrowRight, Calendar, Clock, CheckCircle, AlertCircle, Truck, Search, CircleCheck, CirclePlus, CircleX, Cpu, WrenchIcon, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the types for order tracking
type OrderStatus = 
  | "order_received"
  | "components_ordered" 
  | "components_received"
  | "pc_building" 
  | "pc_testing" 
  | "shipped" 
  | "delivered" 
  | "cancelled";

interface OrderUpdate {
  id: string;
  order_id: string;
  status: OrderStatus;
  message: string;
  update_date: string;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  customer_email: string;
  order_date: string;
  estimated_delivery: string;
  status: OrderStatus;
  updates?: OrderUpdate[];
  components?: string[];
}

// Demo tracking ID for convenience
const DEMO_TRACKING_ID = "NXB-2311-12345";

const Tracking = () => {
  const [trackingCode, setTrackingCode] = useState(DEMO_TRACKING_ID);
  const [orderInfo, setOrderInfo] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingCode) {
      toast.error("Please enter a tracking code");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Get the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_id', trackingCode)
        .single();
      
      if (orderError || !orderData) {
        setError("No order found with this tracking code. Please check and try again.");
        toast.error("Invalid tracking code");
        setOrderInfo(null);
        setIsLoading(false);
        return;
      }
      
      // Get order updates
      const { data: updatesData, error: updatesError } = await supabase
        .from('order_updates')
        .select('*')
        .eq('order_id', orderData.id)
        .order('update_date', { ascending: true });
      
      if (updatesError) {
        console.error('Error fetching order updates:', updatesError);
      }
      
      // Get order components
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('component_name')
        .eq('order_id', orderData.id);
      
      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
      }
      
      const components = orderItemsData ? orderItemsData.map(item => item.component_name) : [];
      
      // Combine data and ensure OrderStatus type is properly used
      const order: Order = {
        ...orderData,
        // Cast the status to OrderStatus type
        status: orderData.status as OrderStatus,
        // Map the updates to ensure status is typed as OrderStatus
        updates: updatesData ? updatesData.map(update => ({
          ...update,
          status: update.status as OrderStatus
        })) : [],
        components: components
      };
      
      setOrderInfo(order);
      toast.success("Order found!");
      
    } catch (error) {
      console.error('Error tracking order:', error);
      setError("An error occurred while fetching order data. Please try again.");
      toast.error("Failed to fetch order data");
      setOrderInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "order_received":
        return <CircleCheck className="h-5 w-5 text-blue-500" />;
      case "components_ordered":
        return <CirclePlus className="h-5 w-5 text-blue-400" />;
      case "components_received":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "pc_building":
        return <WrenchIcon className="h-5 w-5 text-purple-500" />;
      case "pc_testing":
        return <Zap className="h-5 w-5 text-purple-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-green-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <CircleX className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case "order_received":
      case "components_ordered":
      case "components_received":
        return "bg-blue-100 text-blue-800";
      case "pc_building":
      case "pc_testing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "order_received":
        return "Order Received";
      case "components_ordered":
        return "Components Ordered";
      case "components_received":
        return "Components Received";
      case "pc_building":
        return "PC Building";
      case "pc_testing":
        return "PC Testing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown Status";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-24 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Package className="h-16 w-16 mx-auto mb-6 text-accent" />
              <h1 className="text-4xl font-bold text-primary mb-4">Track Your Order</h1>
              <p className="text-lg text-foreground/80 mb-8">
                Enter your tracking code to check the current status of your custom PC build.
              </p>
              
              <form onSubmit={handleTrackingSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Enter tracking code (e.g., NXB-2311-12345)"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.trim())}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Track Order"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              
              <p className="text-sm text-muted-foreground">
                Demo tracking code: <code className="bg-muted p-1 rounded">{DEMO_TRACKING_ID}</code>
              </p>
            </div>
          </div>
        </section>
        
        {/* Results Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {error && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
              
              {orderInfo && (
                <div className="space-y-8">
                  <Card className="border-accent/30 bg-card shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-xl">Order #{orderInfo.tracking_id}</CardTitle>
                          <CardDescription>
                            Ordered on {formatDate(orderInfo.order_date)}
                          </CardDescription>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(orderInfo.status)}`}>
                          {getStatusLabel(orderInfo.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                          <p className="text-foreground/80">{orderInfo.customer_name}</p>
                          <p className="text-foreground/80">{orderInfo.customer_email}</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">Delivery Information</h3>
                          <div className="flex items-center text-foreground/80 gap-1 mb-1">
                            <Calendar className="h-4 w-4 text-accent" />
                            <span>Order Date: {formatDate(orderInfo.order_date)}</span>
                          </div>
                          <div className="flex items-center text-foreground/80 gap-1">
                            <Calendar className="h-4 w-4 text-accent" />
                            <span>Estimated Delivery: {formatDate(orderInfo.estimated_delivery)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {orderInfo.components && orderInfo.components.length > 0 && (
                        <>
                          <Separator className="my-6" />
                          
                          <h3 className="text-lg font-medium mb-4">Your Custom PC Components</h3>
                          <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                            {orderInfo.components.map((component, index) => (
                              <li key={index}>{component}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      
                      {orderInfo.updates && orderInfo.updates.length > 0 && (
                        <>
                          <Separator className="my-6" />
                          
                          <h3 className="text-lg font-medium mb-4">Order Timeline</h3>
                          <div className="space-y-6">
                            {orderInfo.updates.map((update, index) => (
                              <div key={index} className="relative pl-8">
                                <div className="absolute left-0 top-1">
                                  {getStatusIcon(update.status as OrderStatus)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{getStatusLabel(update.status as OrderStatus)}</p>
                                    <span className="text-sm text-muted-foreground">
                                      {formatDate(update.update_date)}
                                    </span>
                                  </div>
                                  <p className="text-foreground/80 mt-1">{update.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      
                      {/* Order Progress Bar */}
                      <Separator className="my-6" />
                      <h3 className="text-lg font-medium mb-4">Order Progress</h3>
                      <div className="relative pt-8">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-medium">Order Received</span>
                          <span className="text-xs font-medium">Components</span>
                          <span className="text-xs font-medium">PC Building</span>
                          <span className="text-xs font-medium">Shipping</span>
                          <span className="text-xs font-medium">Delivered</span>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-700">
                          {/* Progress determination based on status */}
                          {(() => {
                            const statuses = ["order_received", "components_ordered", "components_received", "pc_building", "pc_testing", "shipped", "delivered"];
                            const currentStatusIndex = statuses.indexOf(orderInfo.status);
                            const percentage = Math.min(((currentStatusIndex + 1) / statuses.length) * 100, 100);
                            
                            return (
                              <div 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent"
                                style={{ width: `${percentage}%` }}>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      
                    </CardContent>
                  </Card>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
                    <h3 className="flex items-center text-lg font-medium mb-2">
                      <InfoIcon className="h-5 w-5 mr-2" />
                      Need Help?
                    </h3>
                    <p>
                      If you have questions about your order, please contact our support team at{" "}
                      <a href="mailto:hi.assemblie@gmail.com" className="text-accent font-medium">
                        hi.assemblie@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

// Info icon component
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export default Tracking;
