
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Package } from "lucide-react";
import { Order } from "./CustomerOrdersTab";
import { formatDistanceToNow } from "date-fns";

interface CustomerTrackingTabProps {
  orders?: Order[];
}

const CustomerTrackingTab: React.FC<CustomerTrackingTabProps> = ({ orders = [] }) => {
  const [trackingId, setTrackingId] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleTrackOrder = () => {
    if (!trackingId.trim()) return;
    
    setIsSearching(true);
    
    // First check if the order exists in the user's orders
    const foundOrder = orders.find(order => 
      order.tracking_id.toLowerCase() === trackingId.trim().toLowerCase()
    );
    
    if (foundOrder) {
      setSearchedOrder(foundOrder);
      setIsSearching(false);
      return;
    }
    
    // If not found in user's orders, we could implement additional API call here
    // For now, just show not found after a delay
    setTimeout(() => {
      setSearchedOrder(null);
      setIsSearching(false);
    }, 1000);
  };

  const getStatusStep = (status: string) => {
    const statuses = {
      'order_placed': 1,
      'order_received': 1,
      'processing': 2,
      'shipped': 3,
      'delivered': 4,
      'completed': 4
    };
    return statuses[status.toLowerCase()] || 1;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Track Your Order</h3>
      
      <div className="flex gap-2">
        <Input
          placeholder="Enter your tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleTrackOrder}
          disabled={isSearching || !trackingId.trim()}
        >
          {isSearching ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Searching...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Track
            </span>
          )}
        </Button>
      </div>
      
      {searchedOrder ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-medium">Order #{searchedOrder.tracking_id}</h4>
              <span className="text-sm text-muted-foreground">
                {new Date(searchedOrder.created_at).toLocaleDateString()}
                {" "}
                ({formatDistanceToNow(new Date(searchedOrder.created_at), { addSuffix: true })})
              </span>
            </div>
            
            <div className="relative">
              <div className="flex justify-between mb-2">
                <div className="text-center flex-1">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 ${getStatusStep(searchedOrder.status) >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
                  <p className="text-xs">Order Placed</p>
                </div>
                <div className="text-center flex-1">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 ${getStatusStep(searchedOrder.status) >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
                  <p className="text-xs">Processing</p>
                </div>
                <div className="text-center flex-1">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 ${getStatusStep(searchedOrder.status) >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
                  <p className="text-xs">Shipped</p>
                </div>
                <div className="text-center flex-1">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-1 ${getStatusStep(searchedOrder.status) >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>4</div>
                  <p className="text-xs">Delivered</p>
                </div>
              </div>
              
              <div className="absolute top-4 left-[12.5%] right-[12.5%] h-[2px] bg-muted -z-10">
                <div 
                  className="h-full bg-primary" 
                  style={{ 
                    width: `${(getStatusStep(searchedOrder.status) - 1) * 33.33}%`,
                    transition: 'width 1s ease-in-out'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="mt-6 border rounded-md p-3 bg-muted/30">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Current Status:</span>{" "}
                    {searchedOrder.status.replace(/_/g, " ")}
                  </p>
                  {searchedOrder.estimated_delivery && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Estimated Delivery:</span>{" "}
                      {new Date(searchedOrder.estimated_delivery).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : trackingId && !isSearching ? (
        <div className="text-center p-8 border rounded-md">
          <Package className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <h4 className="font-medium mb-1">No results found</h4>
          <p className="text-sm text-muted-foreground">
            We couldn't find an order with tracking ID "{trackingId}". Please check the ID and try again.
          </p>
        </div>
      ) : null}
      
      <div className="text-sm text-muted-foreground mt-4 p-4 border rounded-md bg-muted/30">
        <h4 className="font-medium mb-2">Recent Orders</h4>
        {orders.length > 0 ? (
          <div className="space-y-2">
            {orders.slice(0, 3).map(order => (
              <div 
                key={order.id} 
                className="flex justify-between items-center p-2 bg-background rounded cursor-pointer hover:bg-accent"
                onClick={() => {
                  setTrackingId(order.tracking_id);
                  setSearchedOrder(order);
                }}
              >
                <div>
                  <p className="font-medium text-sm">Order #{order.tracking_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs capitalize">
                    {order.status.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm">No recent orders found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerTrackingTab;
