
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  outfitCount: number;
  popularity: number;
  affiliateUrl: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-secondary text-secondary-foreground">
            ${product.price.toFixed(2)}
          </Badge>
        </div>
        {product.popularity > 8 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-xs">
              🔥 Popular item
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
          <h3 className="font-medium line-clamp-2">{product.name}</h3>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">{product.category}</Badge>
          <span className="text-xs text-muted-foreground">
            Completes {product.outfitCount} outfit{product.outfitCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="mt-auto">
          <Button asChild className="w-full gap-2">
            <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
              Shop Now <ExternalLink size={16} />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
