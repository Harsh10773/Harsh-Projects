
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPriceINR } from "@/utils/formatters";
import { getComponentDetails } from "@/utils/componentPricing";

export const generateInvoice = (
  orderData: any,
  components: Record<string, string>,
  pricing: {
    buildCost: number;
    buildCharge: number;
    deliveryCharge: number;
    weight: number;
    gst: number;
    total: number;
  },
  extraStorage: Array<{ id: string; name: string; price: number }> = []
) => {
  console.log("Generating invoice with data:", {
    orderData,
    components,
    pricing
  });

  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: 'PC Build Invoice',
    subject: 'Custom PC Build Invoice',
    author: 'Assemblie',
    keywords: 'invoice, pc, gaming',
    creator: 'Assemblie Invoice Generator'
  });
  
  // Add header with logo and title
  addHeader(doc);
  
  // Add invoice details (invoice number, date)
  addInvoiceDetails(doc, orderData);
  
  // Add build type header
  addBuildTypeHeader(doc, orderData.buildType || "Gaming");
  
  // Add customer details
  addCustomerDetails(doc, orderData);
  
  // Add components list with actual component details
  addComponentsList(doc, components, extraStorage);
  
  // Add pricing summary 
  addPricingSummary(doc, pricing, orderData.buildType);
  
  return doc;
};

// Add header with Assemblie branding
const addHeader = (doc: jsPDF) => {
  // Add purple header background
  doc.setFillColor(128, 0, 128); // Purple color
  doc.rect(0, 0, 210, 30, 'F');
  
  // Add white line separator
  doc.setFillColor(255, 0, 255); // Lighter purple/pink
  doc.rect(0, 30, 210, 5, 'F');
  
  // Add company name
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("ASSEMBLIE", 105, 20, { align: 'center' });
  
  // Add tagline
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("CUSTOM GAMING PC BUILDERS", 105, 28, { align: 'center' });
};

// Add invoice details (number and date)
const addInvoiceDetails = (doc: jsPDF, orderData: any) => {
  const startY = 50;
  
  // Set text color to black
  doc.setTextColor(0, 0, 0);
  
  // Generate invoice number and format current date
  const invoiceNumber = `ASB-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  
  // Add invoice number
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`INVOICE #${invoiceNumber}`, 20, startY);
  
  // Add date
  doc.text(`DATE: ${currentDate}`, 20, startY + 10);
};

// Add build type header
const addBuildTypeHeader = (doc: jsPDF, buildType: string) => {
  const startY = 75;
  
  // Add purple background for build type
  doc.setFillColor(128, 0, 128); // Purple color
  doc.rect(20, startY - 8, 170, 10, 'F');
  
  // Add build type text
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`${buildType.toUpperCase()} PC BUILD`, 105, startY, { align: 'center' });
};

// Add customer details
const addCustomerDetails = (doc: jsPDF, orderData: any) => {
  const startY = 95;
  
  // Set text color to black
  doc.setTextColor(0, 0, 0);
  
  // Add customer details header
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER DETAILS", 20, startY);
  
  // Add customer information
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  let lineY = startY + 10;
  
  // Add name
  doc.text(`Name: ${orderData.name || "Customer"}`, 20, lineY);
  lineY += 7;
  
  // Add email if available
  if (orderData.email) {
    doc.text(`Email: ${orderData.email}`, 20, lineY);
    lineY += 7;
  }
  
  // Add address
  const addressParts = [];
  if (orderData.address) addressParts.push(orderData.address);
  if (orderData.city) addressParts.push(orderData.city);
  if (orderData.state) addressParts.push(orderData.state);
  if (orderData.zipCode) addressParts.push(orderData.zipCode);
  
  if (addressParts.length > 0) {
    doc.text(`Address: ${addressParts.join(", ")}`, 20, lineY);
  }
};

// Add components list as a table with centered content and actual component details
const addComponentsList = (
  doc: jsPDF, 
  components: Record<string, string>,
  extraStorage: Array<{ id: string; name: string; price: number }> = []
) => {
  const startY = 130;
  
  // Prepare component data for table with actual selected components
  let data: string[][] = [];
  
  // Add components with their actual details
  const componentTypes = ["processor", "graphics", "memory", "storage", "cooling", "power", "motherboard", "pcCase"];
  const componentNames: Record<string, string> = {
    processor: "CPU",
    graphics: "Graphics Card",
    memory: "RAM",
    storage: "Storage",
    cooling: "Cooling Solution",
    power: "Power Supply",
    motherboard: "Motherboard",
    pcCase: "PC Case",
  };
  
  componentTypes.forEach(type => {
    const componentId = components[type];
    if (componentId) {
      const details = getComponentDetails(type as any, componentId);
      if (details) {
        data.push([
          componentNames[type],
          details.name,
          "1",
          `${details.price.toLocaleString('en-IN')}`
        ]);
      }
    }
  });
  
  // Add build service charge
  data.push(["Build Charge (5%)", "Assembly Service", "1", "5,020"]);
  data.push(["Delivery", "Standard Shipping", "1", "1,000"]);
  
  // Add extra storage items if any
  if (extraStorage && extraStorage.length > 0) {
    extraStorage.forEach(item => {
      data.push([
        "Storage (Additional)",
        item.name,
        "1",
        `${item.price.toLocaleString('en-IN')}`
      ]);
    });
  }
  
  // Create table with proper column widths and styling - centered alignment
  autoTable(doc, {
    startY: startY,
    head: [["Component", "Description", "Qty", "Price"]],
    body: data,
    theme: 'grid',
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      cellPadding: 2,
      fontSize: 9,
      lineWidth: 0.1,
      lineColor: [220, 220, 220],
      halign: 'center' // Center all text
    },
    columnStyles: {
      0: { cellWidth: 40, halign: 'center' },
      1: { cellWidth: 85, halign: 'center' },
      2: { cellWidth: 10, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' }
    },
    margin: { left: 20, right: 20 }
  });
  
  // Return final Y position after table
  return (doc as any).lastAutoTable.finalY + 10;
};

// Add pricing summary with proper formatting, centered content, and correct GST calculation
const addPricingSummary = (
  doc: jsPDF, 
  pricing: {
    buildCost: number;
    buildCharge: number;
    deliveryCharge: number;
    weight: number;
    gst: number;
    total: number;
  },
  buildType: string
) => {
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  // Format the pricing values without rupee symbol
  const formattedBuildCost = pricing.buildCost.toLocaleString('en-IN');
  const formattedBuildCharge = pricing.buildCharge.toLocaleString('en-IN');
  const formattedDeliveryCharge = pricing.deliveryCharge.toLocaleString('en-IN');
  const formattedGST = pricing.gst.toLocaleString('en-IN');
  const formattedTotal = pricing.total.toLocaleString('en-IN');
  
  // Create a consistent delivery charge text
  const deliveryText = `Delivery (${pricing.weight.toFixed(1)} kg @ 200/kg):`;
  
  // Set up table data for pricing summary with properly formatted values - centered
  const pricingData = [
    ["Components Total:", formattedBuildCost],
    [`Build Charge (${getBuildChargePercentage(buildType)}%):`, formattedBuildCharge],
    [deliveryText, formattedDeliveryCharge],
    ["GST (18%):", formattedGST]
  ];
  
  // Create table for pricing summary with proper styling - centered
  autoTable(doc, {
    startY: finalY,
    body: pricingData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 2,
      lineWidth: 0,
      halign: 'center' // Center all content
    },
    columnStyles: {
      0: { cellWidth: 100, halign: 'center', fontStyle: 'normal' },
      1: { cellWidth: 50, halign: 'center', fontStyle: 'bold' }
    },
    margin: { left: 30, right: 30 } // Adjusted margins to center the table
  });
  
  // Add total on a highlighted background
  const totalY = (doc as any).lastAutoTable.finalY + 5;
  
  // Add background for total
  doc.setFillColor(240, 240, 240);
  doc.rect(60, totalY - 4, 90, 10, 'F'); // Centered rectangle
  
  // Add total text - centered
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL:", 85, totalY + 3);
  doc.text(formattedTotal, 125, totalY + 3, { align: 'center' });
};

// Helper function to get build charge percentage - updated to 5% for all build types
const getBuildChargePercentage = (buildType: string): string => {
  return "5";
};
