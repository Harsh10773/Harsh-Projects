
import jsPDF from 'jspdf';
import { type ComponentType } from '../componentPricing';
import { generateInvoice } from './invoiceGenerator';
import { estimateWeight, calculateDeliveryCharge } from '../pdfGenerator';
import { formatPriceINR } from '../formatters';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { recordInvoiceMetadata, uploadInvoiceFile, ensureInvoicesBucketExists } from './storageUtils';

// Initialize storage when this module is loaded
ensureInvoicesBucketExists();

// Main function to download the invoice
export const downloadInvoice = (
  orderData: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    buildType: string;
  },
  components: Record<ComponentType, string>,
  pricing: {
    buildCost: number;
    buildCharge: number;
    deliveryCharge: number;
    weight: number;
    gst: number;
    total: number;
  },
  extraStorage?: Array<{id: string, name: string, price: number}>
): void => {
  try {
    const doc = generateInvoice(orderData, components, pricing, extraStorage);
    
    // Generate a unique filename for the invoice
    const timestamp = new Date().getTime();
    const fileName = `assemblie_gaming_invoice_${timestamp}.pdf`;
    
    // Save the file - this triggers browser download
    doc.save(fileName);
    
    return;
  } catch (error) {
    console.error("Error generating or downloading invoice:", error);
    throw error;
  }
};

// Function to upload invoice to Supabase storage
export const uploadInvoice = async (
  doc: jsPDF,
  orderId: string
): Promise<{ success: boolean, url?: string, error?: any }> => {
  try {
    // First ensure the invoices bucket exists
    const bucketExists = await ensureInvoicesBucketExists();
    if (!bucketExists) {
      console.error("Failed to ensure invoices bucket exists");
      throw new Error("Storage bucket not available");
    }
    
    // Convert PDF to blob
    const pdfBlob = doc.output('blob');
    
    // Generate a filename
    const fileName = `invoice_${orderId}.pdf`;
    const filePath = `order_${orderId}/${fileName}`;
    
    console.log("Uploading invoice to storage:", filePath);
    
    // Try using our enhanced upload method first
    const fileUrl = await uploadInvoiceFile(filePath, pdfBlob);
    if (fileUrl) {
      // Record metadata in tracking_files table
      await recordInvoiceMetadata(orderId, fileUrl, filePath);
      return { success: true, url: fileUrl };
    }
    
    // Fallback to direct upload if the enhanced method fails
    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true // Ensure we overwrite any existing file
      });
      
    if (error) {
      console.error("Error uploading invoice to storage:", error);
      
      // Try a simpler path as fallback
      const simplePath = `order_${orderId}.pdf`;
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from('invoices')
        .upload(simplePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true 
        });
        
      if (fallbackError) {
        console.error("Error with fallback upload:", fallbackError);
        return { success: false, error: fallbackError };
      }
      
      const { data: urlData } = await supabase.storage
        .from('invoices')
        .getPublicUrl(simplePath);
        
      // Record the file URL in tracking_files table
      if (urlData?.publicUrl) {
        await recordInvoiceMetadata(orderId, urlData.publicUrl, simplePath);
        return { success: true, url: urlData.publicUrl };
      }
      
      return { success: true };
    }
    
    // Get public URL
    const { data: urlData } = await supabase.storage
      .from('invoices')
      .getPublicUrl(filePath);
      
    if (!urlData || !urlData.publicUrl) {
      return { success: true, url: undefined };
    }
    
    console.log("Invoice uploaded successfully:", urlData.publicUrl);
    
    // Record the file URL in tracking_files table
    await recordInvoiceMetadata(orderId, urlData.publicUrl, filePath);
    
    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    console.error("Error in uploadInvoice:", err);
    return { success: false, error: err };
  }
};

// Function to get invoice URL for a specific order
export const getInvoiceUrl = async (
  orderId: string
): Promise<string | null> => {
  try {
    console.log("Looking up invoice for order:", orderId);
    
    if (!orderId) {
      console.error("No order ID provided for invoice lookup");
      return null;
    }
    
    // First check if we have a record in tracking_files
    const { data: trackingData, error: trackingError } = await supabase
      .from('tracking_files')
      .select('file_url')
      .eq('order_id', orderId)
      .eq('file_type', 'invoice')
      .order('created_at', { ascending: false }) // Get the most recent one
      .limit(1)
      .maybeSingle();
      
    if (trackingData?.file_url) {
      console.log("Found invoice URL in tracking_files:", trackingData.file_url);
      return trackingData.file_url;
    }
    
    // Try searching for the file in different locations
    const potentialPaths = [
      `order_${orderId}/invoice_*.pdf`,   // Wildcard for any invoice in the order folder
      `order_${orderId}/*.pdf`,           // Any PDF in the order folder
      `order_${orderId}.pdf`,             // Direct order file
      `${orderId}.pdf`                    // Using ID directly as filename
    ];
    
    for (const pattern of potentialPaths) {
      try {
        // If it's a wildcard pattern, list files in the directory
        if (pattern.includes('*')) {
          const basePath = pattern.split('*')[0];
          const { data: fileList, error: listError } = await supabase.storage
            .from('invoices')
            .list(basePath.replace(/\/[^\/]+$/, ''));
            
          if (!listError && fileList && fileList.length > 0) {
            // Find the first PDF file
            const pdfFile = fileList.find(file => file.name.endsWith('.pdf'));
            if (pdfFile) {
              const fullPath = `${basePath.replace(/\/[^\/]+$/, '')}/${pdfFile.name}`;
              const { data: urlData } = await supabase.storage
                .from('invoices')
                .getPublicUrl(fullPath);
                
              if (urlData?.publicUrl) {
                // Record this URL for future reference
                await recordInvoiceMetadata(orderId, urlData.publicUrl, fullPath);
                return urlData.publicUrl;
              }
            }
          }
        } else {
          // Direct path, try to get the URL
          const { data: urlData } = await supabase.storage
            .from('invoices')
            .getPublicUrl(pattern);
            
          if (urlData?.publicUrl) {
            // Record this URL for future reference
            await recordInvoiceMetadata(orderId, urlData.publicUrl, pattern);
            return urlData.publicUrl;
          }
        }
      } catch (e) {
        console.warn(`Error checking path ${pattern}:`, e);
      }
    }
    
    console.log("No existing invoice found for order:", orderId);
    
    // Return a direct public URL as final fallback
    const baseUrl = "https://pfqgzpyweaqqgowvfrlj.supabase.co/storage/v1/object/public/invoices";
    return `${baseUrl}/order_${orderId}.pdf`;
  } catch (error) {
    console.error("Error getting invoice URL:", error);
    return null;
  }
};

// Calculate build charge - uses 5% for all build types
export const calculateBuildCharge = (buildType: string, totalPrice: number): number => {
  return totalPrice * 0.05; // 5% charge for all build types
};

// Export other utility functions
export { 
  formatPriceINR,
  estimateWeight, 
  calculateDeliveryCharge,
  generateInvoice
};
