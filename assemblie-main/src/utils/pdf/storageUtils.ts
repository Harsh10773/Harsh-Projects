
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Ensures that the invoices bucket exists and is properly configured
 */
export const ensureInvoicesBucketExists = async (): Promise<boolean> => {
  try {
    console.log("Checking if invoices bucket exists...");
    
    // Call the edge function to create/check the invoices bucket
    const { data, error } = await supabase.functions.invoke('create_invoice_bucket');
    
    if (error) {
      console.error('Error ensuring invoices bucket exists:', error);
      return false;
    }
    
    console.log('Invoices bucket existence confirmed:', data);
    return true;
  } catch (err) {
    console.error('Error checking/creating invoices bucket:', err);
    return false;
  }
};

/**
 * Force checks for the invoices bucket on app load
 */
export const initializeStorage = () => {
  ensureInvoicesBucketExists().then(success => {
    if (success) {
      console.log("Storage initialization complete");
    } else {
      console.error("Failed to initialize storage");
    }
  });
};

/**
 * Records invoice metadata in the tracking_files table
 */
export const recordInvoiceMetadata = async (orderId: string, fileUrl: string, fileName: string): Promise<boolean> => {
  try {
    console.log(`Recording invoice metadata for order ${orderId}`);
    
    // Clear any existing invoice records for this order to prevent duplicates
    const { error: clearError } = await supabase
      .from('tracking_files')
      .delete()
      .eq('order_id', orderId)
      .eq('file_type', 'invoice');
    
    if (clearError) {
      console.warn('Error clearing existing invoice records:', clearError);
      // Continue with the insert regardless
    }
    
    // Insert record into tracking_files table
    const { error } = await supabase
      .from('tracking_files')
      .insert({
        order_id: orderId,
        file_type: 'invoice',
        file_url: fileUrl,
        file_name: fileName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error recording invoice metadata:', error);
      return false;
    }
    
    console.log('Invoice metadata recorded successfully');
    return true;
  } catch (err) {
    console.error('Error recording invoice metadata:', err);
    return false;
  }
};

/**
 * Directly uploads a file to the invoices bucket using edge function to bypass RLS
 */
export const uploadInvoiceFile = async (filePath: string, fileContent: Blob): Promise<string | null> => {
  try {
    console.log(`Uploading invoice file to ${filePath}`);
    
    // First ensure the bucket exists
    await ensureInvoicesBucketExists();
    
    // Convert Blob to base64 for the edge function call
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result?.toString().split(',')[1] || '';
        resolve(base64data);
      };
    });
    reader.readAsDataURL(fileContent);
    const base64data = await base64Promise;
    
    // Upload via edge function to avoid RLS issues
    const { data, error } = await supabase.functions.invoke('store_invoice_file', {
      body: {
        file_path: filePath,
        file_content: base64data
      }
    });
    
    if (error) {
      console.error('Error uploading invoice file via edge function:', error);
      
      // Fallback to direct upload
      try {
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('invoices')
          .upload(filePath, fileContent, {
            contentType: 'application/pdf',
            upsert: true
          });
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = await supabase.storage
          .from('invoices')
          .getPublicUrl(filePath);
        
        if (urlData?.publicUrl) {
          return urlData.publicUrl;
        }
      } catch (fallbackError) {
        console.error('Fallback upload also failed:', fallbackError);
      }
      
      return null;
    }
    
    // Check if the response data contains the file URL
    if (data && typeof data === 'object' && 'file_url' in data) {
      console.log('Successfully uploaded invoice file:', data.file_url);
      return data.file_url as string;
    }
    
    console.log('Successfully uploaded invoice file but no URL returned');
    return null;
  } catch (err) {
    console.error('Error in uploadInvoiceFile:', err);
    return null;
  }
};

/**
 * Cleans up old test invoices that aren't linked to orders
 */
export const cleanupOrphanedInvoices = async (): Promise<boolean> => {
  try {
    // Get all tracking files that have no matching order
    const { data: trackingFiles, error: trackingError } = await supabase
      .from('tracking_files')
      .select('id, file_name, order_id')
      .eq('file_type', 'invoice');
    
    if (trackingError) {
      console.error('Error fetching tracking files:', trackingError);
      return false;
    }
    
    // For each file, check if the order exists
    for (const file of trackingFiles || []) {
      const { data: orderExists } = await supabase
        .from('orders')
        .select('id')
        .eq('id', file.order_id)
        .maybeSingle();
      
      if (!orderExists) {
        // If order doesn't exist, delete the tracking file and the actual file
        console.log(`Removing orphaned invoice: ${file.file_name} for non-existent order ${file.order_id}`);
        
        // Delete tracking record
        await supabase
          .from('tracking_files')
          .delete()
          .eq('id', file.id);
        
        // Try to delete the actual file if it exists
        try {
          await supabase.storage
            .from('invoices')
            .remove([file.file_name]);
        } catch (e) {
          console.warn(`Couldn't delete file ${file.file_name}:`, e);
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error cleaning up orphaned invoices:', err);
    return false;
  }
};
