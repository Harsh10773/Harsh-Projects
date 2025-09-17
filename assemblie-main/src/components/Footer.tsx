
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card/50 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Branding */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/0c4ff6c0-ff92-41d6-93ee-a81a32dec162.png" 
                alt="Assemblie Logo" 
                className="h-16"
              />
            </Link>
            <p className="text-foreground/70 text-sm mt-2">
              Custom PC builds crafted by gaming and tech enthusiasts. 
              From gaming rigs to workstations, we bring your dream build to life.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-foreground/70 hover:text-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-foreground/70 hover:text-accent transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-foreground/70 hover:text-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-foreground/70 hover:text-accent transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links and Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-foreground/70 hover:text-accent transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/vendor" className="text-foreground/70 hover:text-accent transition-colors">
                    For Vendors
                  </Link>
                </li>
                <li>
                  <Link to="/tracking" className="text-foreground/70 hover:text-accent transition-colors">
                    Track Your Order
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-accent" />
                  <a href="mailto:hi.assemblie@gmail.com" className="text-foreground/70 hover:text-accent transition-colors">
                    hi.assemblie@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center">
          <p className="text-foreground/60 text-sm">
            &copy; {new Date().getFullYear()} Assemblie. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-foreground/60 text-sm hover:text-accent transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-foreground/60 text-sm hover:text-accent transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-foreground/60 text-sm hover:text-accent transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
