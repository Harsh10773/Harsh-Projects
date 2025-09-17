
import { useState } from 'react';
import { Check, HardDrive, Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPriceINR } from '@/utils/formatters';

const extraStorageOptions = [
  { id: 'western-digital-1tb', name: 'Western Digital 1TB HDD', price: 3499, type: 'hdd' },
  { id: 'seagate-2tb', name: 'Seagate 2TB HDD', price: 5499, type: 'hdd' },
  { id: 'samsung-500gb', name: 'Samsung 500GB SSD', price: 5999, type: 'ssd' },
  { id: 'crucial-1tb', name: 'Crucial 1TB SSD', price: 8999, type: 'ssd' },
  { id: 'wd-black-1tb-nvme', name: 'WD Black 1TB NVMe SSD', price: 12999, type: 'nvme' },
  { id: 'samsung-980-pro-1tb', name: 'Samsung 980 Pro 1TB NVMe', price: 16999, type: 'nvme' },
];

interface ExtraStorageOption {
  id: string;
  name: string;
  price: number;
  type: string;
}

interface ExtraStorageOptionsProps {
  onStorageSelect: (selectedStorage: ExtraStorageOption[]) => void;
}

const ExtraStorageOptions = ({ onStorageSelect }: ExtraStorageOptionsProps) => {
  const [selectedOptions, setSelectedOptions] = useState<ExtraStorageOption[]>([]);

  const toggleOption = (option: ExtraStorageOption) => {
    if (selectedOptions.some(item => item.id === option.id)) {
      // Remove option if already selected
      const newSelected = selectedOptions.filter(item => item.id !== option.id);
      setSelectedOptions(newSelected);
      onStorageSelect(newSelected);
    } else {
      // Add option if not selected
      const newSelected = [...selectedOptions, option];
      setSelectedOptions(newSelected);
      onStorageSelect(newSelected);
    }
  };

  const isSelected = (id: string) => selectedOptions.some(item => item.id === id);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Extra Storage Options</h3>
      <p className="text-sm text-muted-foreground">Add additional storage drives to your build</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {extraStorageOptions.map((option) => (
          <Card 
            key={option.id} 
            className={`cursor-pointer transition-all hover:border-accent/50 ${
              isSelected(option.id) ? 'border-accent bg-accent/10' : 'border-border/50'
            }`}
            onClick={() => toggleOption(option)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  option.type === 'nvme' 
                    ? 'bg-blue-100 text-blue-500' 
                    : option.type === 'ssd' 
                    ? 'bg-green-100 text-green-500'
                    : 'bg-orange-100 text-orange-500'
                }`}>
                  <HardDrive className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{option.name}</p>
                  <p className="text-sm text-muted-foreground">{formatPriceINR(option.price)}</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                isSelected(option.id) 
                  ? 'bg-accent border-accent' 
                  : 'border-muted-foreground'
              }`}>
                {isSelected(option.id) ? <Check className="h-3 w-3 text-white" /> : <Plus className="h-3 w-3 text-muted-foreground" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExtraStorageOptions;
