
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
import { Check, X, InfoIcon, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface QuotationItem {
  id: string;
  vendor_id: string;
  order_id: string;
  price: number;
  status: string;
  created_at: string;
  vendor_name: string;
  store_name: string;
  customer_name: string;
  tracking_id: string;
}

interface QuotationsTableProps {
  quotations: QuotationItem[];
  processingAction: boolean;
  onViewDetails: (quotation: QuotationItem) => void;
  onConfirmDialog: (quotationId: string, action: "accept" | "reject") => void;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (dateString: string) => string;
}

const QuotationsTable = ({
  quotations,
  processingAction,
  onViewDetails,
  onConfirmDialog,
  getStatusBadgeClass,
  formatDate
}: QuotationsTableProps) => {
  if (!quotations || quotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-gray-300 rounded-md bg-gray-50">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No Quotations Found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          There are no vendor quotations available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell>{formatDate(quote.created_at)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{quote.vendor_name}</div>
                  <div className="text-sm text-muted-foreground">{quote.store_name}</div>
                </div>
              </TableCell>
              <TableCell>{quote.tracking_id}</TableCell>
              <TableCell>{quote.customer_name}</TableCell>
              <TableCell>{formatCurrency(quote.price)}</TableCell>
              <TableCell>
                <span className={getStatusBadgeClass(quote.status)}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(quote)}
                  >
                    <InfoIcon className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  
                  {quote.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onConfirmDialog(quote.id, "accept")}
                        disabled={processingAction}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onConfirmDialog(quote.id, "reject")}
                        disabled={processingAction}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotationsTable;
