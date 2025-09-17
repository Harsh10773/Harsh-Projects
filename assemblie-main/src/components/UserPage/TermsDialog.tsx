
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { userTermsContent } from './TermsContent';

interface TermsDialogProps {
  showTermsDialog: boolean;
  setShowTermsDialog: (show: boolean) => void;
  setTermsAccepted: (accepted: boolean) => void;
}

const TermsDialog: React.FC<TermsDialogProps> = ({
  showTermsDialog,
  setShowTermsDialog,
  setTermsAccepted
}) => {
  return (
    <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" /> Terms and Conditions
          </DialogTitle>
          <DialogDescription>
            Please review our terms and conditions before proceeding
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 text-sm">
          {userTermsContent}
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => setShowTermsDialog(false)}>Close</Button>
          <Button 
            onClick={() => {
              setTermsAccepted(true);
              setShowTermsDialog(false);
            }}
          >
            Accept Terms
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;
