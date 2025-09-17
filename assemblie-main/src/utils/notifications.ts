
// This file is now just a re-export of the refactored utilities
// to maintain backward compatibility

export { updateOrderStatus } from './orderStatus';
export { fetchAllVendors, notifyVendor } from './vendorService';
export { incrementVendorStatOrderWon, incrementVendorStatOrderLost } from './vendorStats';
export { 
  fetchOrderItems, 
  fetchCustomerOrderedComponents,
  storeCustomerOrderedComponents,
  storeUserBuilds 
} from './orderItems';
