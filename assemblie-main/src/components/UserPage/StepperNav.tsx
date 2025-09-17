
import React from 'react';
import { Trophy, Microchip, User, Rocket, Shield, Package, Home, CreditCard } from 'lucide-react';

interface StepperNavProps {
  steps: string[];
  currentStep: number;
}

const StepperNav: React.FC<StepperNavProps> = ({ steps, currentStep }) => {
  // Map icons to steps
  const getStepIcon = (index: number) => {
    switch(index) {
      case 0: return <Microchip className="h-4 w-4" />;
      case 1: return <Trophy className="h-4 w-4" />;
      case 2: return <User className="h-4 w-4" />;
      case 3: return <Home className="h-4 w-4" />;
      case 4: return <Package className="h-4 w-4" />;
      case 5: return <CreditCard className="h-4 w-4" />;
      case 6: return <Rocket className="h-4 w-4" />;
      case 7: return <Shield className="h-4 w-4" />;
      default: return <Microchip className="h-4 w-4" />;
    }
  };

  return (
    <div className="enhanced-card p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
      <div className="relative z-10">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${
                index < currentStep ? "text-accent" : index === currentStep ? "text-white" : "text-muted-foreground"
              }`}
            >
              <div 
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 ${
                  index < currentStep 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : index === currentStep 
                    ? "border-2 border-accent bg-accent/10 text-accent animate-pulse-light" 
                    : "border border-muted-foreground bg-card/50"
                }`}
              >
                {getStepIcon(index)}
              </div>
              <span className="text-[10px] sm:text-xs hidden xs:block font-medium">{step}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 h-2 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-accent/80 to-accent transition-all" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StepperNav;
