"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import { UserProfile } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Shield
} from "lucide-react";

interface Plan {
  id: "free" | "premium" | "enterprise" | "lifetime";
  name: string;
  icon: React.ReactNode;
  price: string;
  period: string;
  description: string;
  features: string[];
  uiCvLimit: number;
  apiAccess: boolean;
  apiLimit: number;
  popular?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    icon: <FileText className="h-6 w-6" />,
    price: "$0",
    period: "forever",
    description: "Perfect for trying out HICv",
    features: [
      "5 CV generations per month",
      "AI-powered CV tailoring",
      "Personal information masking",
      "PDF export",
      "Basic support",
    ],
    uiCvLimit: 5,
    apiAccess: false,
    apiLimit: 0,
  },
  {
    id: "premium",
    name: "Premium",
    icon: <Zap className="h-6 w-6" />,
    price: "$9.99",
    period: "per month",
    description: "For active job seekers",
    features: [
      "50 CV generations per month",
      "AI-powered CV tailoring",
      "Personal information masking",
      "PDF export",
      "Priority support",
      "Advanced AI features",
    ],
    uiCvLimit: 50,
    apiAccess: false,
    apiLimit: 0,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: <Crown className="h-6 w-6" />,
    price: "$49.99",
    period: "per month",
    description: "For professionals and businesses",
    features: [
      "Unlimited CV generations",
      "Full API access",
      "500 API calls per month",
      "AI-powered CV tailoring",
      "Personal information masking",
      "PDF export",
      "Priority support",
      "Advanced AI features",
      "Custom integrations",
    ],
    uiCvLimit: 999999,
    apiAccess: true,
    apiLimit: 500,
    badge: "Best Value",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    icon: <Infinity className="h-6 w-6" />,
    price: "$299",
    period: "one-time",
    description: "Limited time offer - Pay once, use forever",
    features: [
      "Unlimited CV generations",
      "Full API access",
      "1000 API calls per month",
      "AI-powered CV tailoring",
      "Personal information masking",
      "PDF export",
      "Priority support",
      "Advanced AI features",
      "Custom integrations",
      "Lifetime updates",
      "No recurring fees",
    ],
    uiCvLimit: 999999,
    apiAccess: true,
    apiLimit: 1000,
    badge: "Limited Time",
  },
];

export default function PlansPage() {
  const { user } = useAuth();
  const databaseService = useDatabase();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (databaseService) {
      loadProfile();
    }
  }, [databaseService]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await databaseService!.getUserProfile(user);
      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    toast({
      title: "Coming Soon",
      description: "Payment integration will be available soon. Please contact support to upgrade your plan.",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlan = profile?.plan || "free";

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
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
      {profile && (
        <div className="text-center mb-8">
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm">
            Current Plan: <span className="font-bold ml-1 capitalize">{currentPlan}</span>
          </Badge>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isPremiumOrHigher = ["premium", "enterprise", "lifetime"].includes(plan.id);

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
                  <div className={`p-3 rounded-full ${
                    plan.id === "free" ? "bg-gray-100 text-gray-600" :
                    plan.id === "premium" ? "bg-blue-100 text-blue-600" :
                    plan.id === "enterprise" ? "bg-purple-100 text-purple-600" :
                    "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-600"
                  }`}>
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/ {plan.period}</span>
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
                      : isPremiumOrHigher
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
                      {plan.id === "free" ? "Downgrade" : "Upgrade"}
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
          <CardDescription>Compare all features across different plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Free</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Premium</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Enterprise</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Lifetime</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 text-gray-700">CV Generations/Month</td>
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
                  <td className="py-3 px-4 text-gray-700">AI-Powered Tailoring</td>
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

