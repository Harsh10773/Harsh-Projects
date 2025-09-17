import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Loader2, Info, IndianRupee } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { fetchCustomerOrderedComponents } from "@/utils/orderItems";

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

interface OrderItemsTableProps {
  items?: OrderItem[];
  grandTotal: number;
  isLoading: boolean;
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ items, grandTotal, isLoading }) => {
  const [customerOrderedComponents, setCustomerOrderedComponents] = useState<OrderItem[]>([]);
  const [loadingCustomerComponents, setLoadingCustomerComponents] = useState(false);

  useEffect(() => {
    const loadCustomerOrderedComponents = async () => {
      const orderId = window.location.pathname.split('/').pop();
      
      if (orderId && orderId.length > 10) {
        try {
          setLoadingCustomerComponents(true);
          const components = await fetchCustomerOrderedComponents(orderId);
          
          if (components.length > 0) {
            setCustomerOrderedComponents(components);
          }
        } catch (error) {
          console.error('Error loading customer ordered components:', error);
        } finally {
          setLoadingCustomerComponents(false);
        }
      }
    };
    
    loadCustomerOrderedComponents();
  }, []);

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const applyDefaultPrices = (items: OrderItem[]) => {
    if (!items || items.length === 0) return [];
    
    const allZeroPrices = items.every(item => 
      (!item.unit_price || item.unit_price === 0) && 
      (!item.price_at_time || item.price_at_time === 0)
    );
    
    if (allZeroPrices) {
      return items.map(item => {
        const componentType = item.component_name.toLowerCase();
        let defaultPrice = 0;
        
        switch (true) {
          case componentType.includes('processor'):
            defaultPrice = 15000;
            break;
          case componentType.includes('graphics') || componentType.includes('gpu'):
            defaultPrice = 25000;
            break;
          case componentType.includes('memory') || componentType.includes('ram'):
            defaultPrice = 5000;
            break;
          case componentType.includes('storage') || componentType.includes('ssd') || componentType.includes('hdd'):
            defaultPrice = 5000;
            break;
          case componentType.includes('cooling'):
            defaultPrice = 2500;
            break;
          case componentType.includes('power'):
            defaultPrice = 4000;
            break;
          case componentType.includes('motherboard'):
            defaultPrice = 8000;
            break;
          case componentType.includes('case') || componentType.includes('cabinet'):
            defaultPrice = 3500;
            break;
          default:
            defaultPrice = 1000;
        }
        
        return {
          ...item,
          price_at_time: defaultPrice,
          unit_price: defaultPrice,
          total_price: defaultPrice * (item.quantity || 1)
        };
      });
    }
    
    return items;
  };

  const calculateSubtotal = (itemsToCalculate: OrderItem[]) => {
    if (!itemsToCalculate || itemsToCalculate.length === 0) return 0;
    return itemsToCalculate.reduce((sum, item) => {
      const price = item.unit_price || item.price_at_time || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);
  };

  const getComponentDescription = (item: OrderItem) => {
    if (!item.component_details) return null;
    
    const details = item.component_details;
    const specs = [];
    
    if (details.name && details.name !== item.component_name) specs.push(details.name);
    if (details.description) specs.push(details.description);
    
    if (details.category) {
      if (details.category.toLowerCase().includes('cpu') || details.category.toLowerCase().includes('processor')) {
        if (details.clock_speed) specs.push(`${details.clock_speed}GHz`);
        if (details.cores) specs.push(`${details.cores} cores`);
      } else if (details.category.toLowerCase().includes('gpu') || details.category.toLowerCase().includes('graphics')) {
        if (details.memory) specs.push(`${details.memory}GB VRAM`);
      } else if (details.category.toLowerCase().includes('ram') || details.category.toLowerCase().includes('memory')) {
        if (details.capacity) specs.push(`${details.capacity}GB`);
        if (details.speed) specs.push(`${details.speed}MHz`);
      } else if (details.category.toLowerCase().includes('storage')) {
        if (details.capacity) specs.push(`${details.capacity}GB`);
        if (details.type) specs.push(details.type);
      }
    }
    
    return specs.length > 0 ? specs.join(' | ') : null;
  };

  const getComponentDisplayName = (item: OrderItem) => {
    return item.component_name || 'Unknown Component';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading order items...</span>
      </div>
    );
  }

  if (!customerOrderedComponents.length && !items || items.length === 0) {
    const [userBuilds, setUserBuilds] = useState<any[]>([]);
    const [loadingBuilds, setLoadingBuilds] = useState(false);
    
    useEffect(() => {
      const fetchUserBuilds = async (orderId: string) => {
        try {
          setLoadingBuilds(true);
          const { data, error } = await supabase
            .from('user_builds')
            .select('*')
            .eq('build_id', orderId);
            
          if (error) {
            console.error('Error fetching user builds:', error);
            return;
          }
          
          if (data && data.length > 0) {
            setUserBuilds(data);
            console.log("Found user builds data:", data);
          }
        } catch (error) {
          console.error('Error in fetchUserBuilds:', error);
        } finally {
          setLoadingBuilds(false);
        }
      };
      
      const orderId = window.location.pathname.split('/').pop();
      if (orderId && orderId.length > 10) {
        fetchUserBuilds(orderId);
      }
    }, []);
    
    if (loadingBuilds) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Checking for build components...</span>
        </div>
      );
    }
    
    if (userBuilds.length > 0) {
      const transformedBuilds: OrderItem[] = userBuilds.map(build => ({
        id: build.id,
        component_name: build.model_name,
        quantity: build.quantity,
        price_at_time: build.price,
        component_details: {
          name: build.model_name,
          category: build.component_type,
          description: build.model_name
        }
      }));
      
      return (
        <div className="space-y-4">
          <h4 className="font-medium">Order Components (From User Build)</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transformedBuilds.map((item) => {
                const unitPrice = item.unit_price || item.price_at_time || 0;
                const totalPrice = item.total_price || (unitPrice * (item.quantity || 1));
                const description = getComponentDescription(item);
                const displayName = getComponentDisplayName(item);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {displayName}
                        {description && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm max-w-xs">{description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      {item.component_details?.category && (
                        <span className="text-xs text-muted-foreground block mt-1">
                          Category: {item.component_details.category}
                        </span>
                      )}
                      {(!description && !item.component_details?.category) && (
                        <span className="text-xs text-muted-foreground block mt-1">
                          No specifications available
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-medium">{item.quantity || 1}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <IndianRupee className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span>{unitPrice}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(totalPrice)}</TableCell>
                  </TableRow>
                );
              })}
              
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">Subtotal:</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(calculateSubtotal(transformedBuilds))}</TableCell>
              </TableRow>
              
              {grandTotal - calculateSubtotal(transformedBuilds) > 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">Additional Charges:</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(grandTotal - calculateSubtotal(transformedBuilds))}</TableCell>
                </TableRow>
              )}
              
              <TableRow className="bg-muted/30">
                <TableCell colSpan={3} className="text-right font-bold">Grand Total:</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(grandTotal)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }
    
    return <p className="text-center text-muted-foreground py-4">No items found for this order</p>;
  }

  const processedItems = customerOrderedComponents.length > 0 ? customerOrderedComponents : items;
  
  const subtotal = calculateSubtotal(processedItems);
  
  const additionalCharges = grandTotal - subtotal;

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Order Components</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Component</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedItems.map((item) => {
            const unitPrice = item.unit_price || item.price_at_time || 0;
            const totalPrice = item.total_price || (unitPrice * (item.quantity || 1));
            const description = getComponentDescription(item);
            const displayName = getComponentDisplayName(item);
            
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {displayName}
                    {description && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm max-w-xs">{description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {item.component_details?.category && (
                    <span className="text-xs text-muted-foreground block mt-1">
                      Category: {item.component_details.category}
                    </span>
                  )}
                  {(!description && !item.component_details?.category) && (
                    <span className="text-xs text-muted-foreground block mt-1">
                      No specifications available
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center font-medium">{item.quantity || 1}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <IndianRupee className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span>{unitPrice}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(totalPrice)}</TableCell>
              </TableRow>
            );
          })}
          
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">Subtotal:</TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(subtotal)}</TableCell>
          </TableRow>
          
          {additionalCharges > 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">Additional Charges:</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(additionalCharges)}</TableCell>
            </TableRow>
          )}
          
          <TableRow className="bg-muted/30">
            <TableCell colSpan={3} className="text-right font-bold">Grand Total:</TableCell>
            <TableCell className="text-right font-bold">{formatCurrency(grandTotal)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderItemsTable;
