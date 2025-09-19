export interface Brand {
  id: string;
  name: string;
  description: string;
  category: string;
  priceRange: string;
  style: string[];
  website: string;
  logo?: string;
  rating: number;
  popularItems: string[];
}

export interface BrandCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  brands: Brand[];
}