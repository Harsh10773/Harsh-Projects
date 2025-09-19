import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OutfitCard } from "@/components/outfits/OutfitCard";
import { useCloset } from "@/contexts/ClosetContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Settings, 
  Heart, 
  Bell, 
  LogOut,
  ChevronRight, 
  Mail, 
  Star, 
  TrendingUp,
  CloudOff,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { items, outfits, stylePreferences } = useCloset();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(data);
      }
      setLoading(false);
    };
    
    fetchUserProfile();
  }, [user]);
  
  const categoryData = [
    { name: 'Tops', count: 8, color: '#6E56CF' },
    { name: 'Pants', count: 5, color: '#FFD166' },
    { name: 'Dresses', count: 3, color: '#EF6351' },
    { name: 'Shoes', count: 4, color: '#4ECDC4' },
    { name: 'Accessories', count: 6, color: '#FF9F1C' },
  ];
  
  const styleData = [
    { name: 'Casual', value: 45, color: '#6E56CF' },
    { name: 'Formal', value: 15, color: '#FFD166' },
    { name: 'Business', value: 20, color: '#4ECDC4' },
    { name: 'Sporty', value: 10, color: '#FF9F1C' },
    { name: 'Vintage', value: 10, color: '#EF6351' },
  ];

  const favoriteOutfits = outfits.filter(outfit => outfit.favorite);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <AppLayout>
      <div className="container px-6 py-8 max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mr-6">
            <User className="text-primary" size={36} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading">My Profile</h1>
            <p className="text-lg text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Help Us Improve</CardTitle>
                <CardDescription className="text-base">Share your feedback about the app</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="gap-2"
                  onClick={() => window.open('mailto:feedback@closetgenie.app?subject=App Feedback', '_blank')}
                >
                  <MessageSquare size={20} /> Provide Feedback
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Closet Stats</CardTitle>
                <CardDescription className="text-base">Overview of your wardrobe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold">{items.length}</div>
                    <div className="text-muted-foreground">Items</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold">{outfits.length}</div>
                    <div className="text-muted-foreground">Outfits</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold">{favoriteOutfits.length}</div>
                    <div className="text-muted-foreground">Favorites</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold">{stylePreferences.filter(s => s.selected).length}</div>
                    <div className="text-muted-foreground">Styles</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-medium mb-4">Items by Category</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={categoryData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          width={80}
                          fontSize={14}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value} items`, 'Count']}
                          contentStyle={{ 
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Style Distribution</h3>
                    <div className="flex items-center justify-between">
                      <ResponsiveContainer width="60%" height={200}>
                        <PieChart>
                          <Pie
                            data={styleData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={50}
                            paddingAngle={2}
                          >
                            {styleData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Percentage']}
                            contentStyle={{ 
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-2">
                        {styleData.map((style) => (
                          <div key={style.name} className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: style.color }} 
                            />
                            <span className="text-sm">{style.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className="w-full h-12">
                <TabsTrigger value="favorites" className="flex-1 text-base">Favorites</TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 text-base">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="favorites" className="mt-6">
                <div className="space-y-6">
                  <h2 className="text-xl font-medium">Saved Outfits</h2>
                  
                  {favoriteOutfits.length > 0 ? (
                    <div className="space-y-6">
                      {favoriteOutfits.slice(0, 3).map(outfit => (
                        <OutfitCard 
                          key={outfit.id} 
                          outfit={outfit} 
                          showControls={false}
                        />
                      ))}
                      {favoriteOutfits.length > 3 && (
                        <Button variant="outline" className="w-full" onClick={() => window.location.href = '/outfit-generator'}>
                          View All ({favoriteOutfits.length} total)
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="text-muted-foreground" size={24} />
                      </div>
                      <h3 className="font-medium mb-2">No saved outfits yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Swipe right on outfits you love to save them here
                      </p>
                      <Button asChild>
                        <a href="/outfit-generator">Browse Outfits</a>
                      </Button>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <h3 className="font-medium mb-3">Style Preferences</h3>
                    <div className="flex flex-wrap gap-2">
                      {stylePreferences
                        .filter(style => style.selected)
                        .map(style => (
                          <Badge key={style.name} variant="secondary" className="text-sm px-3 py-1">
                            {style.name}
                          </Badge>
                        ))
                      }
                      {stylePreferences.filter(style => style.selected).length === 0 && (
                        <p className="text-muted-foreground">
                          No style preferences selected. Update in settings.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-4">
                            <Bell size={24} className="text-primary" />
                            <div>
                              <h3 className="font-medium">Notifications</h3>
                              <p className="text-sm text-muted-foreground">Get updates about new outfit ideas</p>
                            </div>
                          </div>
                          <Switch 
                            checked={notificationsEnabled}
                            onCheckedChange={setNotificationsEnabled}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-4">
                            <CloudOff size={24} className="text-primary" />
                            <div>
                              <h3 className="font-medium">Offline Mode</h3>
                              <p className="text-sm text-muted-foreground">Use app without internet connection</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                        
                        <div className="flex items-center justify-between py-3 cursor-pointer" onClick={() => alert('Email preferences feature coming soon!')}>
                          <div className="flex items-center gap-4">
                            <Mail size={24} className="text-primary" />
                            <div>
                              <h3 className="font-medium">Email Preferences</h3>
                              <p className="text-sm text-muted-foreground">Manage email settings</p>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-muted-foreground" />
                        </div>
                        
                        <div className="flex items-center justify-between py-3 cursor-pointer" onClick={() => alert('Usage statistics feature coming soon!')}>
                          <div className="flex items-center gap-4">
                            <TrendingUp size={24} className="text-primary" />
                            <div>
                              <h3 className="font-medium">Usage Statistics</h3>
                              <p className="text-sm text-muted-foreground">See how you use the app</p>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-4">
                            <Star size={24} className="text-primary" />
                            <h3 className="font-medium text-lg">Upgrade to Premium</h3>
                          </div>
                          <Badge className="text-sm px-3 py-1">$3/month</Badge>
                        </div>
                        
                        <Button className="w-full" size="lg" onClick={() => alert('Premium upgrade coming soon!')}>Unlock Premium Features</Button>
                        
                        <ul className="space-y-3">
                          <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">✓</div>
                            <span>Unlimited outfit generation</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">✓</div>
                            <span>Luxury brand recommendations</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">✓</div>
                            <span>Outfit Roulette for inspiration</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={handleSignOut}
                  >
                    <LogOut size={20} /> Sign Out
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
