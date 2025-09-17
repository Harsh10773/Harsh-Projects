
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ShippingStepProps {
  formData: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  handleInputChange: (name: string, value: string) => void;
}

const ShippingStep: React.FC<ShippingStepProps> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
      <p className="text-foreground/70 mb-6">
        Please enter your shipping address for delivery of your custom PC
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            name="street"
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingStep;
