'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, ArrowLeft, Shield, Tag, Check, X, Receipt, Smartphone, Store } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { subscriptionService } from '@/services/subscription.service';
import { paymentService } from '@/services/payment.service';
import { billingService, type Invoice } from '@/services/billing.service';
import { adminService, type PriceCalculationResponse } from '@/services/admin.service';
import type { SubscriptionPlan } from '@/features/plans/types';
import { toast } from 'sonner';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('checkout');

  const planId = searchParams.get('planId');
  const invoiceUuid = searchParams.get('invoice');
  const initialIsAnnual = searchParams.get('annual') === 'true';

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnnual, setIsAnnual] = useState(initialIsAnnual);
  const [promoCode, setPromoCode] = useState('');
  const [gateway, setGateway] = useState('fawaterak');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [enabledGateways, setEnabledGateways] = useState<string[]>([]);
  
  // Promo code validation state
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculationResponse | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Mode: invoice (renewal) or plan (initial)
  const isInvoiceMode = !!invoiceUuid;

  useEffect(() => {
    if (!planId && !invoiceUuid) {
      router.push('/plans');
      return;
    }

    loadData();
  }, [planId, invoiceUuid]);

  // Reset promo validation when billing cycle changes
  useEffect(() => {
    if (priceCalculation) {
      setPriceCalculation(null);
      setPromoError(null);
    }
  }, [isAnnual]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load enabled gateways first
      try {
        const gateways = await paymentService.getEnabledGateways();
        setEnabledGateways(gateways);
        if (gateways.length > 0 && !gateways.includes(gateway)) {
          setGateway(gateways[0]);
        }
      } catch {
        setEnabledGateways(['fawaterak']);
      }

      // Invoice mode (renewal from email link)
      if (invoiceUuid) {
        const fetchedInvoice = await billingService.getInvoiceByUuid(invoiceUuid);
        setInvoice(fetchedInvoice);
        
        // If invoice already has a payment URL, use it
        if (fetchedInvoice.paymentUrl && fetchedInvoice.status === 'PENDING') {
          // Invoice already processed, can redirect or show
        }
        return;
      }

      // Plan mode (initial checkout)
      if (planId) {
        const fetchedPlan = await subscriptionService.getPlanById(Number(planId));
        setPlan(fetchedPlan);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      toast.error('Failed to load checkout details');
      router.push('/plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !plan) return;

    setIsValidatingPromo(true);
    setPromoError(null);
    setPriceCalculation(null);

    try {
      const response = await adminService.calculatePrice(plan.id, isAnnual, promoCode);
      
      if (response.promoCode) {
        setPriceCalculation(response);
        toast.success('Promo code applied!');
      } else {
        // Promo wasn't applied - server will handle error in CommonResponse
        setPromoError('Invalid or inapplicable promo code');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate promo code';
      setPromoError(message);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPriceCalculation(null);
    setPromoError(null);
  };

  const handleCheckout = async () => {
    try {
      setIsProcessing(true);

      // Invoice mode (renewal) - use billing service
      if (isInvoiceMode && invoice) {
        const response = await billingService.payInvoice(invoice.uuid, gateway, paymentMethod);
        
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          toast.error('Failed to get payment URL');
        }
        return;
      }

      // Plan mode (initial) - use payment service
      if (!plan) return;

      const response = await paymentService.initiatePayment(
        plan.id,
        isAnnual,
        priceCalculation ? promoCode : undefined,
        gateway,
        paymentMethod
      );

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        toast.error('Failed to get payment URL');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // For invoice mode, check invoice; for plan mode, check plan
  if (isInvoiceMode ? !invoice : !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{isInvoiceMode ? 'Invoice not found' : 'Plan not found'}</p>
      </div>
    );
  }

  // Calculate prices based on mode
  const displayPlanName = isInvoiceMode ? invoice!.planName : plan!.name;
  const displayDescription = isInvoiceMode ? invoice!.description : plan!.description;
  const originalPrice = isInvoiceMode 
    ? invoice!.originalAmount 
    : (isAnnual ? parseFloat(plan!.annualPrice) : parseFloat(plan!.monthlyPrice));
  const discountAmount = isInvoiceMode 
    ? (invoice!.discountAmount || 0) 
    : (priceCalculation?.discount || 0);
  const finalPrice = isInvoiceMode 
    ? invoice!.finalAmount 
    : (priceCalculation?.totalPrice || originalPrice);
  const period = isInvoiceMode 
    ? (invoice!.billingType === 'RENEWAL' ? 'renewal' : 'month')
    : (isAnnual ? 'year' : 'month');

  return (
    <div className="min-h-screen py-12 px-4 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/plans">
            <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t('backToPlans')}
          </Link>
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Details */}
              <div className="rounded-lg border p-4 bg-background">
                <div className="flex items-center gap-2">
                  {isInvoiceMode && <Receipt className="h-5 w-5 text-primary" />}
                  <h3 className="text-xl font-bold">{displayPlanName}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{displayDescription}</p>
                {isInvoiceMode && invoice && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Invoice created: {new Date(invoice.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Billing Cycle - only show in plan mode */}
              {!isInvoiceMode && plan && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">{t('billingCycle')}</Label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsAnnual(false)}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        !isAnnual
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold">{t('monthly')}</div>
                      <div className="text-2xl font-bold mt-1">{parseFloat(plan.monthlyPrice).toFixed(2)} EGP</div>
                      <div className="text-xs text-muted-foreground">{t('perMonth')}</div>
                    </button>
                    <button
                      onClick={() => setIsAnnual(true)}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all relative ${
                        isAnnual
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <span className="absolute -top-2 ltr:right-2 rtl:left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {t('save20')}
                      </span>
                      <div className="font-semibold">{t('yearly')}</div>
                      <div className="text-2xl font-bold mt-1">{parseFloat(plan.annualPrice).toFixed(2)} EGP</div>
                      <div className="text-xs text-muted-foreground">{t('perYear')}</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Promo Code - only show in plan mode */}
              {!isInvoiceMode && (
              <div>
                <Label htmlFor="promo" className="text-sm font-medium mb-2 block">
                  <Tag className="h-4 w-4 inline mr-1" />
                  {t('promoCode')}
                </Label>
                {priceCalculation ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        {promoCode.toUpperCase()}
                      </span>
                      <span className="text-sm text-green-600">
                        (-{priceCalculation.currency} {discountAmount.toFixed(2)})
                      </span>
                    </div>
                    <button onClick={handleRemovePromo} className="text-green-700 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        id="promo"
                        placeholder={t('enterPromoCode')}
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError(null);
                        }}
                      />
                      <Button 
                        variant="outline" 
                        disabled={!promoCode.trim() || isValidatingPromo}
                        onClick={handleApplyPromo}
                      >
                        {isValidatingPromo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('apply')
                        )}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-sm text-destructive mt-1">{promoError}</p>
                    )}
                  </>
                )}
              </div>
              )}

              {/* Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{t('subtotal')}</span>
                  <span>{originalPrice.toFixed(2)} EGP</span>
                </div>
                {(discountAmount > 0) && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>{t('discount')}</span>
                    <span>-{discountAmount.toFixed(2)} EGP</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t('total')}</span>
                  <div className="text-right">
                    {discountAmount > 0 ? (
                      <>
                        <span className="line-through text-muted-foreground text-sm mr-2">
                          {originalPrice.toFixed(2)} EGP
                        </span>
                        <span className="text-green-600">{finalPrice.toFixed(2)} EGP</span>
                      </>
                    ) : (
                      <span>{finalPrice.toFixed(2)} EGP</span>
                    )}
                    <span className="text-sm font-normal text-muted-foreground"> / {period}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                {t('paymentMethod')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gateway Selection */}
              <div className="space-y-3">
                {enabledGateways.includes('fawaterak') && (
                  <button
                    onClick={() => setGateway('fawaterak')}
                    className={`w-full flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-muted/50 cursor-pointer transition-all text-left ${
                      gateway === 'fawaterak' ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      gateway === 'fawaterak' ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {gateway === 'fawaterak' && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{t('fawaterak')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('fawaterakDesc')}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                      <div className="w-10 h-6 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 -ml-1"></div>
                      </div>
                    </div>
                  </button>
                )}

                {enabledGateways.includes('paymob') && (
                  <button
                    onClick={() => setGateway('paymob')}
                    className={`w-full flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-muted/50 cursor-pointer transition-all text-left ${
                      gateway === 'paymob' ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      gateway === 'paymob' ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {gateway === 'paymob' && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{t('paymob')}</div>
                      <div className="text-sm text-muted-foreground">
                        {t('paymobDesc')}
                      </div>
                    </div>
                  </button>
                )}
              </div>

             {/* Payment Method Selection */}
              {(gateway === 'fawaterak' || gateway === 'paymob') && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    {t('selectPaymentMethod') || 'Select Payment Method'}
                  </Label>
                  
                  {/* CHANGED: grid-cols-3 to grid-cols-2 to fit 2 items evenly */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Visa/Card Option */}
                    <button
                      onClick={() => setPaymentMethod('CARD')}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all text-center h-full hover:bg-muted/50 ${
                        paymentMethod === 'CARD' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1 transition-colors ${
                        paymentMethod === 'CARD' 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-muted-foreground'
                      }`}>
                        {paymentMethod === 'CARD' && <Check className="h-3 w-3" />}
                      </div>
                      
                      <CreditCard className={`h-8 w-8 ${paymentMethod === 'CARD' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                      
                      <div>
                        <div className="font-medium">{t('visa') || 'Card'}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {t('visaDesc') || 'Visa, Mastercard'}
                        </div>
                      </div>
                    </button>

                    {/* Mobile Wallet Option */}
                    <button
                      onClick={() => setPaymentMethod('WALLET')}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all text-center h-full hover:bg-muted/50 ${
                        paymentMethod === 'WALLET' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1 transition-colors ${
                        paymentMethod === 'WALLET' 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : 'border-muted-foreground'
                      }`}>
                        {paymentMethod === 'WALLET' && <Check className="h-3 w-3" />}
                      </div>
                      
                      <Smartphone className={`h-8 w-8 ${paymentMethod === 'WALLET' ? 'text-green-600' : 'text-muted-foreground'}`} />
                      
                      <div>
                        <div className="font-medium">{t('mobileWallet') || 'Wallet'}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {t('mobileWalletDesc') || 'Vodafone, Orange...'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Security Note */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400">
                <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">{t('securePayment')}</div>
                  <p className="text-green-700 dark:text-green-500">
                    {t('securePaymentDesc')}
                  </p>
                </div>
              </div>

              {/* Consent Disclaimer */}
              <p className="text-xs text-muted-foreground text-center px-4">
                {t('subscription.policy.consentDisclaimer')}
              </p>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {t('pay')} {finalPrice.toFixed(2)} EGP
                  </>
                )}
              </Button>

              <div className="flex flex-wrap justify-center gap-x-1 text-xs text-muted-foreground text-center">
                <a href="/terms" target="_blank" className="underline hover:text-foreground">{t('termsOfService')}</a>
                <span>&bull;</span>
                <a href="/policy" target="_blank" className="underline hover:text-foreground">{t('privacyPolicy')}</a>
                <span>&bull;</span>
                <a href="/policy/cancellation" target="_blank" className="underline hover:text-foreground">
                  {t('subscription.policy.nature')} & {t('subscription.policy.noRefund')}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
