
/**
 * Generates a unique tracking code for orders
 * Format: NXB-YYMM-XXXXX (NXB prefix, Year-Month, 5-digit unique number)
 */
export const generateTrackingCode = (): string => {
  const prefix = "NXB";
  const date = new Date();
  const year = date.getFullYear().toString().slice(2); // Last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month with leading zero
  
  // Generate a 10-character alphanumeric code (requested by user)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return `${prefix}-${year}${month}-${code}`;
};

/**
 * Mock order tracking data store
 */
export const trackingData: Record<string, OrderTrackingInfo> = {};

/**
 * Order tracking status types
 */
export type OrderStatus = 
  | "order_received"
  | "components_ordered" 
  | "components_received"
  | "pc_building" 
  | "pc_testing" 
  | "shipped" 
  | "delivered" 
  | "cancelled"
  | "processing"; // Added processing status

/**
 * Order tracking information interface
 */
export interface OrderTrackingInfo {
  trackingId: string;
  customerName: string;
  customerEmail: string;
  orderDate: Date;
  estimatedDelivery: Date;
  status: OrderStatus;
  components: string[];
  updates: {
    date: Date;
    status: OrderStatus;
    message: string;
  }[];
}

/**
 * Creates a new order tracking entry
 */
export const createOrderTracking = (
  customerName: string,
  customerEmail: string,
  components: string[]
): string => {
  const trackingId = generateTrackingCode();
  const orderDate = new Date();
  
  // Set estimated delivery to 14 days from now
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 14);
  
  trackingData[trackingId] = {
    trackingId,
    customerName,
    customerEmail,
    orderDate,
    estimatedDelivery,
    status: "order_received",
    components,
    updates: [
      {
        date: new Date(),
        status: "order_received",
        message: "Your order has been received and is being processed."
      }
    ]
  };
  
  return trackingId;
};

/**
 * Updates an order's status
 */
export const updateOrderStatus = (
  trackingId: string, 
  status: OrderStatus, 
  message: string
): boolean => {
  if (trackingData[trackingId]) {
    trackingData[trackingId].status = status;
    trackingData[trackingId].updates.push({
      date: new Date(),
      status,
      message
    });
    return true;
  }
  return false;
};

/**
 * Gets order tracking information by tracking ID
 */
export const getOrderTracking = (trackingId: string): OrderTrackingInfo | null => {
  return trackingData[trackingId] || null;
};

/**
 * Get status description for display
 */
export const getStatusDescription = (status: OrderStatus): string => {
  switch (status) {
    case 'order_received':
      return 'Order Received';
    case 'components_ordered':
      return 'Components Ordered';
    case 'components_received':
      return 'Components Received';
    case 'pc_building':
      return 'PC Building';
    case 'pc_testing':
      return 'PC Testing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    case 'processing':
      return 'Processing';
    default:
      return 'Unknown Status';
  }
};

/**
 * Get default message for a status
 */
export const getDefaultMessageForStatus = (status: OrderStatus): string => {
  switch(status) {
    case 'order_received': 
      return 'Your order has been received and is being processed.';
    case 'components_ordered': 
      return 'Components for your build have been ordered from our suppliers.';
    case 'components_received': 
      return 'All components for your build have arrived at our workshop.';
    case 'pc_building': 
      return 'Your PC build is now in progress by our expert technicians.';
    case 'pc_testing': 
      return 'Your PC is undergoing our rigorous testing process to ensure everything works perfectly.';
    case 'shipped': 
      return 'Your PC has been shipped and is on its way to you.';
    case 'delivered': 
      return 'Your PC has been delivered. Enjoy your new build!';
    case 'cancelled': 
      return 'Your order has been cancelled.';
    case 'processing':
      return 'Your order is being processed.';
    default:
      return 'Your order status has been updated.';
  }
};

// Create a demo tracking order with full history for testing
const createDemoOrder = () => {
  // Create initial order
  const demoId = "NXB-2311-12345";
  const orderDate = new Date();
  orderDate.setDate(orderDate.getDate() - 10); // 10 days ago
  
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 4); // 4 days from now
  
  // Create demo components
  const components = [
    "AMD Ryzen 9 7950X3D CPU",
    "NVIDIA GeForce RTX 4090 24GB GPU",
    "ASUS ROG Crosshair X670E Hero Motherboard",
    "G.SKILL Trident Z5 RGB 64GB DDR5-6000 RAM",
    "Samsung 990 Pro 2TB NVMe SSD (OS)",
    "Samsung 990 Pro 4TB NVMe SSD (Storage)",
    "Corsair HX1200 Platinum Power Supply",
    "NZXT Kraken Elite 360mm RGB Liquid Cooler",
    "Lian Li O11 Dynamic EVO Case",
    "Lian Li Uni Fan SL120 RGB Fans (6-pack)"
  ];
  
  // Setup the complete order with all status updates
  trackingData[demoId] = {
    trackingId: demoId,
    customerName: "Alex Johnson",
    customerEmail: "alex.johnson@example.com",
    orderDate: orderDate,
    estimatedDelivery: estimatedDelivery,
    status: "pc_testing",
    components: components,
    updates: [
      {
        date: new Date(orderDate),
        status: "order_received",
        message: "Your custom build order has been received. We're reviewing the specifications."
      },
      {
        date: new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000), // +1 day
        status: "components_ordered",
        message: "Components for your build have been ordered from our suppliers."
      },
      {
        date: new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000), // +4 days
        status: "components_received",
        message: "All components for your build have arrived at our workshop."
      },
      {
        date: new Date(orderDate.getTime() + 6 * 24 * 60 * 60 * 1000), // +6 days
        status: "pc_building",
        message: "Your PC build is now in progress by our expert technicians."
      },
      {
        date: new Date(orderDate.getTime() + 9 * 24 * 60 * 60 * 1000), // +9 days
        status: "pc_testing",
        message: "Your PC is undergoing our rigorous testing process to ensure everything works perfectly."
      }
    ]
  };
  
  return demoId;
};

// Create sample tracking codes for testing
const sampleOrder1 = createOrderTracking(
  "John Doe",
  "johndoe@example.com",
  ["Intel Core i9-13900K", "NVIDIA GeForce RTX 4090", "Samsung 990 Pro 2TB"]
);

// Update sample order through a few statuses
updateOrderStatus(
  sampleOrder1,
  "components_ordered",
  "We've ordered the components for your build from our suppliers."
);

// Create fully populated demo order
const demoOrderId = createDemoOrder();

// Export the demo tracking ID for easy access
export const DEMO_TRACKING_ID = "NXB-2311-12345";
