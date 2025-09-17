
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BuildComponent {
  id: string;
  component_type: string;
  model_name: string;
  quantity: number;
  price?: number;
}

interface BuildDetailsQuotationProps {
  buildId: string;
  onQuotationSubmit?: (quotation: Record<string, number>) => void;
}

const BuildDetailsQuotation: React.FC<BuildDetailsQuotationProps> = ({ 
  buildId, 
  onQuotationSubmit 
}) => {
  const [components, setComponents] = useState<BuildComponent[]>([]);
  const [quotations, setQuotations] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuildComponents = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all components from user_builds table
        const { data, error } = await supabase
          .from('user_builds')
          .select('id, component_type, model_name, quantity, price')
          .eq('build_id', buildId);
        
        if (error) {
          console.error('Error fetching build components:', error);
          toast.error('Failed to load build details');
          return;
        }

        if (data && data.length > 0) {
          console.log('Retrieved build components:', data);
          setComponents(data);
          
          // Initialize quotations with component prices if available
          const initialQuotations: Record<string, number> = {};
          data.forEach(component => {
            initialQuotations[component.id] = component.price || 0;
          });
          setQuotations(initialQuotations);
        } else {
          console.log('No components found for build:', buildId);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (buildId) {
      fetchBuildComponents();
    }
  }, [buildId]);

  const handleQuotationChange = (componentId: string, price: string) => {
    setQuotations(prev => ({
      ...prev,
      [componentId]: parseFloat(price) || 0
    }));
  };

  const handleSubmitQuotation = () => {
    if (Object.keys(quotations).length !== components.length) {
      toast.error('Please enter quotations for all components');
      return;
    }

    if (onQuotationSubmit) {
      onQuotationSubmit(quotations);
    }
    
    toast.success('Quotation submitted successfully');
  };

  const getComponentCategoryBadge = (type: string) => {
    const typeMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" | "success" | "info" | "warning", label: string }> = {
      "processor": { variant: "info", label: "CPU" },
      "graphics": { variant: "success", label: "GPU" },
      "memory": { variant: "warning", label: "RAM" },
      "storage": { variant: "default", label: "Storage" },
      "cooling": { variant: "secondary", label: "Cooling" },
      "power": { variant: "warning", label: "PSU" },
      "motherboard": { variant: "info", label: "Motherboard" },
      "pcCase": { variant: "secondary", label: "Case" },
      "extraStorage": { variant: "default", label: "Extra Storage" }
    };

    const config = typeMap[type] || { variant: "outline", label: type };
    return (
      <Badge variant={config.variant} className="ml-2">
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return <p>Loading build components...</p>;
  }

  if (components.length === 0) {
    return <p>No components found for this build.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Build Component Details</h2>
      
      {components.map(component => (
        <div key={component.id} className="flex items-center space-x-4 mb-4 p-3 border border-border rounded-md">
          <div className="flex-1">
            <Label className="flex items-center">
              {component.model_name}
              {getComponentCategoryBadge(component.component_type)}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">Quantity: {component.quantity}</p>
          </div>
          <div className="w-32">
            <Input 
              type="number" 
              placeholder="Enter price" 
              defaultValue={component.price?.toString() || ""}
              onChange={(e) => handleQuotationChange(component.id, e.target.value)}
            />
          </div>
        </div>
      ))}
      
      <Button 
        onClick={handleSubmitQuotation} 
        disabled={components.length === 0}
        className="mt-4"
      >
        Submit Quotation
      </Button>
    </div>
  );
};

export default BuildDetailsQuotation;
