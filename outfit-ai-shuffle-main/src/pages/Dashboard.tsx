
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { ProductCard, Product } from "@/components/shopping/ProductCard";
import { useCloset } from "@/contexts/ClosetContext";
import { Link } from "react-router-dom";
import { RefreshCw, Plus, Heart, Camera, Shirt, ShoppingBag } from "lucide-react";

const Dashboard = () => {
  const { outfits, items, generateOutfit, addOutfit, addItem } = useCloset();
  const [weather, setWeather] = useState({ temp: 72, condition: "Sunny" });
  
  // Demo products for shopping recommendations
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Classic White Sneakers",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600",
      brand: "Nike",
      category: "Shoes",
      outfitCount: 8,
      popularity: 9,
      affiliateUrl: "#",
    },
    {
      id: "2",
      name: "Denim Jacket",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600",
      brand: "Levi's",
      category: "Outerwear",
      outfitCount: 5,
      popularity: 7,
      affiliateUrl: "#",
    },
  ]);

  const closetUtilization = Math.min(Math.floor((items.length / 50) * 100), 100);

  return (
    <AppLayout>
      <div className="container px-6 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading">Hey there 👋</h1>
            <p className="text-lg text-muted-foreground">Your personal AI stylist</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 text-base">
              {weather.temp}°F <span className="text-yellow-500">☀️</span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Outfit of the Day */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Outfit of the Day</h2>
                <Button variant="ghost" size="lg" className="gap-2" onClick={() => {
                  const newOutfit = generateOutfit();
                  addOutfit(newOutfit);
                  alert(`New outfit "${newOutfit.name}" generated!`);
                }}>
                  <RefreshCw size={16} /> Refresh
                </Button>
              </div>
              
              {outfits.length > 0 ? (
                <OutfitCard outfit={outfits[0]} />
              ) : (
                <Card className="bg-accent text-accent-foreground">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                      <Shirt className="text-primary" size={36} />
                    </div>
                    <h3 className="text-lg font-medium mb-3">No outfits yet</h3>
                    <p className="text-muted-foreground mb-6">Add more items to your closet to get outfit suggestions</p>
                    <Button asChild size="lg" className="gap-2">
                      <Link to="/closet">
                        <Plus size={18} /> Add Items
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-medium mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      Array.from(files).forEach((file, index) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const result = e.target?.result as string;
                          addItem({
                            name: `Uploaded Item ${Date.now()}-${index}`,
                            category: 'Tops', // Default category
                            color: 'Black', // Default color
                            style: 'Casual', // Default style
                            image: result
                          });
                        };
                        reader.readAsDataURL(file);
                      });
                      alert(`${files.length} item(s) uploaded successfully!`);
                    }
                  };
                  input.click();
                }}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                      <Camera className="text-primary" size={28} />
                    </div>
                    <h3 className="font-medium mb-2">Add Item</h3>
                    <p className="text-sm text-muted-foreground">Upload to closet</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => {
                  const newOutfit = generateOutfit();
                  addOutfit(newOutfit);
                  alert(`New outfit "${newOutfit.name}" generated! Check your outfit generator.`);
                }}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                      <RefreshCw className="text-primary" size={28} />
                    </div>
                    <h3 className="font-medium mb-2">New Outfit</h3>
                    <p className="text-sm text-muted-foreground">Generate ideas</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => {
                  const favoriteOutfits = outfits.filter(o => o.favorite);
                  if (favoriteOutfits.length === 0) {
                    alert('No favorite outfits yet! Create some outfits and mark them as favorites.');
                  } else {
                    alert(`You have ${favoriteOutfits.length} favorite outfit${favoriteOutfits.length === 1 ? '' : 's'}!`);
                  }
                }}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                      <Heart className="text-primary" size={28} />
                    </div>
                    <h3 className="font-medium mb-2">Favorites</h3>
                    <p className="text-sm text-muted-foreground">Saved looks</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => window.location.href = '/shopping'}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="text-primary" size={28} />
                    </div>
                    <h3 className="font-medium mb-2">Shop</h3>
                    <p className="text-sm text-muted-foreground">Find new pieces</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Closet Health */}
            <section>
              <h2 className="text-xl font-medium mb-6">Closet Health</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base">Utilization</span>
                    <span className="text-lg font-medium">{closetUtilization}%</span>
                  </div>
                  <Progress value={closetUtilization} className="mb-6" />
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{items.length}</div>
                      <div className="text-muted-foreground">Items in Closet</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{outfits.length}</div>
                      <div className="text-muted-foreground">Saved Outfits</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Shopping Recommendations */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Missing Pieces</h2>
                <Button asChild variant="ghost" size="lg">
                  <Link to="/shopping">See all</Link>
                </Button>
              </div>
              
              <div className="space-y-6">
                {recommendedProducts.slice(0, 2).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
