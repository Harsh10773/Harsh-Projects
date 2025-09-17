
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPriceINR } from "@/utils/formatters";
import { generateInvoice as generatePdfInvoice } from "@/utils/pdf/invoiceGenerator";

export const calculateBuildCharge = (buildType: string, totalComponentCost: number): number => {
  // Update to 5% build charge for all build types
  return Math.round(totalComponentCost * 0.05);
};

export const calculateDeliveryCharge = (weight: number): number => {
  // Flat rate of ₹200 per kg
  return Math.round(weight * 200);
};

export const estimateWeight = (components: Record<string, string>): number => {
  let totalWeight = 0;
  
  // Base weight of standard components
  const componentWeights: Record<string, number> = {
    // Processors
    "i3-12100f": 0.5,
    "i5-12400f": 0.6,
    "i5-13600k": 0.7,
    "i7-13700k": 0.7,
    "i9-13900k": 0.8,
    "r5-5600x": 0.6,
    "r7-5800x3d": 0.7,
    "r9-7950x": 0.8,
    
    // Graphics Cards
    "integrated": 0.0,
    "gtx1650": 1.2,
    "rtx3060": 1.5,
    "rtx4060ti": 1.8,
    "rtx4070": 2.2,
    "rtx4080": 2.5,
    "rtx4090": 3.0,
    "rx6600": 1.5,
    "rx6700xt": 2.0,
    "rx7900xt": 2.7,
    
    // Memory
    "ddr4-8gb": 0.1,
    "ddr4-16gb": 0.2,
    "ddr4-32gb": 0.3,
    "ddr5-16gb": 0.2,
    "ddr5-32gb": 0.3,
    "ddr5-64gb": 0.5,
    
    // Storage
    "hdd-1tb": 0.8,
    "ssd-500gb": 0.1,
    "ssd-1tb": 0.2,
    "nvme-1tb": 0.1,
    "nvme-2tb": 0.2,
    
    // Cooling
    "stock": 0.4,
    "air-basic": 0.6,
    "air-premium": 0.8,
    "aio-240mm": 1.2,
    "aio-360mm": 1.6,
    
    // Power Supply
    "psu-450w": 1.2,
    "psu-650w": 1.5,
    "psu-750w": 1.8,
    "psu-850w": 2.0,
    "psu-1000w": 2.5,
    
    // Motherboard
    "h610": 1.0,
    "b660": 1.2,
    "z690": 1.4,
    "x570": 1.3,
    "b550": 1.1,
    
    // PC Case
    "case-budget": 4.0,
    "case-mid": 5.0,
    "case-premium": 6.0,
    "case-enthusiast": 7.0,
  };
  
  // Add weights for each selected component
  for (const [type, component] of Object.entries(components)) {
    if (component && componentWeights[component]) {
      totalWeight += componentWeights[component];
    }
  }
  
  // Default minimum weight if no components selected
  return totalWeight > 0 ? totalWeight : 5.0;
};

// Use the formatPriceINR from formatters.ts
export const formatPrice = formatPriceINR;

// Helper to generate and download invoice
export const generateInvoice = (
  customerData: any,
  components: any,
  pricing: any,
  extraStorage: any[] = []
) => {
  return generatePdfInvoice(customerData, components, pricing, extraStorage);
};

export const downloadInvoice = (
  customerData: any,
  components: any,
  pricing: any,
  extraStorage: any[] = []
) => {
  const doc = generateInvoice(customerData, components, pricing, extraStorage);
  
  const invoiceNumber = `ASSEMBLIE_${Date.now()}`;
  const fileName = `assemblie_gaming_invoice_${Date.now()}.pdf`;
  
  console.log("Invoice download initiated for file:", fileName);
  
  doc.save(fileName);
  
  return fileName;
};
