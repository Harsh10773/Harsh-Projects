import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandCard } from "@/components/shopping/BrandCard";
import { brandCategories } from "@/data/brands";
import { Brand, BrandCategory } from "@/types/brands";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";

const ShoppingRecommendations = () => {
  const [priceRange, setPriceRange] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");
  
  // Get all brands from all categories
  const allBrands = brandCategories.flatMap(category => category.brands);
  
  // Get unique styles
  const allStyles = Array.from(new Set(allBrands.flatMap(brand => brand.style))).sort();
  
  // Filter brands based on filters
  const filteredBrands = allBrands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.style.some(style => style.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriceRange = priceRange === "all" || 
      (priceRange === "budget" && brand.priceRange.includes('$') && !brand.priceRange.includes('$$$$')) ||
      (priceRange === "mid" && (brand.priceRange === '$$' || brand.priceRange === '$$$')) ||
      (priceRange === "premium" && (brand.priceRange === '$$$$' || brand.priceRange === '$$$$$'));
    
    const matchesCategory = selectedCategory === "all" || brand.category === selectedCategory;
    
    const matchesStyle = selectedStyle === "all" || brand.style.includes(selectedStyle);
    
    return matchesSearch && matchesPriceRange && matchesCategory && matchesStyle;
  });

  return (
    <AppLayout>
      <div className="container px-6 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading mb-2">Shop Brands</h1>
            <p className="text-lg text-muted-foreground">Discover your next favorite fashion brand</p>
          </div>
          <Badge variant="outline" className="font-normal px-4 py-2 text-base">
            {filteredBrands.length} Brands
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter size={20} />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input 
                      placeholder="Search brands..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {brandCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="budget">Budget ($)</SelectItem>
                      <SelectItem value="mid">Mid-Range ($$-$$$)</SelectItem>
                      <SelectItem value="premium">Premium ($$$$-$$$$$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Style */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Style</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="All styles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      {allStyles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setPriceRange("all");
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedStyle("all");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {searchTerm || selectedCategory !== "all" || selectedStyle !== "all" || priceRange !== "all" ? (
              /* Filtered Results */
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium">
                    {filteredBrands.length === 0 ? "No brands found" : `${filteredBrands.length} brand${filteredBrands.length === 1 ? '' : 's'} found`}
                  </h2>
                </div>
                
                {filteredBrands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredBrands.map((brand) => (
                      <BrandCard key={brand.id} brand={brand} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-muted-foreground" size={24} />
                    </div>
                    <h3 className="font-medium mb-2">No brands found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setPriceRange("all");
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setSelectedStyle("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Category View */
              <div className="space-y-12">
                {brandCategories.map((category) => (
                  <div key={category.id}>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                        <span className="text-3xl">{category.icon}</span>
                        {category.name}
                      </h2>
                      <p className="text-lg text-muted-foreground">{category.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {category.brands.map((brand) => (
                        <BrandCard key={brand.id} brand={brand} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 text-center bg-muted/50 p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Add more items to your closet to get personalized brand recommendations
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/closet">
              <Plus size={18} /> Add Items to Closet
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ShoppingRecommendations;