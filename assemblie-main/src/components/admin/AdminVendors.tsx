import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Store, User, MapPin, Award, Mail, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface VendorStats {
  orders_won: number;
  orders_lost: number;
}

interface QuotationCounts {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

interface Vendor {
  id: string;
  vendor_name: string;
  store_name?: string;
  store_address?: string;
  email?: string;
  created_at: string;
  stats?: VendorStats;
  last_sign_in?: string;
  quotations?: QuotationCounts;
}

const AdminVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchVendors();
  }, [refreshTrigger]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVendors(vendors);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = vendors.filter(vendor => 
      vendor.vendor_name?.toLowerCase().includes(query) ||
      vendor.store_name?.toLowerCase().includes(query) ||
      vendor.email?.toLowerCase().includes(query) ||
      vendor.store_address?.toLowerCase().includes(query)
    );
    
    setFilteredVendors(filtered);
  }, [searchQuery, vendors]);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching vendor data from Supabase...");
      
      // Fetch vendor profiles from vendor_profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('vendor_profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Error fetching vendor profiles:", profilesError);
        throw profilesError;
      }
      
      console.log(`Found ${profilesData?.length || 0} vendor profiles:`, profilesData);
      
      if (!profilesData || profilesData.length === 0) {
        console.log("No vendor profiles found in database");
        setVendors([]);
        setFilteredVendors([]);
        setLoading(false);
        return;
      }
      
      // Get vendor auth data for emails and last sign-in
      const { data: vendorAuthData, error: vendorAuthError } = await supabase
        .from("vendor_auth")
        .select("id, email, last_sign_in");

      if (vendorAuthError) {
        console.error("Error fetching vendor auth data:", vendorAuthError);
      } else {
        console.log(`Found ${vendorAuthData?.length || 0} vendor auth records:`, vendorAuthData);
      }

      // Create a map for auth data
      const vendorAuthInfo = new Map();
      if (vendorAuthData) {
        vendorAuthData.forEach((auth) => {
          vendorAuthInfo.set(auth.id, {
            email: auth.email,
            last_sign_in: auth.last_sign_in
          });
        });
      }

      // Get all vendor stats
      const { data: vendorStatsData, error: vendorStatsError } = await supabase
        .from("vendor_stats")
        .select("*");

      if (vendorStatsError) {
        console.error("Error fetching vendor stats:", vendorStatsError);
      } else {
        console.log(`Found ${vendorStatsData?.length || 0} vendor stats records:`, vendorStatsData);
      }

      // Create a map for stats
      const vendorStats = new Map();
      if (vendorStatsData) {
        vendorStatsData.forEach((stats) => {
          vendorStats.set(stats.vendor_id, {
            orders_won: stats.orders_won || 0,
            orders_lost: stats.orders_lost || 0,
          });
        });
      }

      // Get quotation data
      const { data: quotationsData, error: quotationsError } = await supabase
        .from("vendor_quotations")
        .select("vendor_id, status");
        
      if (quotationsError) {
        console.error("Error fetching quotations data:", quotationsError);
      } else {
        console.log(`Found ${quotationsData?.length || 0} quotation records:`, quotationsData);
      }
      
      // Count quotations per vendor
      const vendorQuotationCounts = new Map();
      if (quotationsData) {
        quotationsData.forEach((quotation) => {
          const vendorId = quotation.vendor_id;
          const status = quotation.status;
          
          if (!vendorQuotationCounts.has(vendorId)) {
            vendorQuotationCounts.set(vendorId, {
              total: 0,
              pending: 0,
              accepted: 0,
              rejected: 0
            });
          }
          
          const counts = vendorQuotationCounts.get(vendorId);
          counts.total += 1;
          
          if (status === 'pending') counts.pending += 1;
          if (status === 'accepted') counts.accepted += 1;
          if (status === 'rejected') counts.rejected += 1;
          
          vendorQuotationCounts.set(vendorId, counts);
        });
      }

      // Combine all vendor data
      const formattedVendors = profilesData.map((profile) => {
        const authInfo = vendorAuthInfo.get(profile.id) || {};
        
        return {
          id: profile.id,
          vendor_name: profile.vendor_name || 'Unknown Vendor',
          store_name: profile.store_name || 'Unknown Store',
          store_address: profile.store_address || 'No Address',
          email: authInfo.email || 'No Email',
          created_at: profile.created_at || new Date().toISOString(),
          last_sign_in: authInfo.last_sign_in,
          stats: vendorStats?.get(profile.id) || { orders_won: 0, orders_lost: 0 },
          quotations: vendorQuotationCounts?.get(profile.id) || { total: 0, pending: 0, accepted: 0, rejected: 0 }
        };
      });

      console.log(`Final list of ${formattedVendors.length} vendors for display:`, formattedVendors);
      setVendors(formattedVendors);
      setFilteredVendors(formattedVendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError("Failed to load vendors from database");
      toast.error("Failed to load vendors data");
      setVendors([]);
      setFilteredVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.info("Refreshing vendor data...");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getWinRate = (stats: VendorStats) => {
    const total = stats.orders_won + stats.orders_lost;
    if (total === 0) return "0%";
    return `${Math.round((stats.orders_won / total) * 100)}%`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Vendors</CardTitle>
          <CardDescription>Manage your component suppliers</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by name, store, or email..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9 bg-background"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading vendors...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12 flex-col">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Quotations</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <TableRow
                      key={vendor.id}
                      className="cursor-pointer hover:bg-muted/60"
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div className="font-medium">{vendor.vendor_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>{vendor.store_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {vendor.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.quotations?.total || 0} 
                        {vendor.quotations?.pending > 0 && 
                          <span className="ml-1 text-yellow-500 text-xs">
                            ({vendor.quotations.pending} pending)
                          </span>
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            {getWinRate(vendor.stats || { orders_won: 0, orders_lost: 0 })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(vendor.last_sign_in)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      {searchQuery.trim() !== "" ? "No vendors match your search" : "No vendors found in database"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Vendor Details Dialog */}
      <Dialog
        open={!!selectedVendor}
        onOpenChange={(open) => !open && setSelectedVendor(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vendor Name</p>
                  <p className="font-medium">{selectedVendor.vendor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Store Name</p>
                  <p className="font-medium">{selectedVendor.store_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedVendor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {formatDate(selectedVendor.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">
                    {formatDate(selectedVendor.last_sign_in)}
                  </p>
                </div>
                {selectedVendor.store_address && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <div className="flex items-start mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <p>{selectedVendor.store_address}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Vendor Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-100 rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Orders Won</p>
                    <p className="font-bold text-green-600 text-xl">
                      {selectedVendor.stats?.orders_won || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Orders Lost</p>
                    <p className="font-bold text-red-600 text-xl">
                      {selectedVendor.stats?.orders_lost || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="font-bold text-blue-600 text-xl">
                      {getWinRate(
                        selectedVendor.stats || { orders_won: 0, orders_lost: 0 }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Quotation Summary</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Total Quotes</p>
                    <p className="font-bold text-gray-600 text-xl">
                      {selectedVendor.quotations?.total || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="font-bold text-yellow-600 text-xl">
                      {selectedVendor.quotations?.pending || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Accepted</p>
                    <p className="font-bold text-green-600 text-xl">
                      {selectedVendor.quotations?.accepted || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-md p-3">
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="font-bold text-red-600 text-xl">
                      {selectedVendor.quotations?.rejected || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminVendors;
