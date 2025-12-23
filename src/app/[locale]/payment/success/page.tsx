'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, ArrowRight, Home, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { paymentService } from '@/services/payment.service';
import { toast } from 'sonner';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('payment.success');

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      setError(null);

      // Detect gateway from URL params
      const gateway = searchParams.get('gateway') || 'fawaterak';

      let callbackData;
      if (gateway === 'paymob') {
        callbackData = paymentService.parsePaymobCallback(searchParams);
      } else {
        callbackData = paymentService.parseFawaterakCallback(searchParams);
      }

      if (!callbackData.success) {
        // Payment not marked as success, redirect to failure
        router.push(`/payment/failure?error=${encodeURIComponent(callbackData.error || 'Payment was not successful')}`);
        return;
      }

      if (!callbackData.transactionId) {
        throw new Error('No transaction ID found in callback');
      }

      // Verify payment with backend (with retry)
      const result = await paymentService.handlePaymentSuccess(
        callbackData.transactionId,
        5, // max retries
        2000 // retry delay
      );

      if (result.verified) {
        setVerified(true);
        toast.success('Payment verified successfully!');
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify payment');
      toast.error('Payment verification failed. Please contact support.');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">{t('verifying')}</h2>
              <p className="text-muted-foreground">
                {t('verifyingMessage')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-4">
                <Loader2 className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('verificationPending')}</CardTitle>
            <CardDescription>{t('verificationPendingMessage')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                {error}
              </p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Your payment may still be processing. Please check your email for confirmation or contact support.
            </p>
            <div className="space-y-2">
              <Button onClick={verifyPayment} className="w-full" size="lg">
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full" size="lg">
                <Link href="/app">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">{t('title')}</CardTitle>
          <CardDescription className="text-base">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-400">
              {t('message')}
            </p>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full" size="lg">
              <Link href="/app">
                <Home className="mr-2 h-4 w-4" />
                {t('goToDashboard')}
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full" size="lg">
              <Link href="/app/upload">
                <ArrowRight className="mr-2 h-4 w-4" />
                {t('startCreating')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
