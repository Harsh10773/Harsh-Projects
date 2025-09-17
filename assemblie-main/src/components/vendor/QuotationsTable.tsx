
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";
import { Loader2, RefreshCw, ChevronDown, ChevronUp, CheckCircle, XCircle, Package } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { fetchComponentQuotationDetails } from "@/utils/vendorService";

interface OrderDetails {
  customer_name: string;
  tracking_id: string;
  order_date: string;
}

interface ComponentQuote {
  component_name: string;
  quantity: number;
  quoted_price: number;
  status?: string;
}

interface Quotation {
  id: string;
  order_id: string;
  price: number;
  status: string;
  created_at: string;
  order_details?: OrderDetails;
  component_quotes?: ComponentQuote[];
}

interface QuotationsTableProps {
  vendorId: string;
}

const QuotationsTable = ({ vendorId }: QuotationsTableProps) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedQuotation, setExpandedQuotation] = useState<string | null>(null);
  const [componentLoading, setComponentLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (vendorId) {
      fetchQuotations();
    }
  }, [vendorId, refreshTrigger]);

  const fetchQuotations = async () => {
    if (!vendorId) return;
    
    setLoading(true);
    try {
      // Direct query approach instead of using RPC to avoid type mismatch errors
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('vendor_quotations')
        .select('*')
        .eq('vendor_id', vendorId);

      if (quotationsError) throw quotationsError;
      
      // Now fetch order details for each quotation
      if (quotationsData && quotationsData.length > 0) {
        const quotationsWithDetails = await Promise.all(
          quotationsData.map(async (quote) => {
            // Get order details
            const { data: orderData, error: orderError } = await supabase
              .from('orders')
              .select('customer_name, tracking_id, order_date')
              .eq('id', quote.order_id)
              .maybeSingle();
            
            return {
              ...quote,
              order_details: orderData as OrderDetails || {
                customer_name: 'Unknown',
                tracking_id: 'N/A',
                order_date: quote.created_at
              }
            };
          })
        );
        
        setQuotations(quotationsWithDetails);
      } else {
        setQuotations([]);
      }
      
    } catch (error) {
      console.error('Error fetching quotations:', error);
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const fetchComponentDetails = async (quotationId: string, orderId: string) => {
    if (!vendorId) return;
    
    setComponentLoading(prev => ({ ...prev, [quotationId]: true }));
    try {
      console.log(`Fetching component details for quotation ${quotationId}, order ${orderId}`);
      
      // First try to get components from vendor_component_quotations_history
      const { data: historyData, error: historyError } = await supabase
        .from('vendor_component_quotations_history')
        .select('component_name, quoted_price, quantity, status')
        .eq('vendor_id', vendorId)
        .eq('order_id', orderId);
      
      if (historyError) {
        console.error('Error fetching from history:', historyError);
        throw historyError;
      }
      
      console.log('History data:', historyData);
      
      let formattedComponentQuotes: ComponentQuote[] = [];
      
      if (historyData && historyData.length > 0) {
        formattedComponentQuotes = historyData.map((item: any) => ({
          component_name: item.component_name,
          quantity: item.quantity || 1,
          quoted_price: item.quoted_price,
          status: item.status || 'pending'
        }));
      } else {
        // Fallback to the edge function if no data in history table
        console.log('No data in history table, trying edge function...');
        const componentQuotes = await fetchComponentQuotationDetails(vendorId, orderId);
        
        if (componentQuotes && componentQuotes.length > 0) {
          formattedComponentQuotes = componentQuotes.map((item: any) => ({
            component_name: item.component_name,
            quantity: item.quantity || 1,
            quoted_price: item.quoted_price,
            status: item.status || 'pending'
          }));
        }
      }
      
      console.log('Formatted component quotes:', formattedComponentQuotes);
      
      setQuotations(prevQuotations => 
        prevQuotations.map(q => 
          q.id === quotationId 
            ? { ...q, component_quotes: formattedComponentQuotes } 
            : q
        )
      );
    } catch (error) {
      console.error('Error fetching component details:', error);
      toast.error('Failed to load component details');
    } finally {
      setComponentLoading(prev => ({ ...prev, [quotationId]: false }));
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing quotations...");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'accepted':
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
      case 'rejected':
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium";
    }
  };
  
  const toggleExpand = (id: string, orderId: string) => {
    if (expandedQuotation === id) {
      setExpandedQuotation(null);
    } else {
      setExpandedQuotation(id);
      // Fetch component details if not already loaded
      const quotation = quotations.find(q => q.id === id);
      if (!quotation?.component_quotes) {
        fetchComponentDetails(id, orderId);
      }
    }
  };

  const getActionMessage = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="font-medium">Your quotation has been accepted!</p>
            </div>
            <p>Congratulations! You've won this order. Please prepare and ship the components as soon as possible.</p>
          </div>
        );
      case 'rejected':
        return (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="font-medium">Your quotation was not selected.</p>
            </div>
            <p>Unfortunately, your quotation was not selected for this order. You may try again for future orders.</p>
          </div>
        );
      default:
        return (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-blue-600" />
              <p className="font-medium">Your quotation is under review</p>
            </div>
            <p>The admin is currently reviewing your quotation. You'll be notified once a decision is made.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Your Quotations</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading quotations...</span>
        </div>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length > 0 ? (
                quotations.map((quote) => (
                  <React.Fragment key={quote.id}>
                    <TableRow>
                      <TableCell>{formatDate(quote.created_at)}</TableCell>
                      <TableCell>{quote.order_details?.customer_name || 'Unknown'}</TableCell>
                      <TableCell>{quote.order_details?.tracking_id || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(quote.price)}</TableCell>
                      <TableCell>
                        <span className={getStatusBadgeClass(quote.status)}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleExpand(quote.id, quote.order_id)}
                          className="flex items-center gap-1"
                        >
                          {expandedQuotation === quote.id ? (
                            <>
                              <ChevronUp className="h-4 w-4" /> Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" /> View
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedQuotation === quote.id && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={6} className="py-2">
                          <div className="p-3">
                            <h4 className="font-medium mb-2">Component Details</h4>
                            
                            {componentLoading[quote.id] ? (
                              <div className="flex justify-center items-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                                <span>Loading component details...</span>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-1/2">Component</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {quote.component_quotes && quote.component_quotes.length > 0 ? (
                                    quote.component_quotes.map((component, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{component.component_name}</TableCell>
                                        <TableCell>{component.quantity}</TableCell>
                                        <TableCell>{formatCurrency(component.quoted_price)}</TableCell>
                                        <TableCell>{formatCurrency(component.quoted_price * component.quantity)}</TableCell>
                                        <TableCell>
                                          {component.status && (
                                            <span className={getStatusBadgeClass(component.status || 'pending')}>
                                              {(component.status || 'pending').charAt(0).toUpperCase() + 
                                               (component.status || 'pending').slice(1)}
                                            </span>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                                        No component details available
                                      </TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow className="border-t border-t-primary/20">
                                    <TableCell colSpan={3} className="text-right font-medium">
                                      Total:
                                    </TableCell>
                                    <TableCell className="font-bold">
                                      {formatCurrency(quote.price)}
                                    </TableCell>
                                    <TableCell></TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            )}
                            
                            {/* Show special message for accepted/rejected quotations */}
                            {getActionMessage(quote.status)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No quotations submitted yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default QuotationsTable;
