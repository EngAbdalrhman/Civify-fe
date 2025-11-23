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
  CardFooter,
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
  ArrowLeft,
  Star,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

interface PlanDisplay extends SubscriptionPlan {
  icon: React.ReactNode;
  popular?: boolean;
  badge?: string;
  features: string[];
  color: string;
  buttonVariant: "default" | "outline" | "secondary" | "ghost" | "link";
}

export default function PlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [plans, setPlans] = useState<PlanDisplay[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    // Auth check removed for public access
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load plans from backend
      const backendPlans = await subscriptionService.getAllPlans();
      console.log("Fetched plans:", backendPlans);

      // Transform backend plans to display format
      const displayPlans: PlanDisplay[] = backendPlans.map((plan) => {
        const name = plan.name.toLowerCase();
        let icon = <Rocket className="h-6 w-6" />;
        let color = "bg-blue-500";
        let popular = false;
        let badge = undefined;
        let buttonVariant: "default" | "outline" | "secondary" = "outline";

        if (name.includes("free") || name.includes("basic")) {
          icon = <FileText className="h-6 w-6" />;
          color = "bg-gray-500";
          buttonVariant = "outline";
        } else if (name.includes("premium") || name.includes("pro")) {
          icon = <Zap className="h-6 w-6" />;
          color = "bg-blue-600";
          popular = true;
          badge = "Most Popular";
          buttonVariant = "default";
        } else if (name.includes("enterprise") || name.includes("business")) {
          icon = <Crown className="h-6 w-6" />;
          color = "bg-purple-600";
          buttonVariant = "outline";
        } else if (name.includes("lifetime") || name.includes("unlimited")) {
          icon = <Infinity className="h-6 w-6" />;
          color = "bg-amber-500";
          badge = "Best Value";
          buttonVariant = "outline";
        }

        return {
          ...plan,
          icon,
          features: getPlanFeatures(plan),
          popular,
          badge,
          color,
          buttonVariant,
        };
      });

      // Sort plans: Free -> Premium -> Enterprise -> Lifetime
      const sortedPlans = displayPlans.sort((a, b) => {
        const order = ["free", "premium", "enterprise", "lifetime"];
        const aIndex = order.findIndex((o) => a.name.toLowerCase().includes(o));
        const bIndex = order.findIndex((o) => b.name.toLowerCase().includes(o));
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      });

      setPlans(sortedPlans);

      // Load current subscription if user is logged in
      if (user) {
        try {
          const subscription = await subscriptionService.getMyActiveSubscription();
          setCurrentSubscription(subscription);
        } catch (error) {
          // No active subscription
          setCurrentSubscription(null);
        }
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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlanId = currentSubscription?.planId;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl mb-4">
            Find the Perfect Plan for <span className="text-blue-600">You</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8">
            Simple, transparent pricing. Upgrade, downgrade, or cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 bg-white p-1 rounded-full inline-flex shadow-sm border border-gray-200">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isAnnual
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Yearly <span className="text-xs text-green-600 font-bold">(Save 20%)</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentPlanId === plan.id;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const formattedPrice = parseFloat(price).toFixed(0);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col ${
                  plan.popular ? "lg:-mt-4 lg:mb-4 z-10" : ""
                }`}
              >
                <Card
                  className={`flex-1 flex flex-col h-full transition-all duration-300 hover:shadow-xl ${
                    plan.popular
                      ? "border-2 border-blue-500 shadow-lg scale-105"
                      : "border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge
                        className={`${
                          plan.popular ? "bg-blue-600" : "bg-green-100 text-green-800"
                        } px-4 py-1 text-sm font-medium rounded-full uppercase tracking-wide shadow-sm`}
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pt-8 pb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 h-10">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center text-gray-900">
                      <span className="text-5xl font-extrabold tracking-tight">
                        ${formattedPrice}
                      </span>
                      <span className="ml-1 text-xl font-medium text-gray-500">
                        {plan.name.toLowerCase().includes("lifetime")
                          ? "one-time"
                          : isAnnual
                          ? "/year"
                          : "/mo"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="mt-6">
                      <Button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={isCurrentPlan}
                        className={`w-full py-6 text-lg font-semibold rounded-xl transition-all ${
                          plan.popular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        }`}
                      >
                        {isCurrentPlan
                          ? "Current Plan"
                          : plan.name.toLowerCase().includes("lifetime")
                          ? "Get Lifetime Access"
                          : plan.popular
                          ? "Choose Premium"
                          : `Sign Up for ${plan.name}`}
                      </Button>
                    </div>

                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <div className="flex-shrink-0">
                            <Check className="h-5 w-5 text-green-500" />
                          </div>
                          <p className="ml-3 text-sm text-gray-700">{feature}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards (Visa, Mastercard) and Fawaterak for local payments.",
            },
            {
              q: "Can I cancel my subscription at any time?",
              a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.",
            },
            {
              q: "What is the difference between CV generations and parsing?",
              a: "CV generation creates a new CV from scratch or template. Parsing extracts data from an existing CV to populate your profile.",
            },
            {
              q: "Do you offer refunds?",
              a: "We offer a 14-day money-back guarantee if you are not satisfied with our service.",
            },
          ].map((faq, i) => (
            <Card key={i} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="cursor-pointer">
                <CardTitle className="text-lg font-medium text-gray-900 flex justify-between items-center">
                  {faq.q}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-16 text-gray-500 text-sm">
        <p>Prices are in USD. Local taxes may apply.</p>
        <div className="mt-4 flex justify-center gap-4">
          <a href="#" className="hover:text-gray-900">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-900">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-gray-900">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
