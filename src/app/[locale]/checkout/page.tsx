'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, ArrowLeft, Shield, Tag, Check } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { subscriptionService } from '@/services/subscription.service';
import { paymentService } from '@/services/payment.service';
import type { SubscriptionPlan } from '@/features/plans/types';
import { toast } from 'sonner';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('checkout');

  const planId = searchParams.get('planId');
  const initialIsAnnual = searchParams.get('annual') === 'true';

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnnual, setIsAnnual] = useState(initialIsAnnual);
  const [promoCode, setPromoCode] = useState('');
  const [gateway, setGateway] = useState('fawaterak');
  const [enabledGateways, setEnabledGateways] = useState<string[]>([]);

  useEffect(() => {
    if (!planId) {
      router.push('/plans');
      return;
    }

    loadData();
  }, [planId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Fetch plan details
      const fetchedPlan = await subscriptionService.getPlanById(Number(planId));
      setPlan(fetchedPlan);

      // Fetch enabled gateways
      try {
        const gateways = await paymentService.getEnabledGateways();
        setEnabledGateways(gateways);
        if (gateways.length > 0 && !gateways.includes(gateway)) {
          setGateway(gateways[0]);
        }
      } catch {
        // Default to fawaterak if config endpoint fails
        setEnabledGateways(['fawaterak']);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      toast.error('Failed to load plan details');
      router.push('/plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!plan) return;

    try {
      setIsProcessing(true);

      const response = await paymentService.initiatePayment(
        plan.id,
        isAnnual,
        promoCode || undefined,
        gateway
      );

      if (response.paymentUrl) {
        // Redirect to payment gateway
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

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Plan not found</p>
      </div>
    );
  }

  const price = isAnnual ? parseFloat(plan.annualPrice) : parseFloat(plan.monthlyPrice);
  const period = isAnnual ? 'year' : 'month';

  return (
    <div className="min-h-screen py-12 px-4 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
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
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              {/* Billing Cycle */}
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
                    <div className="font-semibold">Monthly</div>
                    <div className="text-2xl font-bold mt-1">${parseFloat(plan.monthlyPrice).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all relative ${
                      isAnnual
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <span className="absolute -top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Save 20%
                    </span>
                    <div className="font-semibold">Yearly</div>
                    <div className="text-2xl font-bold mt-1">${parseFloat(plan.annualPrice).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">per year</div>
                  </button>
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <Label htmlFor="promo" className="text-sm font-medium mb-2 block">
                  <Tag className="h-4 w-4 inline mr-1" />
                  {t('promoCode')}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button variant="outline" disabled={!promoCode}>
                    Apply
                  </Button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t('total')}</span>
                  <span>${price.toFixed(2)} / {period}</span>
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
                      <div className="font-medium">Fawaterak</div>
                      <div className="text-sm text-muted-foreground">
                        Credit/Debit Card, Fawry, Wallets
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
                      <div className="font-medium">Paymob</div>
                      <div className="text-sm text-muted-foreground">
                        Credit/Debit Card, Mobile Wallets
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400">
                <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium">Secure Payment</div>
                  <p className="text-green-700 dark:text-green-500">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>

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
                    Pay ${price.toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By confirming, you agree to our{' '}
                <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
              </p>
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
