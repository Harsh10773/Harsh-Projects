
import { Home, ShoppingBag, Search, User, Shirt } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 lg:hidden">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
          }`}
          aria-label="Go to Dashboard"
        >
          <Home size={22} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/closet" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/closet') ? 'text-primary' : 'text-muted-foreground'
          }`}
          aria-label="Open Closet"
        >
          <Shirt size={22} />
          <span className="text-xs mt-1">Closet</span>
        </Link>
        
        <Link 
          to="/outfit-generator" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/outfit-generator') ? 'text-primary' : 'text-muted-foreground'
          }`}
          aria-label="Open Outfit Generator"
        >
          <Search size={22} />
          <span className="text-xs mt-1">Outfits</span>
        </Link>
        
        <Link 
          to="/shopping" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/shopping') ? 'text-primary' : 'text-muted-foreground'
          }`}
          aria-label="Shop Brands"
        >
          <ShoppingBag size={22} />
          <span className="text-xs mt-1">Shop</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
          }`}
          aria-label="View Profile"
        >
          <User size={22} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}
