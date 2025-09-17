
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, User, Calendar, Package, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface OrderItem {
  id: string;
  component_name: string;
  quantity: number;
  price_at_time: number;
  component_id?: string;
  component_details?: any;
}

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  customer_email: string;
  order_date: string;
  status: string;
  grand_total: number;
  estimated_delivery?: string;
  items?: OrderItem[];
  customer_address?: string;
}

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  getStatusBadgeClass: (status: string) => string;
  formatOrderStatus: (status: string) => string;
}

const OrdersTable = ({ 
  orders, 
  onViewDetails, 
  getStatusBadgeClass, 
  formatOrderStatus 
}: OrdersTableProps) => {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Components</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-medium">{order.tracking_id}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <div>{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(order.order_date)}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={getStatusBadgeClass(order.status)}>
                    {formatOrderStatus(order.status)}
                  </span>
                </TableCell>
                <TableCell>{formatCurrency(order.grand_total || 0)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    {order.items?.length || 0} items
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(order)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                <div className="flex flex-col items-center py-6">
                  <Package className="h-10 w-10 text-muted-foreground mb-2" />
                  <p>No orders found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
