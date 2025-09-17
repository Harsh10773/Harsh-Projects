
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Loader2, Info, Cpu, HardDrive, Power, Fan, Layers, Package2, Microchip, MemoryStick } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ComponentDetail {
  name?: string;
  category?: string;
  description?: string;
  cores?: string;
  clock_speed?: string;
  memory?: string;
  capacity?: string;
  speed?: string;
  type?: string;
  form_factor?: string;
  brand?: string;
  model?: string;
  vram?: string;
  reference_id?: string;
  original_name?: string;
  [key: string]: any;
}

interface OrderComponent {
  id: string;
  component_name: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  component_details?: ComponentDetail;
  component_id?: string;
  component_category?: string;
}

interface Order {
  id: string;
  tracking_id: string;
  components?: OrderComponent[];
}

interface OrderQuotationFormProps {
  vendorId: string;
  order: Order;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const OrderQuotationForm: React.FC<OrderQuotationFormProps> = ({
  vendorId,
  order,
  onClose,
  onSubmitSuccess,
}) => {
  const [quotations, setQuotations] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderComponents, setOrderComponents] = useState<OrderComponent[]>([]);

  useEffect(() => {
    const fetchOrderComponents = async () => {
      setLoading(true);
      try {
        console.log(`Fetching components for order ${order.id}`);
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

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching order components:", errorData);
          throw new Error("Failed to fetch order components");
        }

        const componentData = await response.json();
        console.log("Component data from API:", componentData);
        
        if (Array.isArray(componentData) && componentData.length > 0) {
          const mappedComponents: OrderComponent[] = componentData.map(comp => {
            // Safely handle component details
            let displayName = comp.component_name;
            let fullModelName = '';
            let compDetails: ComponentDetail = {};
            
            // Check if component_details exists and is an object (not an array)
            if (comp.component_details && typeof comp.component_details === 'object' && !Array.isArray(comp.component_details)) {
              compDetails = comp.component_details as ComponentDetail;
              
              // First try to use the original name that was saved when user selected the component
              if (compDetails.original_name) {
                displayName = compDetails.original_name;
              }
              
              // Try to build a more descriptive component name
              if (compDetails.brand && compDetails.model) {
                fullModelName = `${compDetails.brand} ${compDetails.model}`;
                
                // Add specific details based on component category
                const category = comp.component_category?.toLowerCase() || compDetails.category?.toLowerCase() || '';
                
                if (category.includes('processor') || category.includes('cpu')) {
                  if (compDetails.cores) {
                    fullModelName += ` (${compDetails.cores} cores`;
                    if (compDetails.clock_speed) fullModelName += `, ${compDetails.clock_speed}GHz`;
                    fullModelName += ')';
                  }
                } else if (category.includes('graphics') || category.includes('gpu')) {
                  if (compDetails.vram || compDetails.memory) {
                    fullModelName += ` (${compDetails.vram || compDetails.memory}GB VRAM)`;
                  }
                } else if (category.includes('memory') || category.includes('ram')) {
                  if (compDetails.capacity && compDetails.speed) {
                    fullModelName += ` ${compDetails.capacity}GB ${compDetails.speed}MHz`;
                  }
                }
                
                // Use the detailed model name if we built one
                if (fullModelName) {
                  displayName = fullModelName;
                }
              }
            }
            
            return {
              id: comp.order_item_id || comp.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
              component_name: displayName,
              quantity: comp.quantity || 1,
              unit_price: comp.unit_price || comp.price_at_time || 0,
              total_price: comp.total_price || (comp.unit_price ? comp.unit_price * (comp.quantity || 1) : 0),
              component_details: compDetails,
              component_id: comp.component_id,
              component_category: comp.component_category
            };
          });
          
          setOrderComponents(mappedComponents);
          
          const initialQuotations: Record<string, number> = {};
          componentData.forEach((comp) => {
            initialQuotations[comp.order_item_id || comp.id] = comp.quoted_price || comp.unit_price || comp.price_at_time || 0;
          });
          setQuotations(initialQuotations);
        } else if (order.components && order.components.length > 0) {
          setOrderComponents(order.components);
          
          const initialQuotations: Record<string, number> = {};
          order.components.forEach((component) => {
            initialQuotations[component.id] = component.unit_price || 0;
          });
          setQuotations(initialQuotations);
        } else {
          const { data: customerComponents, error: componentsError } = await supabase
            .from("customer_ordered_components")
            .select("*")
            .eq("order_id", order.id);
            
          if (componentsError) {
            console.error("Error fetching customer ordered components:", componentsError);
            throw componentsError;
          }
          
          if (customerComponents && customerComponents.length > 0) {
            const mappedComponents: OrderComponent[] = customerComponents.map(comp => {
              // Safely handle component_details
              let compDetails: ComponentDetail = {};
              let displayName = comp.component_name;
              let fullModelName = '';
              
              if (comp.component_details && typeof comp.component_details === 'object' && !Array.isArray(comp.component_details)) {
                compDetails = comp.component_details as ComponentDetail;
                
                // Use original_name if available
                if (compDetails.original_name) {
                  displayName = compDetails.original_name;
                }
                
                // Build a detailed model name from component details
                if (compDetails.brand && compDetails.model) {
                  fullModelName = `${compDetails.brand} ${compDetails.model}`;
                  
                  // Add specific details based on component category
                  const category = comp.component_category?.toLowerCase() || compDetails.category?.toLowerCase() || '';
                  
                  if (category.includes('processor') || category.includes('cpu')) {
                    if (compDetails.cores) {
                      fullModelName += ` (${compDetails.cores} cores`;
                      if (compDetails.clock_speed) fullModelName += `, ${compDetails.clock_speed}GHz`;
                      fullModelName += ')';
                    }
                  } else if (category.includes('graphics') || category.includes('gpu')) {
                    if (compDetails.vram || compDetails.memory) {
                      fullModelName += ` (${compDetails.vram || compDetails.memory}GB VRAM)`;
                    }
                  } else if (category.includes('memory') || category.includes('ram')) {
                    if (compDetails.capacity && compDetails.speed) {
                      fullModelName += ` ${compDetails.capacity}GB ${compDetails.speed}MHz`;
                    }
                  }
                  
                  // Use the detailed model name if we built one
                  if (fullModelName) {
                    displayName = fullModelName;
                  }
                }
              }
              
              return {
                id: comp.id,
                component_name: displayName,
                quantity: comp.quantity || 1,
                unit_price: comp.unit_price || 0,
                total_price: comp.total_price || 0,
                component_details: compDetails,
                component_id: comp.component_id,
                component_category: comp.component_category
              };
            });
            
            setOrderComponents(mappedComponents);
            
            const initialQuotations: Record<string, number> = {};
            customerComponents.forEach((comp) => {
              initialQuotations[comp.id] = comp.unit_price || 0;
            });
            setQuotations(initialQuotations);
          } else {
            const fallbackComponent: OrderComponent = {
              id: `fallback-${order.id}`,
              component_name: "Complete Computer Build",
              quantity: 1,
              unit_price: 0,
              component_details: {
                name: "Complete Computer Build",
                category: "System",
                description: "Complete computer build as requested by customer",
                specs: "Full system build"
              }
            };
            setOrderComponents([fallbackComponent]);
            setQuotations({ [`fallback-${order.id}`]: 0 });
          }
        }
      } catch (error) {
        console.error("Error in fetchOrderComponents:", error);
        setError("Failed to load component data");
        
        if (order.components && order.components.length > 0) {
          setOrderComponents(order.components);
          const initialQuotations: Record<string, number> = {};
          order.components.forEach((component) => {
            initialQuotations[component.id] = component.unit_price || 0;
          });
          setQuotations(initialQuotations);
        } else {
          const fallbackComponent: OrderComponent = {
            id: `fallback-${order.id}`,
            component_name: "Complete Computer Build",
            quantity: 1,
            unit_price: 0,
            component_details: {
              name: "Complete Computer Build",
              category: "System",
              description: "Complete computer build as requested by customer",
              specs: "Full system build"
            }
          };
          setOrderComponents([fallbackComponent]);
          setQuotations({ [`fallback-${order.id}`]: 0 });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderComponents();
  }, [order.id, vendorId]);

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category?.toLowerCase() || '';
    if (lowerCategory.includes('processor') || lowerCategory.includes('cpu')) return <Cpu className="h-4 w-4" />;
    if (lowerCategory.includes('storage') || lowerCategory.includes('ssd') || lowerCategory.includes('hdd')) return <HardDrive className="h-4 w-4" />;
    if (lowerCategory.includes('memory') || lowerCategory.includes('ram')) return <MemoryStick className="h-4 w-4" />;
    if (lowerCategory.includes('power') || lowerCategory.includes('psu')) return <Power className="h-4 w-4" />;
    if (lowerCategory.includes('motherboard') || lowerCategory.includes('mobo')) return <Layers className="h-4 w-4" />;
    if (lowerCategory.includes('graphics') || lowerCategory.includes('gpu')) return <Microchip className="h-4 w-4" />;
    if (lowerCategory.includes('cooling') || lowerCategory.includes('fan')) return <Fan className="h-4 w-4" />;
    if (lowerCategory.includes('case')) return <Package2 className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  const handlePriceChange = (componentId: string, value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price)) {
      setQuotations((prev) => ({
        ...prev,
        [componentId]: price,
      }));
    }
  };

  const calculateTotal = () => {
    return orderComponents.reduce((sum, component) => {
      const price = quotations[component.id] || 0;
      return sum + price * (component.quantity || 1);
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!orderComponents || orderComponents.length === 0) {
        setError("No components to quote");
        return;
      }

      const allComponentsHavePrices = orderComponents.every(
        (component) => (quotations[component.id] || 0) > 0
      );

      if (!allComponentsHavePrices) {
        setError("Please provide a price for all components");
        return;
      }

      const totalQuotationPrice = calculateTotal();

      const componentPromises = orderComponents.map(async (component) => {
        const quotedPrice = quotations[component.id] || 0;

        const response = await fetch(
          "https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/insert_component_quote",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              vendorId,
              orderId: order.id,
              orderItemId: component.id,
              quotedPrice,
              componentName: component.component_name,
              quantity: component.quantity,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating component quote:", errorData);
          throw new Error(`Failed to create quote for ${component.component_name}`);
        }

        return true;
      });

      await Promise.all(componentPromises);

      const { error: quotationError } = await supabase.rpc(
        "submit_vendor_quotation",
        {
          vendor_id_param: vendorId,
          order_id_param: order.id,
          price_param: totalQuotationPrice,
        }
      );

      if (quotationError) {
        throw quotationError;
      }

      toast.success("Quotation submitted successfully");
      onSubmitSuccess();
    } catch (error) {
      console.error("Error submitting quotation:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit quotation"
      );
      toast.error("Failed to submit quotation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading component data...</span>
      </div>
    );
  }

  if (!orderComponents || orderComponents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
        <p className="text-center mb-4">
          No component data is available for this order. This could be due to:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground">
          <li>The order was created before component tracking was enabled</li>
          <li>The component data has not been saved correctly</li>
          <li>There's an issue with data synchronization</li>
        </ul>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-base font-medium">Order {order.tracking_id}</h3>
        <p className="text-xs text-muted-foreground">
          Enter your price quote for each component
        </p>

        <div className="max-h-[50vh] overflow-y-auto divide-y divide-border rounded-md border">
          {orderComponents.map((component) => {
            const details = component.component_details || {};
            const specs = [];
            
            if (details.specs) {
              specs.push(details.specs);
            } else {
              if (details.brand) specs.push(details.brand);
              if (details.model) specs.push(details.model);
              if (details.reference_id) specs.push(`Ref: ${details.reference_id}`);
              if (details.category?.toLowerCase().includes('processor')) {
                if (details.cores) specs.push(`${details.cores} cores`);
                if (details.clock_speed) specs.push(`${details.clock_speed}GHz`);
              }
              else if (details.category?.toLowerCase().includes('gpu') || details.category?.toLowerCase().includes('graphics')) {
                if (details.memory || details.vram) specs.push(`${details.memory || details.vram}GB VRAM`);
              }
              else if (details.category?.toLowerCase().includes('memory') || details.category?.toLowerCase().includes('ram')) {
                if (details.capacity) specs.push(`${details.capacity}GB`);
                if (details.speed) specs.push(`${details.speed}MHz`);
              }
              else if (details.category?.toLowerCase().includes('storage')) {
                if (details.capacity) specs.push(`${details.capacity}`);
                if (details.type) specs.push(details.type);
              }
              else if (details.category?.toLowerCase().includes('motherboard') || details.category?.toLowerCase().includes('mobo')) {
                if (details.form_factor) specs.push(`${details.form_factor}`);
                if (details.type) specs.push(details.type);
              }
              if (details.description && !specs.includes(details.description)) {
                specs.push(details.description);
              }
            }

            return (
              <div
                key={component.id}
                className="p-3 bg-background"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="bg-primary/10 p-1 rounded-full">
                        {getCategoryIcon(component.component_category || details.category || '')}
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label className="font-medium text-sm truncate max-w-[220px] md:max-w-[300px]">
                              {component.component_name}
                            </Label>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{component.component_name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary truncate">
                        {component.component_category || details.category || 'Component'}
                      </div>
                    </div>
                    
                    <div className="ml-6 space-y-0.5">
                      {(details.brand || details.model) && (
                        <p className="text-xs font-medium text-muted-foreground truncate">
                          {details.brand} {details.model}
                        </p>
                      )}
                      {specs.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          {specs.join(' • ')}
                        </p>
                      )}
                      <p className="text-xs mt-1">Qty: {component.quantity || 1}</p>
                    </div>
                  </div>

                  <div className="w-24 flex-shrink-0">
                    <Label htmlFor={`price-${component.id}`} className="sr-only">
                      Price
                    </Label>
                    <Input
                      id={`price-${component.id}`}
                      type="number"
                      min="0"
                      step="100"
                      value={quotations[component.id] || ""}
                      onChange={(e) => handlePriceChange(component.id, e.target.value)}
                      placeholder="Price"
                      className="text-right text-sm h-8"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <span className="font-medium text-sm">Total Quotation:</span>
          <span className="font-bold text-base">
            ₹{calculateTotal().toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={submitting} size="sm">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} size="sm">
          {submitting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Quotation"
          )}
        </Button>
      </div>
    </div>
  );
};

export default OrderQuotationForm;
