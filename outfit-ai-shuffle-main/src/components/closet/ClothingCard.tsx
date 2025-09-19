
import { ClothingItem } from "@/contexts/ClosetContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClothingCardProps {
  item: ClothingItem;
  onClick?: () => void;
}

export function ClothingCard({ item, onClick }: ClothingCardProps) {
  return (
    <Card 
      className="closet-item cursor-pointer hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-white/80 text-xs backdrop-blur-sm">
              {item.category}
            </Badge>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm truncate">{item.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color.toLowerCase() }}
            />
            <span className="text-xs text-gray-500">{item.color}</span>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {item.style}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
