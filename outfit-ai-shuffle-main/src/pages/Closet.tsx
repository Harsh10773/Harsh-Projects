import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClothingCard } from "@/components/closet/ClothingCard";
import { useCloset, ClothingItem } from "@/contexts/ClosetContext";
import { Plus, Search, Upload, Camera, Shirt } from "lucide-react";

const Closet = () => {
  const { items, addItem } = useCloset();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    name: "",
    category: "Tops",
    color: "Black",
    style: "Casual",
    image: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=400",
  });

  console.log("Closet items:", items.length); // Debug log

  // Categories for filtering
  const categories = [
    "all",
    "Tops",
    "Pants",
    "Dresses",
    "Skirts",
    "Outerwear",
    "Shoes",
    "Accessories",
  ];

  // Filter items based on search and category
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.style.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItemForm({
      ...newItemForm,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewItemForm({
      ...newItemForm,
      [name]: value,
    });
  };

  const handleAddItem = () => {
    addItem(newItemForm);
    setNewItemForm({
      name: "",
      category: "Tops",
      color: "Black",
      style: "Casual",
      image: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=400",
    });
    setUploadDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="container px-6 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-heading">My Closet</h1>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus size={18} /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div 
                      className="aspect-square bg-muted rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => {
                        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                          navigator.mediaDevices.getUserMedia({ video: true })
                            .then(() => alert('Camera access granted! Photo capture feature coming soon.'))
                            .catch(() => alert('Camera access denied. Please allow camera permissions.'));
                        } else {
                          alert('Camera not available on this device.');
                        }
                      }}
                    >
                      <Camera size={24} className="mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Take Photo</span>
                    </div>
                    <div 
                      className="aspect-square bg-muted rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => {
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
                                  category: newItemForm.category,
                                  color: newItemForm.color,
                                  style: newItemForm.style,
                                  image: result
                                });
                              };
                              reader.readAsDataURL(file);
                            });
                            alert(`${files.length} item(s) uploaded successfully!`);
                            setUploadDialogOpen(false);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload size={24} className="mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                    </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Item Name</label>
                  <Input 
                    name="name"
                    value={newItemForm.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Blue Denim Jacket"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select 
                    value={newItemForm.category} 
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== "all").map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Color</label>
                  <Select 
                    value={newItemForm.color} 
                    onValueChange={(value) => handleSelectChange("color", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Black">Black</SelectItem>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Gray">Gray</SelectItem>
                      <SelectItem value="Navy">Navy</SelectItem>
                      <SelectItem value="Blue">Blue</SelectItem>
                      <SelectItem value="Red">Red</SelectItem>
                      <SelectItem value="Green">Green</SelectItem>
                      <SelectItem value="Yellow">Yellow</SelectItem>
                      <SelectItem value="Purple">Purple</SelectItem>
                      <SelectItem value="Pink">Pink</SelectItem>
                      <SelectItem value="Brown">Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Style</label>
                  <Select 
                    value={newItemForm.style} 
                    onValueChange={(value) => handleSelectChange("style", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Formal">Formal</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Sporty">Sporty</SelectItem>
                      <SelectItem value="Streetwear">Streetwear</SelectItem>
                      <SelectItem value="Vintage">Vintage</SelectItem>
                      <SelectItem value="Boho">Boho</SelectItem>
                      <SelectItem value="Grunge">Grunge</SelectItem>
                      <SelectItem value="Minimalist">Minimalist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleAddItem} className="w-full mt-4">
                  Add to Closet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-8 space-y-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="Search your closet..." 
              className="pl-12 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-3 min-w-max">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  size="lg"
                  onClick={() => setCategoryFilter(category)}
                  className="capitalize"
                >
                  {category === "all" ? "All Items" : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Items Grid */}
        <Tabs defaultValue="grid">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">
              {filteredItems.length} {filteredItems.length === 1 ? "Item" : "Items"}
            </h2>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {filteredItems.map((item) => (
                <ClothingCard key={item.id} item={item} />
              ))}
              
              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Shirt className="text-muted-foreground" size={32} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">No items found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchTerm || categoryFilter !== "all" 
                      ? "Try changing your search or filters" 
                      : "Add some clothes to get started"}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" className="gap-2">
                        <Plus size={18} /> Add First Item
                      </Button>
                    </DialogTrigger>
                    {/* Dialog content is the same as the add item dialog */}
                  </Dialog>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center border rounded-lg p-4 hover:shadow-md transition-all">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                  />
                  <div>
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color.toLowerCase() }}
                      />
                      <span className="text-sm text-muted-foreground">{item.category} · {item.style}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Shirt className="text-muted-foreground" size={28} />
                  </div>
                  <h3 className="font-medium mb-2">No items found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm || categoryFilter !== "all" 
                      ? "Try changing your search or filters" 
                      : "Add some clothes to get started"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Closet;
