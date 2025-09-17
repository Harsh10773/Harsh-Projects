
import React, { useState } from 'react';
import { Bot, Check, ChevronsUpDown, X, IndianRupee } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import PCBuild3DView from "./PCBuild3DView";
import {
  type ComponentType,
  type BuildRecommendation,
  getRecommendedBuilds,
  componentPrices,
  formatPrice
} from "@/utils/componentPricing";

interface AIBuildAssistantProps {
  onSelectBuild: (components: Record<ComponentType, string>) => void;
}

const AIBuildAssistant: React.FC<AIBuildAssistantProps> = ({ onSelectBuild }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [useCase, setUseCase] = useState<string>("");
  const [budget, setBudget] = useState<number>(0);
  const [customBudget, setCustomBudget] = useState<string>("");
  const [recommendations, setRecommendations] = useState<BuildRecommendation[]>([]);
  const [selectedBuildIndex, setSelectedBuildIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const useCaseOptions = [
    { id: 'gaming', label: 'Gaming PC', description: 'Optimized for playing games at high frame rates' },
    { id: 'workstation', label: 'Content Creation', description: 'For video editing, 3D rendering, and other intensive tasks' },
    { id: 'streaming', label: 'Streaming Setup', description: 'For live streaming games and content to platforms like Twitch' },
    { id: 'office', label: 'Office Work', description: 'For productivity, web browsing, and everyday tasks' },
  ];

  const budgetOptions = [
    { value: 60000, label: "₹60,000 - Budget Build" },
    { value: 90000, label: "₹90,000 - Mid-Range Build" },
    { value: 135000, label: "₹1,35,000 - High-End Build" },
    { value: 185000, label: "₹1,85,000 - Premium Build" },
    { value: 260000, label: "₹2,60,000 - Extreme Build" },
    { value: 0, label: "Custom Budget" },
  ];

  const handleOpen = () => {
    setIsOpen(true);
    setStep(0);
    setUseCase("");
    setBudget(0);
    setCustomBudget("");
    setRecommendations([]);
    setSelectedBuildIndex(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleUseCaseSelect = (value: string) => {
    setUseCase(value);
    setStep(1);
  };

  const handleBudgetSelect = (value: string) => {
    const budgetValue = parseInt(value);
    setBudget(budgetValue);
    
    if (budgetValue === 0) {
      // User selected custom budget
      setCustomBudget("");
    } else {
      // Move to recommendations
      generateRecommendations(useCase, budgetValue);
    }
  };

  const handleCustomBudgetSubmit = () => {
    const parsedBudget = parseInt(customBudget);
    if (isNaN(parsedBudget) || parsedBudget < 40000) {
      toast.error("Please enter a valid budget of at least ₹40,000");
      return;
    }
    
    setBudget(parsedBudget);
    generateRecommendations(useCase, parsedBudget);
  };

  const generateRecommendations = (useCase: string, budget: number) => {
    setLoading(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const recommendations = getRecommendedBuilds(useCase, budget);
      setRecommendations(recommendations);
      setSelectedBuildIndex(recommendations.length > 0 ? 0 : null);
      setStep(2);
      setLoading(false);
    }, 1500);
  };

  const handleSelectBuild = () => {
    if (selectedBuildIndex !== null && recommendations[selectedBuildIndex]) {
      const selectedBuild = recommendations[selectedBuildIndex];
      
      // Pass both components and their names to the parent
      onSelectBuild(selectedBuild.components);
      toast.success(`${selectedBuild.name} has been applied to your build!`);
      handleClose();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(price);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full border-accent/50 hover:bg-accent/20 flex items-center gap-2 mb-6"
        onClick={handleOpen}
      >
        <Bot className="h-5 w-5 text-accent" />
        Let AI Build it For Me
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-accent" />
              AI PC Builder Assistant
            </DialogTitle>
            <DialogDescription>
              Answer a few questions and I'll recommend the perfect PC build for your needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6">
            {step === 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">What will you use your PC for?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {useCaseOptions.map((option) => (
                    <Card 
                      key={option.id} 
                      className={`cursor-pointer transition-all ${useCase === option.id ? 'border-accent bg-accent/10' : 'hover:border-accent/50'}`}
                      onClick={() => handleUseCaseSelect(option.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md">{option.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-foreground/70 text-sm">
                          {option.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">What's your budget?</h3>
                
                <RadioGroup 
                  value={budget.toString()} 
                  onValueChange={handleBudgetSelect}
                  className="space-y-3"
                >
                  {budgetOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value.toString()} id={`budget-${option.value}`} />
                      <Label htmlFor={`budget-${option.value}`} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                {budget === 0 && (
                  <div className="pt-4 space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="space-y-2 flex-1">
                        <Label htmlFor="custom-budget">Enter your custom budget (₹)</Label>
                        <Input 
                          id="custom-budget" 
                          type="number" 
                          placeholder="e.g. 75000"
                          value={customBudget}
                          onChange={(e) => setCustomBudget(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleCustomBudgetSubmit}>Continue</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {step === 2 && loading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 rounded-full bg-accent/10 animate-pulse">
                    <Bot className="h-8 w-8 text-accent" />
                  </div>
                  <p className="text-foreground/70">
                    AI is analyzing the best builds for your {useCaseOptions.find(u => u.id === useCase)?.label.toLowerCase()} within {formatPrice(budget)}...
                  </p>
                </div>
              </div>
            )}
            
            {step === 2 && !loading && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Recommended PC Builds for You</h3>
                
                {recommendations.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-foreground/70">
                      No suitable builds found for your budget. Try increasing your budget or selecting different requirements.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => setStep(1)}>
                      Adjust Budget
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {recommendations.map((build, index) => (
                          <Card 
                            key={index} 
                            className={`cursor-pointer transition-all ${selectedBuildIndex === index ? 'border-accent bg-accent/10' : 'hover:border-accent/50'}`}
                            onClick={() => setSelectedBuildIndex(index)}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-md">{build.name}</CardTitle>
                                <span className="text-accent font-bold">{formatPrice(build.totalPrice)}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <CardDescription className="text-foreground/70 text-sm">
                                {build.description}
                              </CardDescription>
                              
                              <div className="space-y-1 pt-2">
                                {Object.entries(build.components).map(([type, componentId]) => (
                                  componentId ? (
                                    <div key={type} className="flex justify-between text-xs">
                                      <span className="text-foreground/70">{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
                                      <span className="font-medium text-right">
                                        {componentPrices[type as ComponentType].find(c => c.id === componentId)?.name}
                                      </span>
                                    </div>
                                  ) : null
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {selectedBuildIndex !== null && (
                        <div className="space-y-4">
                          <h4 className="font-medium">Build Preview</h4>
                          <PCBuild3DView components={recommendations[selectedBuildIndex].components} showBrands={true} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="p-4 border-t bg-card/30">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <div className="flex-1"></div>
            {step === 2 && selectedBuildIndex !== null && (
              <Button onClick={handleSelectBuild} className="bg-accent hover:bg-accent/90">
                Select This Build
              </Button>
            )}
            <Button variant="ghost" onClick={handleClose}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIBuildAssistant;
