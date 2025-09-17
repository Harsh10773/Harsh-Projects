
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, customerProfile, vendorProfile, isVendor, isCustomer } = useAuth();
  
  // Only show vendor link when not currently logged in as a customer
  const showVendorLink = !isCustomer;
  
  const navItems = [
    { name: "Home", path: "/" },
    // Only show the vendor link if user is not signed in as a customer
    ...(showVendorLink ? [{ name: "For Vendors", path: "/vendor" }] : []),
    { name: "Track Order", path: "/tracking" },
  ];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/0c4ff6c0-ff92-41d6-93ee-a81a32dec162.png" 
                alt="Assemblie Logo" 
                className="h-20 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(item.path) 
                    ? "text-accent bg-accent/10"
                    : "text-foreground/80 hover:text-accent hover:bg-accent/10"}`}
              >
                {item.name}
              </Link>
            ))}
            
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => navigate(isCustomer ? "/customer" : (isVendor ? "/vendor" : "/customer"))}
              >
                <User className="mr-2 h-4 w-4" />
                {isCustomer ? "My Account" : (isVendor ? "Vendor Portal" : "My Account")}
              </Button>
            )}
            
            <Button 
              variant="default" 
              size="sm" 
              className="ml-4 bg-accent hover:bg-accent/90"
              onClick={() => window.location.href = "mailto:hi.assemblie@gmail.com"}
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact Us
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground/80 hover:text-accent hover:bg-accent/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden backdrop-blur-lg bg-background/95 border-b border-border/50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium
                  ${isActive(item.path) 
                    ? "text-accent bg-accent/10"
                    : "text-foreground/80 hover:text-accent hover:bg-accent/10"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(isCustomer ? "/customer" : (isVendor ? "/vendor" : "/customer"));
                }}
              >
                <User className="mr-2 h-4 w-4" />
                {isCustomer ? "My Account" : (isVendor ? "Vendor Portal" : "My Account")}
              </Button>
            )}
            
            <Button 
              variant="default" 
              size="sm" 
              className="mt-4 w-full bg-accent hover:bg-accent/90"
              onClick={() => window.location.href = "mailto:hi.assemblie@gmail.com"}
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact Us
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
