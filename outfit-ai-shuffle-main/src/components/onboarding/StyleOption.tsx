
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface StyleOptionProps {
  name: string;
  image: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function StyleOption({ name, image, isSelected, onToggle }: StyleOptionProps) {
  return (
    <Card 
      className={`style-option cursor-pointer transition-all duration-300 ${
        isSelected ? 'scale-105 ring-2 ring-primary' : 'hover:scale-105'
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-0 relative overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full aspect-[3/4] object-cover"
        />
        
        {isSelected && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
            <div className="bg-primary rounded-full p-2">
              <Check className="text-white" />
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-white font-medium">{name}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
