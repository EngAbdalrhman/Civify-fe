"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { subscriptionService, SubscriptionPlan } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Check,
  Zap,
  Crown,
  Rocket,
  Infinity,
  FileText,
  Code,
  TrendingUp,
  Shield,
  ArrowLeft,
} from "lucide-react";

interface PlanDisplay extends SubscriptionPlan {
  icon: React.ReactNode;
  popular?: boolean;
  badge?: string;
  features: string[];
}

export default function PlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [plans, setPlans] = useState<PlanDisplay[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load plans from backend
      const backendPlans = await subscriptionService.getAllPlans();

      // Transform backend plans to display format
      const displayPlans: PlanDisplay[] = backendPlans.map((plan) => ({
        ...plan,
        icon: getPlanIcon(plan.name),
        features: getPlanFeatures(plan),
        popular: plan.name.toLowerCase().includes("premium"),
        badge: plan.name.toLowerCase().includes("lifetime")
          ? "Limited Time"
          : undefined,
      }));

      setPlans(displayPlans);

      // Load current subscription
      try {
        const subscription =
          await subscriptionService.getMyActiveSubscription();
        setCurrentSubscription(subscription);
      } catch (error) {
        // No active subscription
        setCurrentSubscription(null);
      }
    } catch (error: any) {
      console.error("Error loading plans:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: number) => {
    router.push(`/dashboard/checkout?planId=${planId}`);
  };

  const getPlanIcon = (planName: string): React.ReactNode => {
    const name = planName.toLowerCase();
    if (name.includes("free") || name.includes("basic")) {
      return <FileText className="h-6 w-6" />;
    } else if (name.includes("premium") || name.includes("pro")) {
      return <Zap className="h-6 w-6" />;
    } else if (name.includes("enterprise") || name.includes("business")) {
      return <Crown className="h-6 w-6" />;
    } else if (name.includes("lifetime") || name.includes("unlimited")) {
      return <Infinity className="h-6 w-6" />;
    }
    return <Rocket className="h-6 w-6" />;
  };

  const getPlanFeatures = (plan: SubscriptionPlan): string[] => {
    const features: string[] = [];

    // CV Limit
    if (plan.cvLimit === null) {
      features.push("Unlimited CV generations");
    } else {
      features.push(`${plan.cvLimit} CV generations per month`);
    }

    // API Access
    if (plan.apiLimit !== null && plan.apiLimit > 0) {
      features.push("Full API access");
      features.push(`${plan.apiLimit} API calls per month`);
    }

    // Standard features
    features.push("AI-powered CV tailoring");
    features.push("Personal information masking");
    features.push("PDF export");

    // Watermark
    if (!plan.watermark) {
      features.push("No watermark");
    }

    // Dashboard access
    if (plan.dashboard) {
      features.push("Dashboard access");
      features.push("Priority support");
      features.push("Advanced AI features");
    } else {
      features.push("Basic support");
    }

    return features;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlanId = currentSubscription?.planId;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Current Plan Badge */}
      {currentSubscription && (
        <div className="text-center mb-8">
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
            Current Plan:{" "}
            <span className="font-bold ml-1 capitalize">
              {plans.find((p) => p.id === currentPlanId)?.name || "Active"}
            </span>
          </Badge>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          const isPremiumPlan = plan.dashboard;

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-2 border-blue-500 shadow-lg"
                  : isCurrentPlan
                  ? "border-2 border-green-500"
                  : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div
                    className={`p-3 rounded-full ${
                      plan.name.toLowerCase().includes("free")
                        ? "bg-gray-100 text-gray-600"
                        : plan.name.toLowerCase().includes("premium")
                        ? "bg-blue-100 text-blue-600"
                        : plan.name.toLowerCase().includes("enterprise")
                        ? "bg-purple-100 text-purple-600"
                        : "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-600"
                    }`}
                  >
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold">
                    ${parseFloat(plan.monthlyPrice).toFixed(2)}
                  </span>
                  <span className="text-gray-600 ml-2">/ month</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full ${
                    isCurrentPlan
                      ? "bg-green-600 hover:bg-green-600"
                      : isPremiumPlan
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {isCurrentPlan ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" />
                      Select Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Compare all features across different plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Feature
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Free
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Premium
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Enterprise
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Lifetime
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-700">
                    CV Generations/Month
                  </td>
                  <td className="text-center py-3 px-4">5</td>
                  <td className="text-center py-3 px-4">50</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-700">API Access</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-600">✗</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-600">✗</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-700">API Calls/Month</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4">500</td>
                  <td className="text-center py-3 px-4">1000</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-700">
                    AI-Powered Tailoring
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-700">Priority Support</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-600">✗</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ or Additional Info */}
      <div className="text-center text-gray-600">
        <p className="mb-2">Need help choosing a plan?</p>
        <Button variant="outline">Contact Support</Button>
      </div>
    </div>
  );
}
