import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, HardDrive, Zap, Fan, Layers, Package2, Microchip, MemoryStick, IndianRupee, Computer } from "lucide-react";
import { ComponentType } from "@/utils/componentPricing";
import ExtraStorageOptions from "@/components/ExtraStorageOptions";
import BuildSummary from "@/components/UserPage/BuildSummary";
import { Card, CardContent } from "@/components/ui/card";

interface ComponentsStepProps {
  formData: {
    buildType: string;
    budget: string;
    budgetAmount: number;
    processor: string;
    graphics: string;
    memory: string;
    storage: string;
    cooling: string;
    power: string;
    motherboard: string;
    pcCase: string;
  };
  availableComponents: Record<ComponentType, any[]>;
  totalComponentCost: number;
  handleSelectChange: (name: string, value: string) => void;
  handleApplyRecommendation: (component: string, value: string) => void;
  handleExtraStorageSelect: (selectedStorage: Array<{id: string, name: string, price: number, type: string}>) => void;
  formatPrice: (price: number) => string;
  selectedExtraStorage?: Array<{id: string, name: string, price: number, type: string}>;
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
  setComponentNames?: (names: any) => void;
}

const ComponentsStep: React.FC<ComponentsStepProps> = ({
  formData,
  availableComponents,
  totalComponentCost,
  handleSelectChange,
  handleApplyRecommendation,
  handleExtraStorageSelect,
  formatPrice,
  selectedExtraStorage = [],
  componentNames = {
    processor: "",
    graphics: "",
    memory: "",
    storage: "",
    cooling: "",
    power: "",
    motherboard: "",
    pcCase: ""
  },
  setComponentNames
}) => {
  // Get the full component name by ID
  const getComponentNameById = (type: ComponentType, id: string): string => {
    if (!id) return "";
    const component = availableComponents[type]?.find(c => c.id === id);
    return component ? component.name : "";
  };

  // Handle component selection and track the component names
  const handleComponentSelect = (name: string, value: string) => {
    // Call the parent handler
    handleSelectChange(name, value);
    
    // Update component names if the setter is provided
    if (setComponentNames) {
      const componentName = getComponentNameById(name as ComponentType, value);
      console.log(`Selected ${name}: ${componentName} (ID: ${value})`);
      
      setComponentNames({
        ...componentNames,
        [name]: componentName
      });
    }
  };

  // Initialize component names on first render
  useEffect(() => {
    if (setComponentNames) {
      const initialNames = {
        processor: getComponentNameById('processor', formData.processor),
        graphics: getComponentNameById('graphics', formData.graphics),
        memory: getComponentNameById('memory', formData.memory),
        storage: getComponentNameById('storage', formData.storage),
        cooling: getComponentNameById('cooling', formData.cooling),
        power: getComponentNameById('power', formData.power),
        motherboard: getComponentNameById('motherboard', formData.motherboard),
        pcCase: getComponentNameById('pcCase', formData.pcCase)
      };
      
      setComponentNames(initialNames);
      console.log('Initial component names:', initialNames);
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-primary/10 shadow-md">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Select Your Components</h2>
            
            {formData.budgetAmount > 0 && (
              <div className="flex items-center gap-2 bg-card p-2 rounded-lg shadow-sm border border-border/50">
                <IndianRupee className="h-4 w-4 text-accent" />
                <div className="text-sm">
                  <span className="font-medium">{formatPrice(totalComponentCost)}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span>{formatPrice(formData.budgetAmount)}</span>
                </div>
                
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${totalComponentCost > formData.budgetAmount ? 'bg-destructive' : 'bg-accent'}`}
                    style={{ width: `${Math.min(totalComponentCost / formData.budgetAmount * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Component selection lists in grid layout with PC preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="border-accent/20 shadow-md">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Component selection lists */}
                <div className="space-y-4">
                  <Label htmlFor="processor" className="flex items-center gap-2 text-sm font-medium">
                    <Cpu className="h-4 w-4 text-accent" /> Processor (CPU)
                  </Label>
                  <Select 
                    onValueChange={(value) => handleComponentSelect("processor", value)} 
                    value={formData.processor} 
                    disabled={availableComponents.processor.length === 0}
                  >
                    <SelectTrigger id="processor" className="bg-card/50">
                      <SelectValue placeholder="Select processor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.processor.map(cpu => (
                        <SelectItem key={cpu.id} value={cpu.id} className="flex justify-between">
                          <span className="flex-1">{cpu.name}</span>
                          <span className="text-muted-foreground">{formatPrice(cpu.price)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.processor && (
                    <p className="text-xs text-muted-foreground">
                      {getComponentNameById('processor', formData.processor)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="motherboard" className="flex items-center gap-2 text-sm font-medium">
                    <Layers className="h-4 w-4 text-accent" /> Motherboard
                  </Label>
                  <Select 
                    onValueChange={(value) => handleComponentSelect("motherboard", value)} 
                    value={formData.motherboard}
                    disabled={availableComponents.motherboard.length === 0}
                  >
                    <SelectTrigger id="motherboard" className="bg-card/50">
                      <SelectValue placeholder="Select motherboard" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.motherboard.map(mobo => (
                        <SelectItem key={mobo.id} value={mobo.id}>
                          <span className="flex-1">{mobo.name}</span>
                          <span className="text-muted-foreground">{formatPrice(mobo.price)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.motherboard && (
                    <p className="text-xs text-muted-foreground">
                      {getComponentNameById('motherboard', formData.motherboard)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="graphics" className="flex items-center gap-2 text-sm font-medium">
                    <Microchip className="h-4 w-4 text-accent" /> Graphics Card (GPU)
                  </Label>
                  <Select 
                    onValueChange={(value) => handleComponentSelect("graphics", value)} 
                    value={formData.graphics}
                    disabled={availableComponents.graphics.length === 0}
                  >
                    <SelectTrigger id="graphics" className="bg-card/50">
                      <SelectValue placeholder="Select graphics card" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.graphics.map(gpu => (
                        <SelectItem key={gpu.id} value={gpu.id}>
                          <span className="flex-1">{gpu.name}</span>
                          <span className="text-muted-foreground">{formatPrice(gpu.price)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.graphics && (
                    <p className="text-xs text-muted-foreground">
                      {getComponentNameById('graphics', formData.graphics)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="memory" className="flex items-center gap-2 text-sm font-medium">
                    <MemoryStick className="h-4 w-4 text-accent" /> Memory (RAM)
                  </Label>
                  <Select 
                    onValueChange={(value) => handleComponentSelect("memory", value)} 
                    value={formData.memory}
                    disabled={availableComponents.memory.length === 0}
                  >
                    <SelectTrigger id="memory" className="bg-card/50">
                      <SelectValue placeholder="Select memory" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.memory.map(ram => (
                        <SelectItem key={ram.id} value={ram.id}>
                          <span className="flex-1">{ram.name}</span>
                          <span className="text-muted-foreground">{formatPrice(ram.price)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.memory && (
                    <p className="text-xs text-muted-foreground">
                      {getComponentNameById('memory', formData.memory)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="storage" className="flex items-center gap-2 text-sm font-medium">
                    <HardDrive className="h-4 w-4 text-accent" /> Storage
                  </Label>
                  <Select 
                    onValueChange={(value) => handleComponentSelect("storage", value)} 
                    value={formData.storage}
                    disabled={availableComponents.storage.length === 0}
                  >
                    <SelectTrigger id="storage" className="bg-card/50">
                      <SelectValue placeholder="Select storage" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.storage.map(storage => (
                        <SelectItem key={storage.id} value={storage.id}>
                          <span className="flex-1">{storage.name}</span>
                          <span className="text-muted-foreground">{formatPrice(storage.price)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.storage && (
                    <p className="text-xs text-muted-foreground">
                      {getComponentNameById('storage', formData.storage)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="cooling" className="flex items-center gap-2 text-sm font-medium">
                    <Fan className="h-4 w-4 text-accent" /> Cooling Solution
                  </Label>
                  <Select 
                    onValueChange={(value) => handleComponentSelect("cooling", value)} 
                    value={formData.cooling}
                    disabled={availableComponents.cooling.length === 0}
                  >
                    <SelectTrigger id="cooling" className="bg-card/50">
                      <SelectValue placeholder="Select cooling" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.cooling.map(cooling => (
                        <SelectItem key={cooling.id} value={cooling.id}>
                          <span className="flex-1">{cooling.name}</span>
                          <span className="text-muted-foreground">{formatPrice(cooling.price)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.cooling && (
                    <p className="text-xs text-muted-foreground">
                      {getComponentNameById('cooling', formData.cooling)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="power" className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="h-4 w-4 text-accent" /> Power Supply
                  </Label>
                  <Select 
                    onValueChange={(value) => handleComponentSelect("power", value)} 
                    value={formData.power}
                    disabled={availableComponents.power.length === 0}
                  >
                    <SelectTrigger id="power" className="bg-card/50">
                      <SelectValue placeholder="Select power supply" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.power.map(power => (
                        <SelectItem key={power.id} value={power.id}>
                          <span className="flex-1">{power.name}</span>
                          <span className="text-muted-foreground">{formatPrice(power.price)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.power && (
                    <p className="text-xs text-muted-foreground">
                      {getComponentNameById('power', formData.power)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="pcCase" className="flex items-center gap-2 text-sm font-medium">
                    <Package2 className="h-4 w-4 text-accent" /> PC Case
                  </Label>
                  <Select 
                    onValueChange={(value) => handleComponentSelect("pcCase", value)} 
                    value={formData.pcCase}
                    disabled={availableComponents.pcCase.length === 0}
                  >
                    <SelectTrigger id="pcCase" className="bg-card/50">
                      <SelectValue placeholder="Select PC case" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.pcCase.map(pcCase => (
                        <SelectItem key={pcCase.id} value={pcCase.id}>
                          <span className="flex-1">{pcCase.name}</span>
                          <span className="text-muted-foreground">{formatPrice(pcCase.price)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.pcCase && (
                    <p className="text-xs text-muted-foreground">
                      {getComponentNameById('pcCase', formData.pcCase)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-8">
                <ExtraStorageOptions onStorageSelect={handleExtraStorageSelect} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* PC Build Preview */}
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-background shadow-lg">
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Computer className="h-4 w-4 text-accent mr-2" />
                  Your PC Preview
                </h3>
                <div className="bg-card/70 rounded-lg p-4 border border-border/50">
                  <BuildSummary 
                    formData={{
                      processor: formData.processor || "",
                      graphics: formData.graphics || "",
                      memory: formData.memory || "",
                      storage: formData.storage || "",
                      cooling: formData.cooling || "",
                      power: formData.power || "",
                      motherboard: formData.motherboard || "",
                      pcCase: formData.pcCase || ""
                    }}
                    buildCost={totalComponentCost}
                    extraStorageCost={selectedExtraStorage.reduce((total, item) => total + item.price, 0)}
                    totalComponentCost={totalComponentCost + selectedExtraStorage.reduce((total, item) => total + item.price, 0)}
                    buildWeight={7.5} // Default weight
                    formatPrice={formatPrice}
                    componentNames={componentNames}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {formData.budgetAmount > 0 && totalComponentCost > formData.budgetAmount && (
        <Card className="border-destructive/20 shadow-md bg-destructive/5">
          <CardContent className="p-5">
            <p className="font-medium text-destructive flex items-center">
              <IndianRupee className="h-4 w-4 mr-2" />
              Your build is over budget by {formatPrice(totalComponentCost - formData.budgetAmount)}
            </p>
            <p className="text-muted-foreground mt-2">
              Consider downgrading some components or increasing your budget.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComponentsStep;
