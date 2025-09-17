
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldCheck, Info, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuotedComponent {
  component_name: string;
  quantity: number;
  quoted_price: number;
  unit_price?: number;
  status?: string;
  component_details?: any;
  specs?: string;
}

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
  components?: QuotedComponent[];
}

interface QuotationDetailsDialogProps {
  selectedQuotation: QuotationItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  processingAction: boolean;
  onConfirmDialog: (quotationId: string, action: "accept" | "reject") => void;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (dateString: string) => string;
}

const QuotationDetailsDialog = ({
  selectedQuotation,
  isOpen,
  onOpenChange,
  processingAction,
  onConfirmDialog,
  getStatusBadgeClass,
  formatDate
}: QuotationDetailsDialogProps) => {
  if (!selectedQuotation) return null;

  const getComponentDescription = (component: QuotedComponent) => {
    // First check if we have a predefined specs string
    if (component.specs) {
      return component.specs;
    }
    
    if (!component.component_details) return null;
    
    const details = component.component_details;
    const specs = [];
    
    if (details.name && details.name !== component.component_name) specs.push(details.name);
    if (details.description && details.description !== component.component_name) specs.push(details.description);
    
    if (details.category) {
      if (details.category.toLowerCase().includes('processor') || details.category.toLowerCase() === 'cpu') {
        if (details.clock_speed) specs.push(`${details.clock_speed}GHz`);
        if (details.cores) specs.push(`${details.cores} cores`);
      } else if (details.category.toLowerCase().includes('gpu') || details.category.toLowerCase() === 'graphics') {
        if (details.memory) specs.push(`${details.memory}GB VRAM`);
        if (details.vram) specs.push(`${details.vram}GB VRAM`);
      } else if (details.category.toLowerCase().includes('ram') || details.category.toLowerCase() === 'memory') {
        if (details.capacity) specs.push(`${details.capacity}GB`);
        if (details.speed) specs.push(`${details.speed}MHz`);
      } else if (details.category.toLowerCase().includes('storage')) {
        if (details.capacity) specs.push(`${details.capacity}GB`);
        if (details.type) specs.push(details.type);
      }
    }
    
    return specs.length > 0 ? specs.join(' | ') : null;
  };

  const getComponentDisplayName = (component: QuotedComponent) => {
    return component.component_name || component.component_details?.name || 'Unknown Component';
  };

  const getComponentCategory = (component: QuotedComponent) => {
    if (component.component_details?.category) {
      return component.component_details.category;
    }
    
    // Try to infer category from name
    const name = component.component_name.toLowerCase();
    
    if (name.includes('processor') || name.includes('cpu') || name.includes('ryzen') || name.includes('intel')) {
      return 'Processor';
    } else if (name.includes('graphics') || name.includes('gpu') || name.includes('rtx') || name.includes('gtx')) {
      return 'Graphics Card';
    } else if (name.includes('memory') || name.includes('ram') || name.includes('ddr')) {
      return 'Memory';
    } else if (name.includes('storage') || name.includes('ssd') || name.includes('hdd') || name.includes('nvme')) {
      return 'Storage';
    } else if (name.includes('cooling') || name.includes('cooler') || name.includes('fan')) {
      return 'Cooling';
    } else if (name.includes('power') || name.includes('psu') || name.includes('supply')) {
      return 'Power Supply';
    } else if (name.includes('motherboard') || name.includes('mobo')) {
      return 'Motherboard';
    } else if (name.includes('case')) {
      return 'PC Case';
    }
    
    return 'Component';
  };

  const ensureComponentPrices = (components: QuotedComponent[] | undefined) => {
    if (!components || components.length === 0) return [];
    
    const allZeroPrices = components.every(component => 
      !component.quoted_price || component.quoted_price === 0
    );
    
    if (allZeroPrices) {
      return components.map(component => {
        const componentType = (component.component_details?.category || component.component_name).toLowerCase();
        let defaultPrice = 0;
        
        if (componentType.includes('processor')) defaultPrice = 15000;
        else if (componentType.includes('graphics') || componentType.includes('gpu')) defaultPrice = 25000;
        else if (componentType.includes('memory') || componentType.includes('ram')) defaultPrice = 5000;
        else if (componentType.includes('storage')) defaultPrice = 5000;
        else if (componentType.includes('cooling')) defaultPrice = 2500;
        else if (componentType.includes('power')) defaultPrice = 4000;
        else if (componentType.includes('motherboard')) defaultPrice = 8000;
        else if (componentType.includes('case')) defaultPrice = 3500;
        else defaultPrice = 1000;
        
        return {
          ...component,
          quoted_price: defaultPrice,
          unit_price: component.unit_price || defaultPrice
        };
      });
    }
    
    return components;
  };

  const components = ensureComponentPrices(selectedQuotation.components);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Quotation Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vendor</p>
              <p className="font-medium">{selectedQuotation.vendor_name}</p>
              <p className="text-sm">{selectedQuotation.store_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{selectedQuotation.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-medium">{selectedQuotation.tracking_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(selectedQuotation.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span className={getStatusBadgeClass(selectedQuotation.status)}>
                {selectedQuotation.status.charAt(0).toUpperCase() + selectedQuotation.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Quotation Amount</p>
              <p className="font-medium flex items-center">
                <IndianRupee className="h-4 w-4 mr-1 text-muted-foreground" />
                {selectedQuotation.price}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Component Pricing</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">List Price</TableHead>
                  <TableHead className="text-right">Quoted Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components && components.length > 0 ? (
                  components.map((component, idx) => {
                    const description = getComponentDescription(component);
                    const displayName = getComponentDisplayName(component);
                    const category = getComponentCategory(component);
                    
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center">
                            {displayName}
                            {description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm max-w-xs">{description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          {category && (
                            <span className="text-xs text-muted-foreground block mt-1">
                              Category: {category}
                            </span>
                          )}
                          {(!description && !category) && (
                            <span className="text-xs text-muted-foreground block mt-1">
                              No specifications available
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium">{component.quantity}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <IndianRupee className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{component.unit_price || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <IndianRupee className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{component.quoted_price}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(component.quoted_price * component.quantity)}
                        </TableCell>
                        <TableCell className="text-right">
                          {component.status && (
                            <span className={getStatusBadgeClass(component.status)}>
                              {component.status.charAt(0).toUpperCase() + component.status.slice(1)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No component details available
                    </TableCell>
                  </TableRow>
                )}
                
                {components && components.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">Total:</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(selectedQuotation.price)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {selectedQuotation.status === 'pending' && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => onConfirmDialog(selectedQuotation.id, "accept")}
                  disabled={processingAction}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept Quotation
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onConfirmDialog(selectedQuotation.id, "reject")}
                  disabled={processingAction}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject Quotation
                </Button>
              </div>
            )}
            
            {selectedQuotation.status === 'accepted' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <p className="font-medium">Quotation Accepted</p>
                </div>
                <p>This quotation has been accepted. The vendor has been notified and will proceed with the order.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationDetailsDialog;
