
import { type ComponentType } from '../componentPricing';

// Format price to currency string in INR format
export const formatPriceINR = (price: number): string => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(price);
};

// Calculate build charge based on build type
export const calculateBuildCharge = (buildType: string, totalPrice: number): number => {
  switch (buildType.toLowerCase()) {
    case 'workstation':
      return totalPrice * 0.3; // 30% charge
    case 'gaming':
      return totalPrice * 0.2; // 20% charge
    case 'streaming':
    case 'office':
      return totalPrice * 0.1; // 10% charge
    default:
      return totalPrice * 0.1; // Default 10% charge
  }
};

// Get build charge percentage for display
export const getBuildChargePercentage = (buildType: string): string => {
  switch (buildType.toLowerCase()) {
    case 'workstation':
      return '30%';
    case 'gaming':
      return '20%';
    case 'streaming':
    case 'office':
      return '10%';
    default:
      return '10%';
  }
};
