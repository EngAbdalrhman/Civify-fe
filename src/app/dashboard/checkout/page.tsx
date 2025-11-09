"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  subscriptionService,
  paymentService,
  SubscriptionPlan,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Check,
  ArrowLeft,
  CreditCard,
  Shield,
  Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function CheckoutContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const planId = searchParams.get("planId");

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!planId) {
      toast({
        title: "Error",
        description: "No plan selected",
        variant: "destructive",
      });
      router.push("/dashboard/plans");
      return;
    }

    loadPlan();
  }, [planId, user]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const planData = await subscriptionService.getPlanById(Number(planId));
      setPlan(planData);
    } catch (error: any) {
      console.error("Error loading plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load plan details",
        variant: "destructive",
      });
      router.push("/dashboard/plans");
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (): string => {
    if (!plan) return "0.00";
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    return parseFloat(price).toFixed(2);
  };

  const calculateSavings = (): string => {
    if (!plan || !isAnnual) return "0.00";
    const monthlyTotal = parseFloat(plan.monthlyPrice) * 12;
    const annualPrice = parseFloat(plan.annualPrice);
    const savings = monthlyTotal - annualPrice;
    return savings.toFixed(2);
  };

  const handleCheckout = async () => {
    if (!plan) return;

    try {
      setProcessing(true);

      // Initiate payment with backend
      const paymentResponse = await paymentService.initiatePayment(
        plan.id,
        isAnnual,
        promoCode || undefined
      );

      // Redirect to Paymob payment page
      window.location.href = paymentResponse.paymentUrl;
    } catch (error: any) {
      console.error("Error initiating payment:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const price = calculatePrice();
  const savings = calculateSavings();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/plans")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Purchase
        </h1>
        <p className="text-gray-600">
          You're one step away from unlocking premium features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Plan Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Summary</CardTitle>
            <CardDescription>Review your selected plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-600 mt-1">{plan.description}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Features:</h4>
              <ul className="space-y-2">
                {plan.cvLimit === null ? (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Unlimited CV generations</span>
                  </li>
                ) : (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{plan.cvLimit} CV generations per month</span>
                  </li>
                )}

                {plan.apiLimit !== null && plan.apiLimit > 0 && (
                  <>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Full API access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{plan.apiLimit} API calls per month</span>
                    </li>
                  </>
                )}

                {!plan.watermark && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>No watermark</span>
                  </li>
                )}

                {plan.dashboard && (
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Dashboard access</span>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Choose your billing cycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Billing Cycle Toggle */}
            {plan.annualPrice && parseFloat(plan.annualPrice) > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label htmlFor="annual-billing" className="text-base font-medium">
                      Annual Billing
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Save ${savings} per year
                    </p>
                  </div>
                  <Switch
                    id="annual-billing"
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                  />
                </div>
              </div>
            )}

            {/* Promo Code */}
            <div className="space-y-2">
              <Label htmlFor="promo-code">Promo Code (Optional)</Label>
              <Input
                id="promo-code"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>{isAnnual ? "Annual" : "Monthly"} Price:</span>
                <span>${price}</span>
              </div>

              {isAnnual && parseFloat(savings) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Annual Savings:</span>
                  <span>-${savings}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${price}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Secure payment powered by Paymob</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

