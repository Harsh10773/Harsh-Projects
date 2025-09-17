import React, { useEffect, useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, ChevronDown, ChevronUp, Mail, Phone, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OrderedComponent {
  id: string;
  component_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CustomerOrder {
  id: string;
  tracking_id: string;
  order_date: string;
  status: string;
  grand_total: number;
  components?: OrderedComponent[];
}

interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  created_at: string;
  orders?: CustomerOrder[];
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [refreshTrigger]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching customer profiles...');
      
      const { data: customerProfiles, error: profilesError } = await supabase
        .from('customer_profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching customer profiles:', profilesError);
        setError('Failed to fetch customer profiles');
        throw profilesError;
      }
      
      console.log('Customer profiles data:', customerProfiles);
      
      if (!customerProfiles || customerProfiles.length === 0) {
        console.log('No customer profiles found');
        setCustomers([]);
        setLoading(false);
        return;
      }
      
      const processedCustomers = customerProfiles.map((customer: any) => {
        return {
          id: customer.id,
          full_name: customer.full_name || 'Unknown Customer',
          email: customer.email || 'Unknown',
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zipcode: customer.zipcode,
          created_at: customer.created_at,
          orders: []
        };
      });
      
      console.log('Processed customers:', processedCustomers);
      setCustomers(processedCustomers);
      
      for (const customer of processedCustomers) {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', customer.id);
        
        if (ordersError) {
          console.error(`Error fetching orders for customer ${customer.id}:`, ordersError);
        } else if (ordersData && ordersData.length > 0) {
          const ordersWithComponents = await Promise.all(ordersData.map(async (order) => {
            const { data: componentsData, error: componentsError } = await supabase
              .from('customer_ordered_components')
              .select('*')
              .eq('order_id', order.id);
              
            if (componentsError) {
              console.error(`Error fetching components for order ${order.id}:`, componentsError);
            }
              
            return {
              id: order.id,
              tracking_id: order.tracking_id || 'N/A',
              order_date: order.order_date,
              status: order.status || 'processing',
              grand_total: order.grand_total || 0,
              components: componentsData || []
            };
          }));
          
          setCustomers(prev => 
            prev.map(c => 
              c.id === customer.id ? { ...c, orders: ordersWithComponents } : c
            )
          );
        }
      }
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers');
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing customer data...");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleCustomerExpansion = (customerId: string) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
    setExpandedOrder(null);
  };
  
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'processing':
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'cancelled':
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>View and manage all registered customers</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading customers...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12 flex-col">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Details</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <React.Fragment key={customer.id}>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">{customer.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Since {formatDate(customer.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm space-y-1">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.address && (
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[200px]">
                                {[customer.address, customer.city, customer.state, customer.zipcode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleCustomerExpansion(customer.id)}
                          >
                            {expandedCustomer === customer.id ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Hide Orders
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                View Orders ({customer.orders?.length || 0})
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {expandedCustomer === customer.id && (
                        <TableRow>
                          <TableCell colSpan={4} className="bg-muted/20 p-0">
                            <div className="p-4">
                              <h4 className="font-medium mb-4">Customer Orders</h4>
                              
                              {customer.orders && customer.orders.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Order ID</TableHead>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {customer.orders.map((order) => (
                                      <React.Fragment key={order.id}>
                                        <TableRow>
                                          <TableCell>{order.tracking_id}</TableCell>
                                          <TableCell>{formatDate(order.order_date)}</TableCell>
                                          <TableCell>
                                            <span className={getStatusBadgeClass(order.status)}>
                                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "Processing"}
                                            </span>
                                          </TableCell>
                                          <TableCell className="text-right">{formatCurrency(order.grand_total)}</TableCell>
                                        </TableRow>
                                        
                                        {expandedOrder === order.id && (
                                          <TableRow>
                                            <TableCell colSpan={5} className="bg-slate-50 p-0">
                                              <div className="p-4">
                                                <h5 className="font-medium mb-2 text-sm">Order Components</h5>
                                                {order.components && order.components.length > 0 ? (
                                                  <Table>
                                                    <TableHeader>
                                                      <TableRow>
                                                        <TableHead>Component</TableHead>
                                                        <TableHead>Quantity</TableHead>
                                                        <TableHead>Unit Price</TableHead>
                                                        <TableHead className="text-right">Total</TableHead>
                                                      </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                      {order.components.map((component) => (
                                                        <TableRow key={component.id}>
                                                          <TableCell>{component.component_name}</TableCell>
                                                          <TableCell>{component.quantity}</TableCell>
                                                          <TableCell>{formatCurrency(component.unit_price)}</TableCell>
                                                          <TableCell className="text-right">{formatCurrency(component.total_price)}</TableCell>
                                                        </TableRow>
                                                      ))}
                                                    </TableBody>
                                                  </Table>
                                                ) : (
                                                  <p className="text-center text-muted-foreground py-4">No component data available</p>
                                                )}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-center text-muted-foreground py-4">No orders placed by this customer</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                        <AlertCircle className="h-8 w-8 text-amber-500" />
                        <div>
                          <p>No customer records found in the database.</p>
                          <p className="text-sm">Please ensure customers are registered properly in the system.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
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
  );
};

export default AdminCustomers;
