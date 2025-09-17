import React, { useState } from 'react';
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { downloadInvoice } from "@/utils/pdfGenerator";
import { uploadInvoice, getInvoiceUrl } from "@/utils/pdf/pdfService";
import { sendOrderConfirmation } from "@/utils/emailService";
import { Info } from "lucide-react";
import { generateInvoice } from "@/utils/pdf/invoiceGenerator";
import { storeCustomerOrderedComponents } from "@/utils/orderItems";
import { storeUserBuilds } from "@/utils/orderItems";

interface CheckoutStepProps {
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  addressInfo: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    
  };
  buildType: string;
  selectedComponents: Record<string, string>;
  extraStorage: Array<{ id: string; name: string; price: number; type: string }>;
  pricing: {
    buildCost: number;
    buildCharge: number;
    deliveryCharge: number;
    weight: number;
    gst: number;
    total: number;
  };
  componentNames?: Record<string, string>; // Add component names prop
}

const CheckoutStep: React.FC<CheckoutStepProps> = ({
  contactInfo,
  addressInfo,
  buildType,
  selectedComponents,
  extraStorage,
  pricing,
  componentNames = {} // Initialize as empty object if not provided
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [trackingId, setTrackingId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  
  const orderData = {
    name: contactInfo.name,
    email: contactInfo.email,
    address: addressInfo.street,
    city: addressInfo.city,
    state: addressInfo.state,
    zipCode: addressInfo.zipCode,
    buildType: buildType
  };
  
  const fetchComponentDetails = async (componentId: string) => {
    if (!componentId || componentId === 'none') return null;
    
    try {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', componentId)
        .maybeSingle();
        
      if (error) {
        console.error(`Error fetching component details for ${componentId}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Error in fetchComponentDetails for ${componentId}:`, error);
      return null;
    }
  };
  
  const getComponentCategory = (type: string): string => {
    const typeMap: Record<string, string> = {
      'processor': 'processor',
      'cpu': 'processor',
      'graphics': 'graphics',
      'gpu': 'graphics',
      'memory': 'memory',
      'ram': 'memory',
      'storage': 'storage',
      'cooling': 'cooling',
      'power': 'power',
      'motherboard': 'motherboard',
      'case': 'pcCase',
      'pcCase': 'pcCase'
    };
    
    return typeMap[type.toLowerCase()] || type.toLowerCase();
  };
  
  const handleCompleteOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/customer-auth");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Creating order...");
      console.log("Selected components:", selectedComponents);
      console.log("Component names:", componentNames);
      
      const generatedTrackingId = `NB-${Math.floor(100000 + Math.random() * 900000)}`;
      setTrackingId(generatedTrackingId);
      
      const correctGst = Math.round((pricing.buildCost + pricing.buildCharge + pricing.deliveryCharge) * 0.18);
      const correctTotal = pricing.buildCost + pricing.buildCharge + pricing.deliveryCharge + correctGst;
      
      // Create order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id,
          customer_name: contactInfo.name,
          customer_email: contactInfo.email,
          status: 'order_placed',
          build_charge: pricing.buildCharge,
          shipping_charge: pricing.deliveryCharge,
          gst_amount: correctGst,
          grand_total: correctTotal,
          tracking_id: generatedTrackingId,
          estimated_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();
      
      if (orderError) {
        console.error("Error creating order:", orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }
      
      setOrderId(orderData.id);
      console.log("Order created successfully:", orderData);
      
      // Process components to include names
      const componentsWithNames = [];
      
      // Process each selected component
      for (const [type, id] of Object.entries(selectedComponents)) {
        if (!id || id === 'none') continue;
        
        try {
          // Get the component details from the database
          const { data: details, error } = await supabase
            .from('components')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          
          if (error) {
            console.error(`Error fetching component ${type} details:`, error);
            continue;
          }
          
          // Use the exact name from components table
          const exactName = details?.name || componentNames[type] || `${type.charAt(0).toUpperCase() + type.slice(1)}`;
          console.log(`Component ${type}: Using name "${exactName}" from components table`);
          
          componentsWithNames.push({
            component_name: exactName,
            component_id: id,
            component_category: type,
            quantity: 1,
            unit_price: details?.price || 0,
            total_price: details?.price || 0,
            component_details: details || { 
              name: exactName,
              category: type,
              description: `${type} component`,
              original_name: exactName
            }
          });
          
          // Also add to order_items table
          const { error: orderItemError } = await supabase
            .from('order_items')
            .insert({
              order_id: orderData.id,
              component_id: id,
              component_name: exactName,
              price_at_time: details?.price || 0,
              quantity: 1
            });
          
          if (orderItemError) {
            console.error(`Error adding ${exactName} to order_items:`, orderItemError);
          }
        } catch (error) {
          console.error(`Error processing component ${type}:`, error);
        }
      }
      
      // Process extra storage items
      for (const item of extraStorage) {
        try {
          let storageDetails = null;
          
          if (item.id) {
            const { data } = await supabase
              .from('components')
              .select('*')
              .eq('id', item.id)
              .maybeSingle();
              
            storageDetails = data;
          }
          
          const exactName = storageDetails?.name || item.name || "Storage Device";
          
          componentsWithNames.push({
            component_name: exactName,
            component_id: item.id || null,
            component_category: 'storage',
            quantity: 1,
            unit_price: storageDetails?.price || item.price || 0,
            total_price: storageDetails?.price || item.price || 0,
            component_details: storageDetails || {
              name: exactName,
              category: 'storage',
              price: item.price,
              original_name: exactName
            }
          });
        } catch (error) {
          console.error(`Error processing extra storage:`, error);
        }
      }
      
      console.log("Components to store:", componentsWithNames);
      
      // Store components with exact names
      if (componentsWithNames.length > 0) {
        const stored = await storeCustomerOrderedComponents(orderData.id, componentsWithNames);
        if (stored) {
          console.log("Successfully stored customer ordered components with details");
        } else {
          console.error("Failed to store customer ordered components");
        }
      } else {
        console.error("No components to store! This should not happen.");
      }
      
      // Store the user build
      const buildId = await storeUserBuilds(
        orderData.id, 
        selectedComponents, 
        user.id,
        extraStorage,
        componentNames
      );

      if (buildId) {
        console.log('User build stored successfully:', buildId);
      }
      
      try {
        // First make sure the bucket exists
        const { data: bucketData } = await supabase.functions.invoke('create_invoice_bucket');
        console.log("Invoice bucket check/creation result:", bucketData);
        
        const updatedPricing = {
          ...pricing,
          gst: correctGst,
          total: correctTotal
        };
        
        // Generate the invoice PDF
        const doc = generateInvoice(orderData, selectedComponents, updatedPricing, extraStorage);
        
        // Upload the invoice to Supabase storage
        const { success, url: invoiceUrl } = await uploadInvoice(doc, orderData.id);
        
        if (success && invoiceUrl) {
          console.log("Invoice uploaded successfully:", invoiceUrl);
          
          // Send confirmation email with invoice attached
          const emailSent = await sendOrderConfirmation(
            contactInfo.email,
            contactInfo.name,
            generatedTrackingId,
            {
              buildType,
              total: correctTotal
            },
            invoiceUrl
          );
          
          if (emailSent) {
            console.log("Order confirmation email sent successfully with invoice");
          } else {
            console.warn("Failed to send order confirmation email");
          }
        } else {
          console.warn("Invoice upload failed or URL not available");
        }
      } catch (error) {
        console.error("Error with invoice or email:", error);
      }
      
      console.log("Order process completed successfully");
      setOrderCompleted(true);
      toast.success("Your order has been placed successfully!");
      
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error(`Error processing order: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadInvoice = () => {
    try {
      const correctGst = Math.round((pricing.buildCost + pricing.buildCharge + pricing.deliveryCharge) * 0.18);
      const correctTotal = pricing.buildCost + pricing.buildCharge + pricing.deliveryCharge + correctGst;
      
      const updatedPricing = {
        ...pricing,
        gst: correctGst,
        total: correctTotal
      };
      
      downloadInvoice(orderData, selectedComponents, updatedPricing, extraStorage);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice. Please try again.");
    }
  };
  
  const handleViewOrder = () => {
    navigate(`/customer`);
  };
  
  const displayGst = Math.round((pricing.buildCost + pricing.buildCharge + pricing.deliveryCharge) * 0.18);
  const displayTotal = pricing.buildCost + pricing.buildCharge + pricing.deliveryCharge + displayGst;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Review & Complete Order</h2>
      
      {!orderCompleted ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Components Cost:</span>
                    <span>{formatCurrency(pricing.buildCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Build Charge:</span>
                    <span>{formatCurrency(pricing.buildCharge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge ({pricing.weight.toFixed(1)} kg):</span>
                    <span>{formatCurrency(pricing.deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>{formatCurrency(displayGst)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(displayTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{contactInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{contactInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{contactInfo.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Address:</span>
                    <span>{addressInfo.street}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">City:</span>
                    <span>{addressInfo.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">State:</span>
                    <span>{addressInfo.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Zip Code:</span>
                    <span>{addressInfo.zipCode}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-accent/5 p-4 rounded-md border border-accent/20 flex items-start gap-3 mt-6">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Complete your order</p>
              <p className="text-xs text-foreground/70">After completing your order, you'll receive a confirmation email with order details and invoice.</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              className="w-full" 
              onClick={handleCompleteOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : `Complete Order (${formatCurrency(displayTotal)})`}
            </Button>
          </div>
        </>
      ) : (
        <div className="p-8 bg-green-50 border border-green-100 rounded-xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">Order Placed Successfully!</h3>
          <p className="text-green-700 mb-6">Your order tracking ID is: <span className="font-bold">{trackingId}</span></p>
          <p className="text-green-700 mb-6">
            We've sent an order confirmation with invoice to <span className="font-bold">{contactInfo.email}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button variant="outline" onClick={handleDownloadInvoice}>
              Download Invoice
            </Button>
            <Button onClick={handleViewOrder}>
              View My Orders
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutStep;
