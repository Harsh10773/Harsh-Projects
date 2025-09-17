
import React from 'react';
import { Scale } from "lucide-react";
import PCBuild3DView from "@/components/PCBuild3DView";

interface BuildSummaryProps {
  formData: {
    processor: string;
    graphics: string;
    memory: string;
    storage: string;
    cooling: string;
    power: string;
    motherboard: string;
    pcCase: string;
  };
  buildCost: number;
  extraStorageCost: number;
  totalComponentCost: number;
  buildWeight: number;
  formatPrice: (price: number) => string;
  componentNames?: {
    processor: string;
    graphics: string;
    memory: string;
    storage: string;
    cooling: string;
    power: string;
    motherboard: string;
    pcCase: string;
  };
}

const BuildSummary: React.FC<BuildSummaryProps> = ({
  formData,
  buildCost,
  extraStorageCost,
  totalComponentCost,
  buildWeight,
  formatPrice,
  componentNames = {}
}) => {
  // Calculate 5% build charge
  const buildCharge = totalComponentCost * 0.05;
  
  return (
    <div>
      <PCBuild3DView 
        components={{
          processor: formData.processor,
          graphics: formData.graphics,
          memory: formData.memory,
          storage: formData.storage,
          cooling: formData.cooling,
          power: formData.power,
          motherboard: formData.motherboard,
          pcCase: formData.pcCase
        }}
      />
      
      <div className="mt-4 space-y-2">
        {buildCost > 0 ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Estimated Weight: <span className="font-medium text-foreground">{buildWeight.toFixed(1)} kg</span>
              </span>
            </div>
            
            {/* Show component names if available */}
            {Object.values(componentNames).some(name => name) && (
              <div className="text-sm mt-4 space-y-1 border-t pt-2">
                <p className="font-medium mb-1">Selected Components:</p>
                
                {componentNames.processor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processor:</span>
                    <span className="font-medium truncate max-w-[65%] text-right">{componentNames.processor}</span>
                  </div>
                )}
                
                {componentNames.graphics && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Graphics:</span>
                    <span className="font-medium truncate max-w-[65%] text-right">{componentNames.graphics}</span>
                  </div>
                )}
                
                {componentNames.memory && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory:</span>
                    <span className="font-medium truncate max-w-[65%] text-right">{componentNames.memory}</span>
                  </div>
                )}
                
                {componentNames.storage && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="font-medium truncate max-w-[65%] text-right">{componentNames.storage}</span>
                  </div>
                )}
                
                {componentNames.cooling && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cooling:</span>
                    <span className="font-medium truncate max-w-[65%] text-right">{componentNames.cooling}</span>
                  </div>
                )}
                
                {componentNames.power && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Power:</span>
                    <span className="font-medium truncate max-w-[65%] text-right">{componentNames.power}</span>
                  </div>
                )}
                
                {componentNames.motherboard && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Motherboard:</span>
                    <span className="font-medium truncate max-w-[65%] text-right">{componentNames.motherboard}</span>
                  </div>
                )}
                
                {componentNames.pcCase && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Case:</span>
                    <span className="font-medium truncate max-w-[65%] text-right">{componentNames.pcCase}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-between text-sm font-medium pt-2 mt-2 border-t">
              <span>Components:</span>
              <span>{formatPrice(buildCost)}</span>
            </div>
            
            {extraStorageCost > 0 && (
              <div className="flex justify-between text-sm font-medium">
                <span>Extra Storage:</span>
                <span>{formatPrice(extraStorageCost)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm font-medium">
              <span>Build Charge (5%):</span>
              <span>{formatPrice(buildCharge)}</span>
            </div>
            
            <div className="flex justify-between text-sm font-bold pt-2 mt-2">
              <span>Base Total:</span>
              <span className="text-accent">{formatPrice(totalComponentCost + buildCharge)}</span>
            </div>
            
            <div className="text-xs text-muted-foreground mt-1">
              <p>* Delivery charges will be added at checkout</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center italic">
            Select components to see your build
          </p>
        )}
      </div>
    </div>
  );
};

export default BuildSummary;
