import { useState, useEffect } from 'react';
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
import {
  Loader2,
  Zap,
  Tag,
  CreditCard,
  Smartphone,
  Shield,
  Check,
  X,
} from 'lucide-react';
import Image from 'next/image';
import {
  TokenPackage,
  tokenPackageService,
  PurchasePreviewResponse,
} from '@/services/token-package.service';
import { paymentService } from '@/services/payment.service';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('checkout');
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] =
    useState<PurchasePreviewResponse | null>(null);

  // Payment method state (matching checkout page)
  const [gateway, setGateway] = useState('fawaterak');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [walletPhone, setWalletPhone] = useState('');
  const [enabledGateways, setEnabledGateways] = useState<string[]>([]);
  const [isLoadingGateways, setIsLoadingGateways] = useState(false);

  // Load enabled gateways when dialog opens
  useEffect(() => {
    if (open) {
      loadGateways();
    } else {
      // Reset state when dialog closes
      setPromoCode('');
      setPreviewData(null);
      setPaymentMethod('CARD');
      setWalletPhone('');
    }
  }, [open]);

  const loadGateways = async () => {
    try {
      setIsLoadingGateways(true);
      const config = await paymentService.getPaymentConfig();
      setEnabledGateways(config.enabledGateways);
      if (
        config.resolvedGateway &&
        config.resolvedGateway !== 'default' &&
        config.resolvedGateway !== 'dodo'
      ) {
        setGateway(config.resolvedGateway);
      } else if (config.enabledGateways.length > 0 && !config.enabledGateways.includes(gateway)) {
        const menaGateway = config.enabledGateways.find((g) => g !== 'dodo');
        setGateway(menaGateway ?? config.enabledGateways[0]);
        setGateway(config.enabledGateways[0]);
      }
    } catch {
      setEnabledGateways(['fawaterak']);
    } finally {
      setIsLoadingGateways(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!tokenPackage || !promoCode) return;

    try {
      setIsPreviewLoading(true);
      const data = await tokenPackageService.previewPurchase(
        tokenPackage.id,
        promoCode,
      );
      setPreviewData(data);
      if (!data.promoApplied) {
        toast.error(data.message || 'Invalid promo code');
      } else {
        toast.success('Promo code applied!');
      }
    } catch (error: any) {
      toast.error('Failed to apply promo code');
      setPreviewData(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPreviewData(null);
  };

  const handlePurchase = async () => {
    if (!tokenPackage) return;

    // Validate wallet phone if selected
    if (paymentMethod === 'WALLET' && !walletPhone.match(/^01[0125][0-9]{8}$/)) {
      toast.error(t('walletPhoneHint'));
      return;
    }

    try {
      setIsProcessing(true);
      const result = await tokenPackageService.purchasePackage(
        tokenPackage.id,
        previewData?.promoApplied ? promoCode : undefined,
        gateway,
        paymentMethod,
        paymentMethod === 'WALLET' ? walletPhone : undefined,
      );

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

  const displayPrice =
    previewData?.promoApplied ? previewData.finalPrice : tokenPackage.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('orderSummary')}</DialogTitle>
          <DialogDescription>
            You are about to purchase{' '}
            {tokenPackageService.formatTokens(tokenPackage.tokens)} tokens.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Package Summary */}
          <div className="rounded-lg border p-4 bg-background">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold text-lg">
                  {tokenPackage.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tokenPackageService.formatTokens(tokenPackage.tokens)} Tokens
                </span>
              </div>
              <div className="text-xl font-bold">
                {tokenPackage.price.toFixed(2)} {tokenPackage.currency}
              </div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="space-y-2">
            <Label htmlFor="promoCode" className="text-sm font-medium flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {t('promoCode')}
            </Label>
            {previewData?.promoApplied ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    {promoCode.toUpperCase()}
                  </span>
                  <span className="text-sm text-green-600">
                    (-{previewData.currency}{' '}
                    {previewData.discountAmount.toFixed(2)})
                  </span>
                </div>
                <button
                  onClick={handleRemovePromo}
                  className="text-green-700 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="promoCode"
                      placeholder={t('enterPromoCode')}
                      className="pl-9"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        if (previewData) setPreviewData(null);
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleApplyPromo}
                    disabled={
                      !promoCode.trim() || isPreviewLoading || isProcessing
                    }
                  >
                    {isPreviewLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('apply')
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Price Summary */}
          {previewData?.promoApplied && (
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{t('subtotal')}</span>
                <span>
                  {previewData.originalPrice.toFixed(2)}{' '}
                  {previewData.currency}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>{t('discount')}</span>
                <span>
                  -{previewData.discountAmount.toFixed(2)}{' '}
                  {previewData.currency}
                </span>
              </div>
              <div className="flex justify-between items-center text-base font-bold">
                <span>{t('total')}</span>
                <span className="text-green-600">
                  {previewData.finalPrice.toFixed(2)} {previewData.currency}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Section */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t('paymentMethod')}
            </Label>

            {isLoadingGateways ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Dodo for token top-ups: enable when token_packages.dodo_product_id is set (phase 2 UI) */}

                {enabledGateways.includes('fawaterak') && (
                  <button
                    onClick={() => {
                      setGateway('fawaterak');
                      setPaymentMethod('CARD');
                    }}
                    className={`w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg border-2 hover:bg-muted/50 cursor-pointer transition-all text-left rtl:text-right ${
                      gateway === 'fawaterak'
                        ? 'border-primary bg-primary/5'
                        : 'border-muted'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        gateway === 'fawaterak'
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {gateway === 'fawaterak' && (
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {t('fawaterak')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('fawaterakDesc')}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-[10px] flex items-center justify-center font-bold">
                        VISA
                      </div>
                      <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 -ml-1"></div>
                      </div>
                    </div>
                  </button>
                )}

                {enabledGateways.includes('paymob') && (
                  <button
                    onClick={() => setGateway('paymob')}
                    className={`w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg border-2 hover:bg-muted/50 cursor-pointer transition-all text-left rtl:text-right ${
                      gateway === 'paymob'
                        ? 'border-primary bg-primary/5'
                        : 'border-muted'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        gateway === 'paymob'
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {gateway === 'paymob' && (
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Image
                        src="/paymob.png"
                        alt="Paymob"
                        width={80}
                        height={80}
                      />
                      <div className="text-xs text-muted-foreground">
                        {t('paymobDesc')}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-[10px] flex items-center justify-center font-bold">
                        VISA
                      </div>
                      <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 -ml-1"></div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Payment Method Selection for Paymob */}
                {gateway === 'paymob' && (
                  <div className="space-y-3 pt-2 ltr:pl-6 rtl:pr-6">
                    <Label className="text-sm font-medium">
                      {t('selectPaymentMethod')}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'CARD'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <CreditCard
                          className={`h-5 w-5 ${paymentMethod === 'CARD' ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <span className="font-medium text-sm">
                          {t('creditCard')}
                        </span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('WALLET')}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'WALLET'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <Smartphone
                          className={`h-5 w-5 ${paymentMethod === 'WALLET' ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <span className="font-medium text-sm">
                          {t('mobileWallet')}
                        </span>
                      </button>
                    </div>

                    {/* Wallet Phone Input */}
                    {paymentMethod === 'WALLET' && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="walletPhone" className="text-sm">
                          {t('walletPhoneNumber')}
                        </Label>
                        <Input
                          id="walletPhone"
                          placeholder="01xxxxxxxxx"
                          value={walletPhone}
                          onChange={(e) => setWalletPhone(e.target.value)}
                          className={
                            !walletPhone.match(/^01[0125][0-9]{8}$/) &&
                            walletPhone
                              ? 'border-red-500'
                              : ''
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('walletPhoneHint')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400">
            <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-medium">{t('securePayment')}</span>
              <span className="text-green-700 dark:text-green-500">
                {' '}{t('securePaymentDesc')}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
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
                {t('pay')} {displayPrice.toFixed(2)} {tokenPackage.currency}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
