
import { type ComponentType } from '../componentPricing';

// Estimate weight based on components in kg
export const estimateWeight = (components: Record<ComponentType, string>): number => {
  let totalWeight = 0;
  
  // Base weights for components in kg
  const componentWeights: Record<ComponentType, number> = {
    processor: 0.5,
    graphics: 1.5,
    memory: 0.2,
    storage: 0.3,
    cooling: 1.0,
    power: 2.0,
    motherboard: 1.0,
    pcCase: 5.0
  };
  
  // Add weight for each selected component
  Object.entries(components).forEach(([type, id]) => {
    if (id) {
      totalWeight += componentWeights[type as ComponentType];
    }
  });
  
  // Add minimum weight for other components (cables, etc.)
  totalWeight += 1.0;
  
  return totalWeight;
};

// Calculate delivery charge based on weight
export const calculateDeliveryCharge = (weight: number): number => {
  // ₹200 per kg
  return Math.ceil(weight) * 200;
};
