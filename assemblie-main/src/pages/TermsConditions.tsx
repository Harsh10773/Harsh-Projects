
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const TermsConditions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Get the default tab from URL query parameter if available
    const params = new URLSearchParams(location.search);
    return params.get('tab') || "user";
  });

  const handleDownloadPdf = (type: string) => {
    // In a real implementation, this would download the actual PDF
    // For now, we'll create a simple text representation
    const content = type === 'user' ? userTermsContent : vendorTermsContent;
    const title = type === 'user' ? "Client Terms and Conditions" : "Vendor Terms and Conditions";
    const fileName = type === 'user' ? 'Assemblie_Client_Terms.pdf' : 'Assemblie_Vendor_Terms.pdf';
    
    // Create a link element to trigger download
    const element = document.createElement('a');
    const file = new Blob([title + '\n\n' + content.map(section => 
      section.title + '\n' + section.content
    ).join('\n\n')], {type: 'text/plain'});
    
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Updated user terms content based on the user's input
  const userTermsContent = [
    {
      title: "1. Introduction",
      content: "Welcome to Assemblie ('Company,' 'we,' 'us,' 'our'). These Terms and Conditions ('Terms') govern your use of our platform and services, including but not limited to custom PC building and delivery. By using our platform, you agree to these Terms. If you do not agree, please do not use our services."
    },
    {
      title: "2. User Responsibilities",
      content: "(a) Users must provide accurate and complete information when submitting their PC build requirements.\n(b) Orders are final upon payment. Refunds or modifications are only permitted under our Refund Policy.\n(c) Users are responsible for ensuring the compatibility of selected components. While we offer guidance, final selection is the user's responsibility.\n(d) Users must inspect the delivered PC upon receipt and report any defects within 48 hours."
    },
    {
      title: "3. Pricing and Payments",
      content: "(a) All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated.\n(b) Payment must be made in full before an order is processed.\n(c) We use secure third-party payment gateways. We are not liable for any payment failures due to banking errors or gateway issues."
    },
    {
      title: "4. Delivery and Shipping",
      content: "(a) Delivery time varies based on the user's location, with an average timeframe of 7-14 days.\n(b) A fixed shipping fee is charged and mentioned in the invoice. This fee is non-refundable.\n(c) If a product is returned due to defects, Assemblie will cover the return shipping costs. However, if no defects are found, the user will be charged the return shipping fee.\n(d) Any shipping damage must be reported within 24 hours of delivery."
    },
    {
      title: "5. Returns, Refunds, and Warranty",
      content: "(a) Users can return a PC within 1 week of delivery if there are legitimate defects in components, structure, or functionality.\n(b) Returns will only be initiated if troubleshooting cannot be done over a call/video call.\n(c) Assemblie handles warranty claims on behalf of users.\n(d) All custom builds come with a standard 1-year warranty covering assembly defects."
    },
    {
      title: "6. Limitation of Liability",
      content: "(a) Assemblie's liability is limited to the purchase price of the product.\n(b) We are not responsible for data loss, business interruption, or other consequential damages.\n(c) It is the customer's responsibility to back up any data before sending a system for repair."
    },
    {
      title: "7. Privacy and Data Protection",
      content: "(a) Customer information is collected and used in accordance with our Privacy Policy.\n(b) We do not sell or rent customer information to third parties.\n(c) Order information is retained for warranty and support purposes."
    },
    {
      title: "8. Changes to Terms",
      content: "Assemblie reserves the right to modify these terms at any time. Changes will be effective immediately upon posting on the website."
    },
    {
      title: "9. Governing Law",
      content: "These Terms and Conditions shall be governed by and construed in accordance with the laws of India, and any disputes shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996, in Raipur, India."
    }
  ];

  // Updated vendor terms content based on the user's input
  const vendorTermsContent = [
    {
      title: "1. Introduction",
      content: "These Vendor Terms and Conditions ('Terms') govern your use of our platform for listing and managing inventory. By registering as a vendor, you agree to these Terms."
    },
    {
      title: "2. Vendor Responsibilities",
      content: "(a) Vendors must provide accurate inventory details and update stock availability in real-time.\n(b) Vendors are responsible for ensuring the authenticity and warranty coverage of all components supplied.\n(c) Vendors agree to fulfill orders promptly and maintain quality standards.\n(d) Any disputes regarding inventory shortages, defects, or damages must be resolved between the vendor and the user; our platform serves as a facilitator only."
    },
    {
      title: "3. Warranty and Returns",
      content: "(a) Vendors must provide manufacturer-backed warranties for all components.\n(b) Vendors are responsible for processing warranty claims and replacement requests.\n(c) If a component is found to be defective upon delivery, vendors must provide a replacement or refund.\n(d) Vendors must accept returns if a product is found defective within 1 week of delivery.\n(e) If a defect is verified and cannot be repaired, the vendor must issue a full refund to Assemblie."
    },
    {
      title: "4. Pricing and Fees",
      content: "(a) Vendors quote prices per order, and Assemblie selects the lowest-cost supplier.\n(b) Assemblie does not take any commission; vendors are paid the quoted price.\n(c) Vendors will receive payments 1 week after delivery, aligning with the user return period.\n(d) Processing fees for payments are the responsibility of the vendor.\n(e) Vendors must honor quoted prices for 48 hours after submission."
    },
    {
      title: "5. Order Fulfillment",
      content: "(a) Vendors must ship products within 2 business days of order acceptance.\n(b) All shipments must include tracking information that is updated in the Assemblie system.\n(c) Packaging must be sufficient to protect products during transit.\n(d) Vendors are responsible for any loss or damage during shipping to Assemblie."
    },
    {
      title: "6. Performance Standards",
      content: "(a) Vendors will be evaluated based on product quality, shipping time, and customer satisfaction.\n(b) Vendors must maintain a satisfaction rating of at least 4.0 out of 5.0.\n(c) Repeated failure to meet performance standards may result in removal from the platform."
    },
    {
      title: "7. Limitation of Liability",
      content: "(a) We act as an intermediary and are not responsible for defects, non-compliance, or delays caused by vendors.\n(b) Vendors are solely responsible for ensuring compliance with all applicable regulations and safety standards."
    },
    {
      title: "8. Confidentiality",
      content: "(a) Vendors must maintain confidentiality of customer information.\n(b) Customer data may only be used for order fulfillment purposes.\n(c) Vendors must comply with all applicable data protection laws."
    },
    {
      title: "9. Dispute Resolution",
      content: "Any disputes shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996, in Raipur, India."
    },
    {
      title: "10. Term and Termination",
      content: "(a) The vendor agreement is effective until terminated by either party.\n(b) Assemblie may terminate the agreement with 30 days notice, or immediately for violations of these terms.\n(c) Upon termination, vendors must complete all pending orders."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Terms and Conditions</h1>
          <p className="text-foreground/70 text-center mb-12">
            Please review our terms and conditions before placing an order or registering as a vendor
          </p>
          
          <Tabs 
            defaultValue="user" 
            className="w-full" 
            value={activeTab} 
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">For Clients</TabsTrigger>
              <TabsTrigger value="vendor">For Vendors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Client Terms and Conditions
                  </CardTitle>
                  <CardDescription>
                    Applicable to all customers placing PC build orders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-md p-4 h-[60vh] overflow-y-auto text-sm">
                    {userTermsContent.map((section, index) => (
                      <div key={index} className="mb-6">
                        <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                        <p className="mb-4 whitespace-pre-line">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handleDownloadPdf("user")} 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FileDown className="h-4 w-4" /> Download PDF Version
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vendor">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Vendor Application Terms
                  </CardTitle>
                  <CardDescription>
                    Applicable to all vendors participating in our marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-md p-4 h-[60vh] overflow-y-auto text-sm">
                    {vendorTermsContent.map((section, index) => (
                      <div key={index} className="mb-6">
                        <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                        <p className="mb-4 whitespace-pre-line">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handleDownloadPdf("vendor")} 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FileDown className="h-4 w-4" /> Download PDF Version
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsConditions;
