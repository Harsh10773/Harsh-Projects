
import { useState } from "react";
import { Heart } from "lucide-react";
import { Outfit, useCloset } from "@/contexts/ClosetContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OutfitCardProps {
  outfit: Outfit;
  showControls?: boolean;
  className?: string;
  onSkip?: () => void;
  onLike?: () => void;
}

export function OutfitCard({ outfit, showControls = true, className = '', onSkip, onLike }: OutfitCardProps) {
  const { favoriteOutfit } = useCloset();
  const [isBeingRemoved, setIsBeingRemoved] = useState(false);

  // Format the date to be more readable
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoriteOutfit(outfit.id);
  };

  const handleSkip = () => {
    setIsBeingRemoved(true);
    setTimeout(() => {
      setIsBeingRemoved(false);
      if (onSkip) {
        onSkip();
      }
    }, 300);
  };

  const handleLike = () => {
    favoriteOutfit(outfit.id);
    if (onLike) {
      onLike();
    }
  };

  return (
    <Card 
      className={`swipe-card ${className} ${isBeingRemoved ? 'swiping-left' : ''}`}
    >
      <CardContent className="p-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-1 p-1">
          {outfit.items.slice(0, 4).map((item, index) => (
            <div key={item.id} className="aspect-square">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          ))}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{outfit.name}</h3>
              <p className="text-sm text-muted-foreground">
                Created {formatDate(outfit.createdAt)}
              </p>
            </div>
            
            {showControls && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                onClick={handleFavorite}
              >
                <Heart 
                  className={outfit.favorite ? "fill-primary text-primary" : ""} 
                  size={20} 
                />
              </Button>
            )}
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <Badge>{outfit.occasion}</Badge>
            <Badge variant="outline">{outfit.items.length} items</Badge>
          </div>
          
          {showControls && (
            <div className="mt-4 flex justify-between">
              <Button 
                variant="outline" 
                className="w-[48%]"
                onClick={handleSkip}
              >
                Skip
              </Button>
              <Button className="w-[48%]" onClick={handleLike}>
                ♥ Like it
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
