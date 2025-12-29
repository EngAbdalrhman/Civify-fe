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
import { TokenPackage, tokenPackageService } from '@/services/token-package.service';
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
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="promoCode"
                placeholder="Enter code"
                className="pl-9"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              />
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              If valid, discount will be applied at payment gateway.
            </p>
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
                Proceed to Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
