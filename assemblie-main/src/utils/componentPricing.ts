import { toast } from "sonner";

export type ComponentType =
  | "processor"
  | "graphics"
  | "memory"
  | "storage"
  | "cooling"
  | "power"
  | "motherboard"
  | "pcCase";

export interface BuildRecommendation {
  name: string;
  description: string;
  totalPrice: number;
  components: Record<ComponentType, string>;
}

export const componentPrices: Record<ComponentType, any[]> = {
  processor: [
    { id: "cpu-1", name: "AMD Ryzen 5 5500 (6C/12T)", price: 6899 },
    { id: "cpu-2", name: "AMD Ryzen 5 5600X (6C/12T)", price: 11179 },
    { id: "cpu-3", name: "AMD Ryzen 5 9600X (6C/12T)", price: 25629 },
    { id: "cpu-4", name: "Intel Core i5-12400F (6C/12T)", price: 9699 },
    { id: "cpu-5", name: "Intel Core i7-12700 (12C/20T)", price: 25899 },
    { id: "cpu-6", name: "AMD Ryzen 3 5300G (4C/8T)", price: 10976 },
    { id: "cpu-7", name: "Intel Xeon Gold 5118 (12C/24T)", price: 34756 },
    { id: "cpu-8", name: "AMD Ryzen Threadripper PRO 7965WX (24C/48T)", price: 349990 },
  ],
  graphics: [
    { id: "gpu-1", name: "Zotac GeForce GTX 1650 (4GB GDDR6)", price: 16499 },
    { id: "gpu-2", name: "INNO3D GeForce RTX 3050 (8GB GDDR6)", price: 19099 },
    { id: "gpu-3", name: "ASUS Dual Radeon RX 6600 (8GB GDDR6)", price: 20849 },
    { id: "gpu-4", name: "GIGABYTE GeForce RTX 3060 (12GB GDDR6)", price: 24799 },
    { id: "gpu-5", name: "GIGABYTE GeForce RTX 4060 Ti (8GB GDDR6)", price: 40089 },
    { id: "gpu-6", name: "PNY GeForce RTX 4090 Verto (24GB GDDR6X)", price: 305999 },
    { id: "gpu-7", name: "Asus Phoenix Radeon PH-550-2G (2GB GDDR5)", price: 7020 },
  ],
  memory: [
    { id: "ram-1", name: "ADATA XPG Gammix D30 DDR4-3200 16GB (8GBx2)", price: 3500 },
    { id: "ram-2", name: "Patriot Signature Premium DDR5-5600 24GB", price: 9486 },
    { id: "ram-3", name: "ADATA XPG Gammix D35G DDR4-3200 32GB", price: 4899 },
    { id: "ram-4", name: "Kingston ValueRAM KVR32N22S8L/8 DDR4-3200 8GB", price: 1299 },
    { id: "ram-5", name: "CORSAIR Vengeance RGB DDR5-5200 16GB", price: 4828 },
    { id: "ram-6", name: "Crucial PRO DDR5-5600 32GB", price: 8799 },
  ],
  storage: [
    { id: "storage-1", name: "Crucial P3 Plus NVMe Gen4 500GB", price: 3150 },
    { id: "storage-2", name: "Samsung 980 Pro NVMe Gen4 1TB", price: 9000 },
    { id: "storage-3", name: "WD SN850X NVMe Gen4 1TB", price: 9500 },
    { id: "storage-4", name: "Samsung 980 Pro NVMe Gen4 2TB", price: 15000 },
    { id: "storage-5", name: "WD SN850X NVMe Gen4 2TB", price: 16000 },
  ],
  cooling: [
    { id: "cooling-1", name: "Cooler Master ML240L V2 240mm AIO", price: 7500 },
    { id: "cooling-2", name: "Noctua NH-D15 Air Cooler", price: 6500 },
  ],
  power: [
    { id: "psu-1", name: "Cooler Master MWE 750W 80+ Gold", price: 7500 },
    { id: "psu-2", name: "Corsair RM850x 850W 80+ Gold", price: 9500 },
  ],
  motherboard: [
    { id: "mobo-1", name: "ZEBRONICS H61-NVMe (LGA 1155)", price: 1184 },
    { id: "mobo-2", name: "MSI PRO H610M-E DDR4 (LGA 1700)", price: 5999 },
    { id: "mobo-3", name: "GIGABYTE H610M S2H DDR4 (LGA 1700)", price: 7199 },
    { id: "mobo-4", name: "ASRock Z890 Pro RS WiFi (LGA 1700)", price: 26868 },
  ],
  pcCase: [
    { id: "case-1", name: "NZXT H510 Mid-Tower ATX (Tempered Glass, RGB)", price: 5500 },
    { id: "case-2", name: "Lian Li PC-O11 Dynamic ATX Premium Build", price: 9500 },
  ],
};

// Format price from number to currency string
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0 
  }).format(price);
};

export const calculateBuildCost = (components: Record<string, string>): number => {
  let totalCost = 0;
  
  for (const componentType in components) {
    const componentId = components[componentType as ComponentType];
    if (componentId) {
      const component = componentPrices[componentType as ComponentType]?.find(c => c.id === componentId);
      if (component) {
        totalCost += component.price;
      }
    }
  }
  
  return totalCost;
};

export const getComponentPrice = (componentType: ComponentType, componentId: string): number => {
  const component = componentPrices[componentType]?.find(c => c.id === componentId);
  return component ? component.price : 0;
};

export const getComponentsWithinBudget = (
  componentType: ComponentType,
  budget: number,
  currentBuildCost: number,
  selectedComponents: Record<ComponentType, string>
): any[] => {
  const availableComponents = componentPrices[componentType];
  
  if (!availableComponents) {
    console.warn(`No components found for type: ${componentType}`);
    return [];
  }
  
  const selectedComponentCost = Object.entries(selectedComponents)
    .filter(([type, id]) => type !== componentType && id !== "")
    .reduce((acc, [type, id]) => {
      const component = componentPrices[type as ComponentType].find(c => c.id === id);
      return acc + (component ? component.price : 0);
    }, 0);
  
  const remainingBudget = budget - selectedComponentCost;
  
  return availableComponents.filter(component => component.price <= remainingBudget);
};

export const getComponentDetails = (componentType: ComponentType, componentId: string): any | undefined => {
  return componentPrices[componentType].find(c => c.id === componentId);
};

export const getRecommendedBuild = (buildType: string, budget: number): Record<ComponentType, string> => {
  let recommendation: Record<ComponentType, string> = {
    processor: "",
    graphics: "",
    memory: "",
    storage: "",
    cooling: "",
    power: "",
    motherboard: "",
    pcCase: "",
  };
  
  try {
    // Allocate budget percentages based on build type
    let budgetAllocation: Record<ComponentType, number> = {
      processor: 0.2,
      graphics: 0.3,
      memory: 0.1,
      storage: 0.1,
      cooling: 0.05,
      power: 0.08,
      motherboard: 0.12,
      pcCase: 0.05,
    };
    
    // Adjust allocations based on build type
    if (buildType === "gaming" || buildType === "GPU-Focused") {
      budgetAllocation.graphics = 0.35;
      budgetAllocation.processor = 0.18;
    } else if (buildType === "productivity" || buildType === "CPU-Focused") {
      budgetAllocation.processor = 0.3;
      budgetAllocation.memory = 0.15;
      budgetAllocation.graphics = 0.2;
    } else if (buildType === "streaming") {
      budgetAllocation.processor = 0.25;
      budgetAllocation.memory = 0.12;
    } else if (buildType === "budget") {
      // Balance components more evenly for budget builds
      budgetAllocation.processor = 0.22;
      budgetAllocation.graphics = 0.25;
    }
    
    // Calculate component budget caps
    const componentBudgets: Record<ComponentType, number> = {} as Record<ComponentType, number>;
    Object.keys(budgetAllocation).forEach((component) => {
      componentBudgets[component as ComponentType] = Math.floor(budget * budgetAllocation[component as ComponentType]);
    });
    
    // Select components based on allocated budgets
    Object.keys(componentBudgets).forEach((componentKey) => {
      const type = componentKey as ComponentType;
      const componentBudget = componentBudgets[type];
      
      // Get all components of this type that fit within the budget
      const availableComponents = componentPrices[type].filter((component) => component.price <= componentBudget);
      
      if (availableComponents.length > 0) {
        // Sort by price (descending) to get the best within budget
        availableComponents.sort((a, b) => b.price - a.price);
        
        // Select the best component within budget (typically the most expensive one)
        let selectedIndex = 0;
        
        // For some components, we might want to leave some budget for other parts
        if (type === "graphics" || type === "processor") {
          // Take the highest but leave about 10-15% buffer to avoid extreme skew
          const highestPrice = availableComponents[0].price;
          const threshold = componentBudget * 0.85;
          
          // Find the most expensive component that's under our threshold
          for (let i = 0; i < availableComponents.length; i++) {
            if (availableComponents[i].price <= threshold) {
              selectedIndex = i;
              break;
            }
          }
        }
        
        recommendation[type] = availableComponents[selectedIndex].id;
      } else {
        // If nothing fits the budget, get the cheapest option
        const cheapestOption = componentPrices[type].sort((a, b) => a.price - b.price)[0];
        recommendation[type] = cheapestOption.id;
      }
    });
    
    // Ensure socket compatibility between CPU and motherboard
    const cpuSocket = getComponentDetails("processor", recommendation.processor)?.name?.match(/\(LGA \d+\)|\(AM\d\+?\)/i)?.[0] || "";
    if (cpuSocket) {
      // Find compatible motherboard
      const compatibleMotherboards = componentPrices.motherboard.filter(mobo => 
        mobo.name.includes(cpuSocket.replace(/[()]/g, ''))
      );
      
      if (compatibleMotherboards.length > 0) {
        // Sort by price descending but within budget
        compatibleMotherboards.sort((a, b) => b.price - a.price);
        const affordable = compatibleMotherboards.filter(m => m.price <= componentBudgets.motherboard);
        
        if (affordable.length > 0) {
          recommendation.motherboard = affordable[0].id;
        } else {
          // If no affordable compatible motherboard, get the cheapest compatible one
          compatibleMotherboards.sort((a, b) => a.price - b.price);
          recommendation.motherboard = compatibleMotherboards[0].id;
        }
      }
    }
    
    // Ensure each component is filled
    Object.keys(recommendation).forEach((key) => {
      const type = key as ComponentType;
      if (!recommendation[type]) {
        // If any component is empty, select the cheapest option
        recommendation[type] = componentPrices[type][0].id;
      }
    });
  } catch (error) {
    console.error("Error in getRecommendedBuild:", error);
    // Fallback to default selections (cheapest options)
    Object.keys(recommendation).forEach((key) => {
      const type = key as ComponentType;
      if (componentPrices[type].length > 0) {
        recommendation[type] = componentPrices[type][0].id;
      }
    });
  }
  
  return recommendation;
};

// Add a function to get multiple recommended builds based on the build type and budget
export const getRecommendedBuilds = (buildType: string, budget: number): BuildRecommendation[] => {
  // Get the base recommended components
  const baseComponents = getRecommendedBuild(buildType, budget);
  
  // Calculate the total price
  const basePrice = calculateBuildCost(baseComponents);
  
  // Create different variations of builds
  const recommendations: BuildRecommendation[] = [
    {
      name: `Recommended ${buildType.charAt(0).toUpperCase() + buildType.slice(1)} Build`,
      description: `Optimized ${buildType} build within your budget with balanced performance`,
      totalPrice: basePrice,
      components: { ...baseComponents }
    }
  ];
  
  // Add a performance-focused build (spend more on CPU/GPU, less on aesthetics)
  const performanceComponents = { ...baseComponents };
  
  // Try to upgrade processor if possible
  const currentProcessor = componentPrices.processor.find(c => c.id === baseComponents.processor);
  const betterProcessors = componentPrices.processor
    .filter(c => c.price > (currentProcessor?.price || 0) && c.price <= (currentProcessor?.price || 0) * 1.3)
    .sort((a, b) => a.price - b.price);
    
  if (betterProcessors.length > 0) {
    performanceComponents.processor = betterProcessors[0].id;
    
    // Maybe downgrade case to compensate
    const cheaperCases = componentPrices.pcCase
      .filter(c => c.price < componentPrices.pcCase.find(c => c.id === baseComponents.pcCase)?.price || 0)
      .sort((a, b) => b.price - a.price);
      
    if (cheaperCases.length > 0) {
      performanceComponents.pcCase = cheaperCases[0].id;
    }
  }
  
  const performancePrice = calculateBuildCost(performanceComponents);
  
  recommendations.push({
    name: `Performance ${buildType.charAt(0).toUpperCase() + buildType.slice(1)} Build`,
    description: `Focused on maximum ${buildType} performance with premium components`,
    totalPrice: performancePrice,
    components: performanceComponents
  });
  
  // Add a value build variant (more balanced, maybe slightly lower specs but better value)
  const valueComponents = { ...baseComponents };
  
  // Try to find better value memory
  const currentMemory = componentPrices.memory.find(c => c.id === baseComponents.memory);
  const betterValueMemory = componentPrices.memory
    .filter(c => c.price < (currentMemory?.price || 0) && c.price >= (currentMemory?.price || 0) * 0.7)
    .sort((a, b) => b.price - a.price);
  
  if (betterValueMemory.length > 0) {
    valueComponents.memory = betterValueMemory[0].id;
  }
  
  const valuePrice = calculateBuildCost(valueComponents);
  
  recommendations.push({
    name: `Value ${buildType.charAt(0).toUpperCase() + buildType.slice(1)} Build`,
    description: `Great price-to-performance ratio with smart component choices`,
    totalPrice: valuePrice,
    components: valueComponents
  });
  
  return recommendations;
};

export const estimateWeight = (components: Record<string, string>): number => {
  let totalWeight = 0;
  
  // Assign approximate weights to each component type
  const weights: Record<ComponentType, number> = {
    processor: 0.1,
    graphics: 0.8,
    memory: 0.2,
    storage: 0.3,
    cooling: 0.5,
    power: 1.5,
    motherboard: 0.7,
    pcCase: 5.0,
  };
  
  for (const componentType in components) {
    const componentId = components[componentType as ComponentType];
    if (componentId && weights[componentType as ComponentType]) {
      totalWeight += weights[componentType as ComponentType];
    }
  }
  
  return totalWeight;
};

// Add the missing component pricing functions
export const getComponentsByCategory = (buildType: string, budget: string): Record<ComponentType, any[]> => {
  console.log(`Getting components for build type ${buildType} and budget ${budget}`);
  
  // Convert budget string to budget range
  let budgetMin = 0;
  let budgetMax = 0;
  
  switch (budget) {
    case "budget":
      budgetMin = 40000;
      budgetMax = 60000;
      break;
    case "midrange":
      budgetMin = 60000;
      budgetMax = 120000;
      break;
    case "highend":
      budgetMin = 120000;
      budgetMax = 200000;
      break;
    case "extreme":
      budgetMin = 200000;
      budgetMax = 500000;
      break;
    default:
      budgetMin = 0;
      budgetMax = 0;
  }
  
  // Simple function to filter components based on budget and build type
  try {
    return {
      processor: componentPrices.processor.filter(c => {
        // For gaming builds, limit high-end CPUs in lower budgets
        if (buildType === "gaming" && budget === "budget" && c.price > budgetMin * 0.25) {
          return false;
        }
        return true;
      }),
      graphics: componentPrices.graphics.filter(c => {
        // For gaming builds, allocate more to GPU
        if (buildType === "gaming" && budget === "budget" && c.price > budgetMin * 0.4) {
          return false;
        }
        return true;
      }),
      memory: componentPrices.memory,
      storage: componentPrices.storage,
      cooling: componentPrices.cooling,
      power: componentPrices.power,
      motherboard: componentPrices.motherboard,
      pcCase: componentPrices.pcCase
    };
  } catch (error) {
    console.error("Error filtering components:", error);
    toast.error("Failed to load components. Using all available components instead.");
    return componentPrices;
  }
};

// Calculate total cost of all components
export const calculateTotalComponentCost = (formData: any, selectedExtraStorage: any[] = []): number => {
  let totalCost = 0;
  
  // Add up costs of all main components
  Object.keys(componentPrices).forEach(componentType => {
    const componentId = formData[componentType];
    if (componentId) {
      const component = componentPrices[componentType as ComponentType].find(c => c.id === componentId);
      if (component) {
        totalCost += component.price;
      }
    }
  });
  
  // Add costs of any extra storage
  if (selectedExtraStorage && selectedExtraStorage.length > 0) {
    selectedExtraStorage.forEach(item => {
      totalCost += item.price || 0;
    });
  }
  
  return totalCost;
};
