import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QuotationsTable from "./QuotationsTable";
import QuotationDetailsDialog from "./QuotationDetailsDialog";
import ConfirmQuotationDialog from "./ConfirmQuotationDialog";
import { notifyVendor, fetchComponentQuotationDetails } from "@/utils/vendorService";
import { updateOrderStatus } from "@/utils/orderStatus";

interface QuotedComponent {
  component_name: string;
  quantity: number;
  quoted_price: number;
}

interface QuotationItem {
  id: string;
  vendor_id: string;
  order_id: string;
  price: number;
  status: string;
  created_at: string;
  vendor_name: string;
  store_name: string;
  customer_name: string;
  tracking_id: string;
  components?: QuotedComponent[];
}

const AdminQuotations = () => {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationItem | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    action: "accept" | "reject";
    quotationId: string;
  }>({ isOpen: false, action: "accept", quotationId: "" });
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchQuotations();
  }, [refreshTrigger]);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching quotations from vendor_quotations table...');
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current auth session:', session ? 'Authenticated' : 'Not authenticated');
      
      // First, try to get quotations from the vendor_quotations table - now including accepted ones
      const { data: quotationsData, error: quotationsError } = await supabase
        .from('vendor_quotations')
        .select('*')
        .not('status', 'eq', 'rejected') // We only filter out rejected quotations
        .order('created_at', { ascending: false });

      if (quotationsError) {
        console.error('Error fetching quotations:', quotationsError);
        throw quotationsError;
      }
      
      // Also check component quotations history for any quotations not in the main table
      const { data: componentQuotes, error: historyError } = await supabase
        .from('vendor_component_quotations_history')
        .select('vendor_id, order_id, created_at, status')
        .not('status', 'eq', 'rejected') // Filter out rejected quotations
        .order('created_at', { ascending: false });
        
      if (historyError) {
        console.error('Error fetching component quotation history:', historyError);
        throw historyError;
      }
      
      // Create a map to store unique quotations
      const uniqueQuotations = new Map();
      
      // First add the official quotations
      if (quotationsData && quotationsData.length > 0) {
        quotationsData.forEach(quote => {
          uniqueQuotations.set(`${quote.vendor_id}-${quote.order_id}`, quote);
        });
      }
      
      // Then check if there are any component quotes that don't have a main quotation entry
      if (componentQuotes && componentQuotes.length > 0) {
        componentQuotes.forEach(quote => {
          // Skip rejected quotations
          if (quote.status === 'rejected') return;
          
          const key = `${quote.vendor_id}-${quote.order_id}`;
          if (!uniqueQuotations.has(key)) {
            uniqueQuotations.set(key, {
              vendor_id: quote.vendor_id,
              order_id: quote.order_id,
              created_at: quote.created_at,
              status: quote.status || 'pending',
              price: 0 // We'll calculate this later
            });
          }
        });
      }
      
      if (uniqueQuotations.size === 0) {
        console.log('No quotations found in the database');
        setQuotations([]);
        setLoading(false);
        return;
      }
      
      const processedQuotations = await Promise.all(
        Array.from(uniqueQuotations.values()).map(async (quote: any) => {
          console.log(`Processing quotation vendor: ${quote.vendor_id}, order: ${quote.order_id}`);
          
          let totalPrice = quote.price || 0;
          let quotationId = quote.id;
          
          // If we don't have a price or ID (from component quotes), we need to calculate/generate them
          if (!totalPrice || !quotationId) {
            // Calculate total price from component quotes
            const { data: componentPrices } = await supabase
              .from('vendor_component_quotations_history')
              .select('quoted_price, quantity')
              .eq('vendor_id', quote.vendor_id)
              .eq('order_id', quote.order_id);
              
            if (componentPrices && componentPrices.length > 0) {
              totalPrice = componentPrices.reduce((sum, item) => {
                return sum + (item.quoted_price * (item.quantity || 1));
              }, 0);
            }
            
            // If we don't have a quotation ID, try to find or create one
            if (!quotationId) {
              // Check if there's an existing quotation record
              const { data: existingQuote } = await supabase
                .from('vendor_quotations')
                .select('id')
                .eq('vendor_id', quote.vendor_id)
                .eq('order_id', quote.order_id)
                .maybeSingle();
                
              if (existingQuote && existingQuote.id) {
                quotationId = existingQuote.id;
              } else {
                // Generate a real UUID for the temporary ID to avoid RLS issues
                quotationId = crypto.randomUUID();
              }
            }
          }
          
          const { data: vendorData, error: vendorError } = await supabase
            .from('vendor_profiles')
            .select('vendor_name, store_name')
            .eq('id', quote.vendor_id)
            .maybeSingle();
          
          if (vendorError) {
            console.error(`Error fetching vendor details:`, vendorError);
          }
          
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('customer_name, tracking_id')
            .eq('id', quote.order_id)
            .maybeSingle();
          
          if (orderError) {
            console.error(`Error fetching order details:`, orderError);
          }
          
          return {
            id: quotationId,
            vendor_id: quote.vendor_id,
            order_id: quote.order_id,
            price: totalPrice,
            status: quote.status || 'pending',
            created_at: quote.created_at || new Date().toISOString(),
            vendor_name: vendorData?.vendor_name || 'Unknown Vendor',
            store_name: vendorData?.store_name || 'Unknown Store',
            customer_name: orderData?.customer_name || 'Unknown Customer',
            tracking_id: orderData?.tracking_id || quote.order_id.slice(0, 8)
          };
        })
      );
      
      console.log('Processed quotations:', processedQuotations);
      setQuotations(processedQuotations);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setError('Failed to load quotations');
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotationDetails = async (quotation: QuotationItem) => {
    try {
      const componentQuotes = await fetchComponentQuotationDetails(
        quotation.vendor_id, 
        quotation.order_id
      );
      
      if (!componentQuotes || componentQuotes.length === 0) {
        console.log("No component quotes found, trying fallback methods");
        
        const { data: historyQuotes, error: historyError } = await supabase
          .from('vendor_component_quotations_history')
          .select('component_name, quantity, quoted_price, status')
          .eq('vendor_id', quotation.vendor_id)
          .eq('order_id', quotation.order_id);
          
        if (historyError || !historyQuotes || historyQuotes.length === 0) {
          console.error('Error fetching history quotation details or no data:', historyError);
          
          const { data: fallbackQuotes, error: fallbackError } = await supabase
            .from('vendor_component_quotes')
            .select(`
              quoted_price,
              order_item_id,
              order_items!inner(
                component_name,
                quantity
              )
            `)
            .eq('vendor_id', quotation.vendor_id)
            .eq('order_id', quotation.order_id);
            
          if (fallbackError || !fallbackQuotes || fallbackQuotes.length === 0) {
            console.error('Error fetching fallback quotation details or no data:', fallbackError);
            
            setSelectedQuotation({
              ...quotation,
              components: []
            });
            return;
          }
          
          console.log("Fallback component quotes:", fallbackQuotes);
          
          const formattedComponents = fallbackQuotes.map((item: any) => ({
            component_name: item.order_items?.component_name || "Unknown Component",
            quantity: item.order_items?.quantity || 1,
            quoted_price: item.quoted_price,
            status: quotation.status
          }));
          
          setSelectedQuotation({
            ...quotation,
            components: formattedComponents
          });
          return;
        }
        
        console.log("History component quotes:", historyQuotes);
        
        setSelectedQuotation({
          ...quotation,
          components: historyQuotes.map(item => ({
            ...item,
            status: item.status || quotation.status
          }))
        });
        return;
      }
      
      console.log("Component quotes from API:", componentQuotes);
      
      const formattedComponents = componentQuotes.map((item: any) => ({
        component_name: item.component_name || "Unknown Component",
        quantity: item.quantity || 1,
        quoted_price: item.quoted_price,
        status: item.status || quotation.status
      }));
      
      setSelectedQuotation({
        ...quotation,
        components: formattedComponents
      });
      
    } catch (error) {
      console.error('Error fetching quotation details:', error);
      toast.error('Failed to load quotation details');
      
      setSelectedQuotation({
        ...quotation,
        components: []
      });
    }
  };

  const handleViewQuotationDetails = (quotation: QuotationItem) => {
    fetchQuotationDetails(quotation);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing quotation data...");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const updateVendorStats = async (vendorId: string, isWin: boolean) => {
    try {
      const { data: existingStats, error: checkError } = await supabase
        .from('vendor_stats')
        .select('*')
        .eq('vendor_id', vendorId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingStats) {
        const { error: updateError } = await supabase
          .from('vendor_stats')
          .update({
            orders_won: isWin ? existingStats.orders_won + 1 : existingStats.orders_won,
            orders_lost: !isWin ? existingStats.orders_lost + 1 : existingStats.orders_lost,
            updated_at: new Date().toISOString()
          })
          .eq('vendor_id', vendorId);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('vendor_stats')
          .insert({
            vendor_id: vendorId,
            orders_won: isWin ? 1 : 0,
            orders_lost: !isWin ? 1 : 0
          });
          
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating vendor stats:', error);
    }
  };

  const handleUpdateQuotation = async (quotationId: string, newStatus: string) => {
    setProcessingAction(true);
    try {
      const quotation = quotations.find(q => q.id === quotationId);
      if (!quotation) {
        throw new Error("Quotation not found");
      }
      
      // Instead of trying to create/update the record directly, use our Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error("Authentication token not found");
      }
      
      const response = await fetch(
        'https://pfqgzpyweaqqgowvfrlj.supabase.co/functions/v1/update_component_quotations_status',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            vendor_id_param: quotation.vendor_id,
            order_id_param: quotation.order_id,
            status_param: newStatus
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating quotation via Edge Function:', errorData);
        throw new Error(`Edge function error: ${JSON.stringify(errorData)}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const notificationResult = await notifyVendor(
        quotation.vendor_id, 
        quotation.order_id, 
        newStatus === 'accepted'
      );

      if (!notificationResult.success) {
        console.warn("Notification may not have been sent", notificationResult.message);
        toast.warning("The quotation status was updated, but there was an issue notifying the vendor");
      } else {
        toast.success(`Quotation ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully`);
      }
      
      if (newStatus === 'rejected') {
        // Update the status of quotations in the list instead of removing them
        setQuotations(prev => 
          prev.map(q => q.id === quotationId ? { ...q, status: newStatus } : q)
        );
      } else {
        // Update the status of accepted quotations
        setQuotations(prev => 
          prev.map(q => q.id === quotationId ? { ...q, status: newStatus } : q)
        );
      }
      
      if (newStatus === 'accepted') {
        try {
          await updateOrderStatus(
            quotation.order_id,
            'components_ordered',
            'Component quotes have been accepted and components have been ordered.'
          );
        } catch (orderStatusError) {
          console.error('Error updating order status:', orderStatusError);
        }
      }
      
      await updateVendorStats(quotation.vendor_id, newStatus === 'accepted');
      
    } catch (error) {
      console.error('Error updating quotation status:', error);
      toast.error('Failed to update quotation status: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setProcessingAction(false);
      setConfirmationDialog({
        isOpen: false,
        action: "accept",
        quotationId: ""
      });
      
      setRefreshTrigger(prev => prev + 1);
    }
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

  const handleConfirmDialog = (quotationId: string, action: "accept" | "reject") => {
    setConfirmationDialog({
      isOpen: true,
      action,
      quotationId
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading quotations...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-12 flex-col">
          <p className="text-red-500 mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      );
    }

    if (quotations.length === 0) {
      return (
        <div className="flex justify-center items-center py-12 flex-col">
          <p className="text-muted-foreground mb-2">No quotations found</p>
          <p className="text-sm text-muted-foreground mb-4">
            This could be because no vendors have submitted quotations yet, or there might be a data access issue.
          </p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      );
    }

    return (
      <QuotationsTable 
        quotations={quotations} 
        processingAction={processingAction}
        onViewDetails={handleViewQuotationDetails}
        onConfirmDialog={handleConfirmDialog}
        getStatusBadgeClass={getStatusBadgeClass}
        formatDate={formatDate}
      />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Vendor Quotations</CardTitle>
          <CardDescription>Review and manage vendor quotations</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
      
      <QuotationDetailsDialog 
        selectedQuotation={selectedQuotation}
        isOpen={!!selectedQuotation}
        onOpenChange={(open) => !open && setSelectedQuotation(null)}
        processingAction={processingAction}
        onConfirmDialog={handleConfirmDialog}
        getStatusBadgeClass={getStatusBadgeClass}
        formatDate={formatDate}
      />
      
      <ConfirmQuotationDialog 
        isOpen={confirmationDialog.isOpen}
        onOpenChange={(open) => !open && setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
        action={confirmationDialog.action}
        quotationId={confirmationDialog.quotationId}
        processingAction={processingAction}
        onConfirm={handleUpdateQuotation}
      />
    </Card>
  );
};

export default AdminQuotations;
