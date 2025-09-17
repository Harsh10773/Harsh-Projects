import React from 'react';
import { Computer, Monitor, Microchip, HardDrive, Gamepad, Joystick } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AIBuildAssistant from "@/components/AIBuildAssistant";
import BuildSummary from "@/components/UserPage/BuildSummary";
import { Card, CardContent } from "@/components/ui/card";
interface BuildTypeStepProps {
  formData: {
    buildType: string;
    budget: string;
    budgetAmount: number;
    processor?: string;
    graphics?: string;
    memory?: string;
    storage?: string;
    cooling?: string;
    power?: string;
    motherboard?: string;
    pcCase?: string;
  };
  handleInputChange: (name: string, value: string) => void;
  handleBudgetChange: (budget: string, amount: number) => void;
  handleApplyAIBuild: (components: any) => void;
  componentNames: {
    processor: string;
    graphics: string;
    memory: string;
    storage: string;
    cooling: string;
    power: string;
    motherboard: string;
    pcCase: string;
  };
  goToNextStep: () => void;
}
const BuildTypeStep: React.FC<BuildTypeStepProps> = ({
  formData,
  handleInputChange,
  handleBudgetChange,
  handleApplyAIBuild,
  componentNames,
  goToNextStep
}) => {
  const buildTypes = [{
    id: "gaming",
    label: "Gaming PC",
    icon: <Gamepad className="h-5 w-5" />
  }, {
    id: "workstation",
    label: "Workstation",
    icon: <Monitor className="h-5 w-5" />
  }, {
    id: "streaming",
    label: "Streaming Setup",
    icon: <Microchip className="h-5 w-5" />
  }, {
    id: "office",
    label: "Office PC",
    icon: <HardDrive className="h-5 w-5" />
  }];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e.target.name, e.target.value);
  };
  const handleSelectChange = (name: string, value: string) => {
    let budgetAmount = 0;

    // Convert budget selection to numerical value
    switch (value) {
      case "budget":
        budgetAmount = 60000;
        break;
      case "midrange":
        budgetAmount = 120000;
        break;
      case "highend":
        budgetAmount = 200000;
        break;
      case "extreme":
        budgetAmount = 300000;
        break;
    }
    handleBudgetChange(value, budgetAmount);
  };
  const onSelectAIBuild = (components: any) => {
    handleApplyAIBuild(components);
    // Automatically proceed to next step when AI build is selected
    setTimeout(() => {
      goToNextStep();
    }, 500);
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  return <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="border-accent/20 shadow-md relative overflow-hidden rgb-panel">
            <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
            <CardContent className="pt-6 relative z-10">
              <h2 className="text-2xl font-bold mb-5 text-gradient bg-gradient-to-r from-assemblie-purple via-accent to-accent">Choose Your Battle Station</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {buildTypes.map(type => <div key={type.id} className="relative perspective">
                    <input type="radio" id={type.id} name="buildType" value={type.id} checked={formData.buildType === type.id} onChange={handleChange} className="peer sr-only" />
                    <label htmlFor={type.id} className="flex items-center p-5 bg-card/60 border-2 border-border/40 rounded-lg cursor-pointer transition-all hover:border-accent/50 peer-checked:border-accent peer-checked:bg-accent/10 transform-gpu hover:translate-y-[-5px] hover:shadow-lg hover:shadow-accent/20 duration-300">
                      <div className="mr-4 p-3 bg-accent/10 rounded-full text-accent animate-pulse-light">
                        {type.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{type.label}</p>
                      </div>
                    </label>
                  </div>)}
              </div>
            </CardContent>
          </Card>
          
          {formData.buildType && !formData.processor && <div className="grid grid-cols-1 gap-8">
              <Card className="border-accent/20 shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-background"></div>
                <CardContent className="pt-6 relative z-10">
                  <h2 className="text-2xl font-bold mb-5 text-gradient bg-gradient-to-r from-assemblie-purple via-accent to-accent">Select Your Power Level</h2>
                  <Select onValueChange={value => handleSelectChange("budget", value)}>
                    <SelectTrigger className="w-full bg-card/70 border-accent/30 hover:border-accent/50 transition-colors">
                      <SelectValue placeholder="Select your budget range" />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 border-accent/20">
                      <SelectItem value="budget" className="hover:bg-accent/10">Entry Level (₹40,000 - ₹60,000)</SelectItem>
                      <SelectItem value="midrange" className="hover:bg-accent/10">Mid-Range (₹60,000 - ₹120,000)</SelectItem>
                      <SelectItem value="highend" className="hover:bg-accent/10">High-End (₹120,000 - ₹200,000)</SelectItem>
                      <SelectItem value="extreme" className="hover:bg-accent/10">Extreme (₹200,000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              <Card className="border-primary/10 shadow-lg bg-gradient-to-br from-accent/10 to-background relative overflow-hidden">
                <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-accent/20 rounded-lg mr-3">
                      <Joystick className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-gradient bg-gradient-to-r from-accent to-primary">AI Build Assistant</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Let our AI build a custom PC tailored to your selected build type</p>
                  <AIBuildAssistant onSelectBuild={onSelectAIBuild} />
                </CardContent>
              </Card>
            </div>}
        </div>
        
        {/* PC Build Preview - Always visible */}
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-background shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
              <CardContent className="p-5 relative z-10 px-0 mx-0 my-[17px] py-[36px] rounded-3xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Computer className="h-4 w-4 text-accent mr-2" />
                  <span className="text-gradient bg-gradient-to-r from-accent to-primary">Your Virtual PC</span>
                </h3>
                <div className="bg-card/70 rounded-lg p-4 border border-accent/20 shadow-inner px-[15px]">
                  <BuildSummary formData={{
                  processor: formData.processor || "",
                  graphics: formData.graphics || "",
                  memory: formData.memory || "",
                  storage: formData.storage || "",
                  cooling: formData.cooling || "",
                  power: formData.power || "",
                  motherboard: formData.motherboard || "",
                  pcCase: formData.pcCase || ""
                }} buildCost={0} extraStorageCost={0} totalComponentCost={0} buildWeight={5} // Default weight
                formatPrice={formatPrice} componentNames={componentNames} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default BuildTypeStep;