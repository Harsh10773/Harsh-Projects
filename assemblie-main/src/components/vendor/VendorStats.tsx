
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VendorStatsProps {
  vendorId: string;
}

const VendorStats = ({ vendorId }: VendorStatsProps) => {
  const [stats, setStats] = useState({
    ordersReceived: 0,
    ordersWon: 0,
    ordersLost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!vendorId) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching stats for vendor ID:", vendorId);
      
      // Get total orders count from the database
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (ordersError) {
        console.error('Error fetching orders count:', ordersError);
        throw ordersError;
      }
      
      // Try to get vendor stats, if they exist
      const { data: statsData, error: statsError } = await supabase
        .from('vendor_stats')
        .select('*')
        .eq('vendor_id', vendorId)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error fetching vendor stats:', statsError);
        // We'll use default values below
      }

      setStats({
        ordersReceived: ordersCount || 0,
        ordersWon: statsData?.orders_won || 0,
        ordersLost: statsData?.orders_lost || 0
      });
    } catch (error) {
      console.error('Error in fetchStats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (vendorId) {
      fetchStats();
    }
  }, [vendorId]);

  const handleRefresh = () => {
    fetchStats();
    toast.success("Stats refreshed");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rgb-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Orders Received</CardTitle>
            <CardDescription>Total orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <div className="text-2xl font-bold">{stats.ordersReceived}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="rgb-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Orders Won</CardTitle>
            <CardDescription>Successful quotes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <div className="text-2xl font-bold text-green-500">{stats.ordersWon}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="rgb-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Orders Lost</CardTitle>
            <CardDescription>Lost opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <div className="text-2xl font-bold text-red-500">{stats.ordersLost}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorStats;
