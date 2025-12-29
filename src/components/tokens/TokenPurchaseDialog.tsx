import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Zap, Tag } from 'lucide-react';
import { TokenPackage, tokenPackageService, PurchasePreviewResponse } from '@/services/token-package.service';
import { toast } from 'sonner';

interface TokenPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenPackage: TokenPackage | null;
}

export function TokenPurchaseDialog({
  open,
  onOpenChange,
  tokenPackage,
}: TokenPurchaseDialogProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PurchasePreviewResponse | null>(null);

  const handleApplyPromo = async () => {
    if (!tokenPackage || !promoCode) return;
    
    try {
        setIsPreviewLoading(true);
        const data = await tokenPackageService.previewPurchase(tokenPackage.id, promoCode);
        setPreviewData(data);
        if (!data.promoApplied) {
            toast.error(data.message || "Invalid promo code");
        } else {
             toast.success("Promo code applied!");
        }
    } catch (error: any) {
        toast.error("Failed to apply promo code");
        setPreviewData(null);
    } finally {
        setIsPreviewLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!tokenPackage) return;

    try {
      setIsProcessing(true);
      const result = await tokenPackageService.purchasePackage(tokenPackage.id, promoCode);

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else if (result.paymentKey) {
        toast.success('Payment initiated');
        onOpenChange(false);
      } else {
        toast.error(result.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Error purchasing package:', error);
      toast.error(error?.message || 'Failed to initiate purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!tokenPackage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            You are about to purchase {tokenPackageService.formatTokens(tokenPackage.tokens)} tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Package Summary */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex flex-col">
              <span className="font-semibold text-lg">{tokenPackage.name}</span>
              <span className="text-sm text-muted-foreground">
                {tokenPackageService.formatTokens(tokenPackage.tokens)} Tokens
              </span>
            </div>
            <div className="text-xl font-bold">
              {tokenPackage.price.toFixed(2)} {tokenPackage.currency}
            </div>
          </div>

          {/* Promo Code Input */}
          <div className="space-y-2">
            <Label htmlFor="promoCode">Promo Code (Optional)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="promoCode"
                  placeholder="Enter code"
                  className="pl-9"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    if (previewData) setPreviewData(null); // Clear preview on change
                  }}
                />
              </div>
              <Button 
                variant="secondary" 
                onClick={handleApplyPromo}
                disabled={!promoCode || isPreviewLoading || isProcessing}
              >
                {isPreviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
            
            {/* Preview / Validation Result */}
            {previewData ? (
                <div className={`mt-2 p-3 rounded-md text-sm space-y-2 border ${previewData.promoApplied ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Original Price:</span>
                        <span>{previewData.originalPrice.toFixed(2)} {previewData.currency}</span>
                    </div>
                    {previewData.discountAmount > 0 && (
                         <div className="flex justify-between text-green-700 font-medium">
                            <span>Discount:</span>
                            <span>- {previewData.discountAmount.toFixed(2)} {previewData.currency}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-base">
                        <span>Total:</span>
                        <span>{previewData.finalPrice.toFixed(2)} {previewData.currency}</span>
                    </div>
                     {previewData.message && (
                        <p className={`text-xs mt-1 font-medium ${previewData.promoApplied ? 'text-green-600' : 'text-red-500'}`}>
                            {previewData.message}
                        </p>
                     )}
                </div>
            ) : (
                <p className="text-[0.8rem] text-muted-foreground">
                  Have a promo code? Apply it to see your discount.
                </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                {previewData && previewData.promoApplied ? `Pay ${previewData.finalPrice.toFixed(2)} ${tokenPackage.currency}` : "Proceed to Payment"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
