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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [gateways, setGateways] = useState<string[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>("");

  useEffect(() => {
    // if (!user) {
    //   router.push("/login");
    //   return;
    // }

    if (!planId) {
      toast({
        title: "Error",
        description: "No plan selected",
        variant: "destructive",
      });
      router.push("/dashboard/plans");
      return;
    }

    loadData();
  }, [planId, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [planData, enabledGateways] = await Promise.all([
        subscriptionService.getPlanById(Number(planId)),
        paymentService.getEnabledGateways(),
      ]);
      
      setPlan(planData);
      setGateways(enabledGateways);
      
      if (enabledGateways.length > 0) {
        setSelectedGateway(enabledGateways[0]);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load checkout details",
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
    if (!selectedGateway) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      // Initiate payment with backend
      const paymentResponse = await paymentService.initiatePayment(
        plan.id,
        isAnnual,
        promoCode || undefined,
        selectedGateway
      );

      // Redirect to payment page (Fawaterak or Paymob)
      if (paymentResponse.paymentUrl) {
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
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

  // Helper to get features list (similar to plans page)
  const getPlanFeatures = (plan: SubscriptionPlan): string[] => {
    const features: string[] = [];
    if (plan.cvLimit === null) features.push("Unlimited CV generations");
    else features.push(`${plan.cvLimit} CV generations per month`);
    
    if (plan.apiLimit !== null && plan.apiLimit > 0) {
      features.push("Full API access");
      features.push(`${plan.apiLimit} API calls per month`);
    }
    
    features.push("AI-powered CV tailoring");
    features.push("Personal information masking");
    features.push("PDF export");
    
    if (!plan.watermark) features.push("No watermark");
    
    if (plan.dashboard) {
      features.push("Dashboard access");
      features.push("Priority support");
      features.push("Advanced AI features");
    } else {
      features.push("Basic support");
    }
    return features;
  };

  const features = getPlanFeatures(plan);

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Confirm Your Subscription
        </h1>
        <p className="text-gray-600">
          Review the details of your selected plan below before proceeding to payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Plan Summary (Takes up 2 cols on large screens) */}
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">${price}</span>
                    <span className="text-gray-500">/{isAnnual ? "year" : "month"}</span>
                  </div>
                  <p className="text-gray-500 mt-2">{plan.description}</p>
                </div>
                {plan.name.toLowerCase().includes("premium") && (
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                )}
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">What's included:</h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-green-100 p-1">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-sm bg-gray-50/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium text-gray-900">{plan.name}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Billing Cycle</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!isAnnual ? "font-medium text-gray-900" : "text-gray-500"}`}>Monthly</span>
                    <Switch
                      checked={isAnnual}
                      onCheckedChange={setIsAnnual}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <span className={`text-sm ${isAnnual ? "font-medium text-gray-900" : "text-gray-500"}`}>Annual</span>
                  </div>
                </div>

                {/* Gateway Selection */}
                {gateways.length > 1 && (
                   <div className="pt-2">
                    <span className="text-sm text-gray-600 block mb-2">Payment Method</span>
                    <RadioGroup
                      value={selectedGateway}
                      onValueChange={setSelectedGateway}
                      className="flex flex-col gap-2"
                    >
                      {gateways.map((gateway) => (
                        <div key={gateway} className="flex items-center space-x-2">
                          <RadioGroupItem value={gateway} id={gateway} />
                          <Label htmlFor={gateway} className="capitalize cursor-pointer text-sm">
                            {gateway}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                   </div>
                )}

                {/* Promo Code */}
                <div className="pt-2">
                   <Input
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-white"
                   />
                </div>

                <Separator />

                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Total Due Today</span>
                  <span className="text-2xl font-bold text-gray-900">${price}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-medium"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm & Proceed to Payment"
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => router.push("/dashboard/plans")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Change Plan
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-4">
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Secure SSL Payment</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>30-Day Guarantee</span>
                </div>
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
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

