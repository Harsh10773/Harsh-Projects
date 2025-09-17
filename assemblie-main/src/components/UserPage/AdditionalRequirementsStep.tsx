
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface AdditionalRequirementsStepProps {
  formData: {
    additionalRequirements: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const AdditionalRequirementsStep: React.FC<AdditionalRequirementsStepProps> = ({
  formData,
  handleChange
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Additional Requirements</h2>
      
      <div className="space-y-4">
        <Label htmlFor="additionalRequirements">Any specific requirements or preferences?</Label>
        <Textarea
          id="additionalRequirements"
          name="additionalRequirements"
          placeholder="E.g., specific case preferences, RGB lighting requirements, quiet operation, etc."
          rows={5}
          value={formData.additionalRequirements}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium">Additional Options</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="rgb" />
            <label
              htmlFor="rgb"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              RGB Lighting
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="wifi" />
            <label
              htmlFor="wifi"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              WiFi Connectivity
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="bluetooth" />
            <label
              htmlFor="bluetooth"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Bluetooth
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="windows" />
            <label
              htmlFor="windows"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Windows OS License
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalRequirementsStep;
