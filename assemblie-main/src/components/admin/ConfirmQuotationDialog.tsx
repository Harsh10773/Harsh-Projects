
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface ConfirmQuotationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: "accept" | "reject";
  quotationId: string;
  processingAction: boolean;
  onConfirm: (quotationId: string, status: string) => Promise<void>;
}

const ConfirmQuotationDialog = ({
  isOpen,
  onOpenChange,
  action,
  quotationId,
  processingAction,
  onConfirm
}: ConfirmQuotationDialogProps) => {
  return (
    <AlertDialog 
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === "accept" 
              ? "Accept Quotation" 
              : "Reject Quotation"
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action === "accept"
              ? "Are you sure you want to accept this vendor quotation? This will notify the vendor and update the order status."
              : "Are you sure you want to reject this vendor quotation? This will update the vendor's statistics."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processingAction}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(
              quotationId, 
              action === "accept" ? "accepted" : "rejected"
            )}
            className={action === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}
            disabled={processingAction}
          >
            {processingAction ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              action === "accept" ? "Accept" : "Reject"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmQuotationDialog;
