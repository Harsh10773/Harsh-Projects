
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AddressDetailsStepProps {
  formData: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressSelect: (addressData: {
    fullAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => void;
}

const AddressDetailsStep: React.FC<AddressDetailsStepProps> = ({
  formData,
  handleChange
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
      <p className="text-foreground/70 mb-6">
        Please provide your delivery address for your order
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your complete address"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="p-4 border border-accent/30 bg-accent/5 rounded-md mt-6">
        <p className="text-sm text-accent flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Your order will be delivered to this address. Please ensure it's accurate.
        </p>
      </div>
    </div>
  );
};

export default AddressDetailsStep;
