import { Brand } from '@/types/brands';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink } from 'lucide-react';

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  const handleVisitBrand = () => {
    window.open(brand.website, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={handleVisitBrand}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl group-hover:text-primary transition-colors">{brand.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span>{brand.rating}</span>
          </div>
        </div>
        <Badge variant="outline" className="w-fit">{brand.priceRange}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{brand.description}</p>
        
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Style</h4>
            <div className="flex flex-wrap gap-1">
              {brand.style.map((style) => (
                <Badge key={style} variant="secondary" className="text-xs">
                  {style}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Popular Items</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {brand.popularItems.slice(0, 3).map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <Button 
          className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleVisitBrand();
          }}
        >
          <ExternalLink size={16} />
          Visit {brand.name}
        </Button>
      </CardContent>
    </Card>
  );
}