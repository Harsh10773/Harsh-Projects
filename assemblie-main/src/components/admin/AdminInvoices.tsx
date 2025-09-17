
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw, AlertCircle, FileText, Download, Eye, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { ensureInvoicesBucketExists, cleanupOrphanedInvoices } from "@/utils/pdf/storageUtils";

interface InvoiceFile {
  id: string;
  order_id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  tracking_id?: string;
  customer_name?: string;
}

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<InvoiceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bucketInitialized, setBucketInitialized] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);

  useEffect(() => {
    // Initialize storage and fetch invoices
    initializeStorage();
  }, [refreshTrigger]);

  const initializeStorage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Initializing invoice storage...");
      
      // First, check if the invoices bucket exists
      const bucketExists = await ensureInvoicesBucketExists();
      
      console.log("Bucket exists check result:", bucketExists);
      setBucketInitialized(bucketExists);
      
      // Proceed to fetch invoices
      fetchInvoices();
    } catch (err) {
      console.error("Error during storage initialization:", err);
      toast.error("Failed to initialize storage properly");
      // Still attempt to fetch existing invoices
      fetchInvoices();
    }
  };

  const fetchInvoices = async () => {
    try {
      console.log('Fetching invoices from tracking_files table...');
      
      // Get invoice files from tracking_files table where file_type is 'invoice'
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('tracking_files')
        .select('*')
        .eq('file_type', 'invoice')
        .order('created_at', { ascending: false });
      
      if (invoiceError) {
        console.error('Error fetching invoices:', invoiceError);
        throw invoiceError;
      }
      
      console.log(`Found ${invoiceData?.length || 0} invoice records:`, invoiceData);
      
      // If we don't have tracking_files data, try to get files directly from storage
      if (!invoiceData || invoiceData.length === 0) {
        console.log("No invoices found in tracking_files, checking storage...");
        await fetchInvoicesFromStorage();
        return;
      }
      
      // Process found invoices
      const processedInvoices = await Promise.all(
        invoiceData.map(async (invoice) => {
          try {
            // Get order details to show tracking ID and customer name
            const { data: orderData } = await supabase
              .from('orders')
              .select('tracking_id, customer_name')
              .eq('id', invoice.order_id)
              .maybeSingle();
              
            // Validate and update the file URL if needed
            let validatedUrl = invoice.file_url;
            if (!validatedUrl) {
              try {
                const { data: urlData } = await supabase.storage
                  .from('invoices')
                  .getPublicUrl(invoice.file_name);
                  
                if (urlData?.publicUrl) {
                  validatedUrl = urlData.publicUrl;
                }
              } catch (urlError) {
                console.warn("Error getting public URL:", urlError);
              }
            }
            
            return {
              ...invoice,
              file_url: validatedUrl,
              tracking_id: orderData?.tracking_id || 'N/A',
              customer_name: orderData?.customer_name || 'Unknown Customer'
            };
          } catch (detailError) {
            console.error(`Error processing invoice ${invoice.id}:`, detailError);
            return {
              ...invoice,
              tracking_id: 'Error',
              customer_name: 'Error Loading Details'
            };
          }
        })
      );
      
      console.log('Processed invoices with order details:', processedInvoices);
      setInvoices(processedInvoices);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to load invoices');
      toast.error('Failed to load invoices');
      
      // Try to fetch from storage as a backup
      await fetchInvoicesFromStorage();
    }
  };
  
  const fetchInvoicesFromStorage = async () => {
    try {
      console.log("Checking storage directly for invoice files...");
      
      // Check if the invoices bucket exists first
      const { data: buckets, error: bucketsError } = await supabase.storage
        .listBuckets();
        
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        throw bucketsError;
      }
      
      const invoicesBucketExists = buckets?.some(bucket => bucket.name === 'invoices');
      
      if (!invoicesBucketExists) {
        console.log("No invoices bucket found");
        setInvoices([]);
        setLoading(false);
        return;
      }
        
      // List all files in the invoices bucket
      const { data: fileList, error: listError } = await supabase.storage
        .from('invoices')
        .list();
        
      if (listError) {
        console.error("Error listing files in storage:", listError);
        setInvoices([]);
        setLoading(false);
        return;
      }
      
      if (!fileList || fileList.length === 0) {
        console.log("No invoice files found in storage");
        setInvoices([]);
        setLoading(false);
        return;
      }
      
      console.log("Found files in storage:", fileList);
      
      // Process only PDF files
      const pdfFiles = fileList.filter(file => file.name.endsWith('.pdf'));
      
      if (pdfFiles.length === 0) {
        console.log("No PDF files found in storage");
        setInvoices([]);
        setLoading(false);
        return;
      }
      
      // Convert storage files to invoice objects
      const storageInvoices = await Promise.all(pdfFiles.map(async (file) => {
        // Try to extract order ID from filename
        const orderIdMatch = file.name.match(/order_([a-f0-9-]+)/) || file.name.match(/([a-f0-9-]{36})/);
        const orderId = orderIdMatch ? orderIdMatch[1] : 'unknown';
        
        // Get public URL
        const { data: urlData } = await supabase.storage
          .from('invoices')
          .getPublicUrl(file.name);
          
        // Try to get order details if we have an order ID
        let orderDetails = { tracking_id: 'N/A', customer_name: 'Unknown' };
        if (orderId && orderId !== 'unknown') {
          try {
            const { data: orderData } = await supabase
              .from('orders')
              .select('tracking_id, customer_name')
              .eq('id', orderId)
              .maybeSingle();
              
            if (orderData) {
              orderDetails = {
                tracking_id: orderData.tracking_id || 'N/A',
                customer_name: orderData.customer_name || 'Unknown'
              };
            }
          } catch (e) {
            console.warn(`Couldn't get order details for ${orderId}:`, e);
          }
        }
          
        // Create invoice object from storage file
        return {
          id: `storage-${file.id || Date.now()}`,
          order_id: orderId,
          file_name: file.name,
          file_url: urlData?.publicUrl || '',
          created_at: file.created_at || new Date().toISOString(),
          tracking_id: orderDetails.tracking_id,
          customer_name: orderDetails.customer_name
        };
      }));
      
      console.log("Converted storage files to invoices:", storageInvoices);
      setInvoices(storageInvoices);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching invoices from storage:", error);
      setError("Failed to load invoices from storage");
      setInvoices([]);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.info("Refreshing invoices data...");
  };

  const handleDownload = (invoice: InvoiceFile) => {
    if (!invoice.file_url) {
      toast.error("Invoice URL not available");
      return;
    }
    
    // Create an anchor element and trigger download
    const a = document.createElement('a');
    a.href = invoice.file_url;
    a.download = invoice.file_name || `invoice-${invoice.order_id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("Invoice download started");
  };

  const handlePreview = (invoice: InvoiceFile) => {
    setSelectedInvoice(invoice);
    setPreviewUrl(invoice.file_url);
  };

  const closePreview = () => {
    setSelectedInvoice(null);
    setPreviewUrl(null);
  };
  
  const handleCleanup = async () => {
    setCleaningUp(true);
    try {
      toast.info("Cleaning up orphaned invoice records...");
      const success = await cleanupOrphanedInvoices();
      if (success) {
        toast.success("Cleanup complete");
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error("Cleanup failed");
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      toast.error("Cleanup failed with error");
    } finally {
      setCleaningUp(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const generateSampleInvoice = async () => {
    try {
      toast.info("Creating sample invoice for testing...");
      
      // Ensure bucket exists first
      await ensureInvoicesBucketExists();
      
      // Create a simple PDF blob for testing
      const sampleText = "Sample Invoice Document";
      const pdfBlob = new Blob([sampleText], { type: 'application/pdf' });
      
      // Generate a unique filename
      const timestamp = Date.now();
      const filename = `sample_invoice_${timestamp}.pdf`;
      
      // Upload the sample PDF
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filename, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error uploading sample invoice:", uploadError);
        toast.error("Failed to upload sample invoice");
        return;
      }
      
      // Get the file URL
      const { data: urlData } = await supabase.storage
        .from('invoices')
        .getPublicUrl(filename);
      
      // Create a tracking record
      if (urlData?.publicUrl) {
        const { error: trackingError } = await supabase
          .from('tracking_files')
          .insert({
            file_type: 'invoice',
            file_name: filename,
            file_url: urlData.publicUrl,
            order_id: '00000000-0000-0000-0000-000000000000', // Dummy ID for testing
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (trackingError) {
          console.error("Error creating tracking record:", trackingError);
        }
      }
      
      console.log("Sample invoice uploaded:", uploadData);
      toast.success("Sample invoice created successfully");
      
      // Refresh the invoices list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Error generating sample invoice:", err);
      toast.error("Failed to create sample invoice");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading invoices...</span>
        </div>
      );
    }

    if (error && invoices.length === 0) {
      return (
        <div className="flex justify-center items-center py-12 flex-col">
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <p className="text-red-500 mb-2">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try Again
            </Button>
            <Button variant="default" size="sm" onClick={generateSampleInvoice}>
              <Plus className="h-4 w-4 mr-2" />
              Create Sample Invoice
            </Button>
          </div>
        </div>
      );
    }

    if (invoices.length === 0) {
      return (
        <div className="flex justify-center items-center py-12 flex-col">
          <FileText className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-4">No invoices found</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateSampleInvoice}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate Sample Invoice
          </Button>
        </div>
      );
    }

    return (
      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Filename</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{formatDate(invoice.created_at)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {invoice.order_id && invoice.order_id.length > 8 
                    ? `${invoice.order_id.substring(0, 8)}...` 
                    : invoice.order_id || 'N/A'}
                </TableCell>
                <TableCell>{invoice.tracking_id || 'N/A'}</TableCell>
                <TableCell>{invoice.customer_name || 'Unknown'}</TableCell>
                <TableCell className="text-xs truncate max-w-[200px]">{invoice.file_name || 'invoice.pdf'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlePreview(invoice)}
                      title="Preview Invoice"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(invoice)}
                      title="Download Invoice"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>View and download customer invoices</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCleanup}
            disabled={cleaningUp || loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateSampleInvoice}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Sample
          </Button>
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
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Invoice Preview: {selectedInvoice?.tracking_id || 'N/A'} - {selectedInvoice?.customer_name || 'Unknown'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow h-[70vh] overflow-auto mt-4">
            {previewUrl && (
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-0"
                title="Invoice Preview"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closePreview}>
              Close
            </Button>
            {selectedInvoice && (
              <Button onClick={() => handleDownload(selectedInvoice)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminInvoices;
