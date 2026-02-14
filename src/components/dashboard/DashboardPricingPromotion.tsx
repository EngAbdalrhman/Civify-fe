"use client";

import { useTranslations } from "next-intl";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { Link } from "@/i18n/routing";
import {
  Sparkles,
  Check,
  Zap,
  Crown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMyActiveSubscription } from "@/features/plans/hooks/useSubscription";
import { motion } from "framer-motion";

interface DashboardPricingPromotionProps {
  variant?: "default" | "minimal";
}

export function DashboardPricingPromotion({
  variant = "minimal",
}: DashboardPricingPromotionProps) {
  const t = useTranslations("dashboard.promotion");
  const { displayPlans, isLoading } = usePlans();
  const { data: subscription, isLoading: isSubscriptionLoading } =
    useMyActiveSubscription();

  // If loading, don't show anything yet to avoid flash
  if (isLoading || isSubscriptionLoading) return null;

  // Check if user is already on a paid plan
  // If subscription exists and is ACTIVE and not the Free plan (assuming free plan has specific logic or ID)
  // For now, let's assume if they have a "planName" that isn't "Free", they are paid.
  // Or better, check if they have an active subscription with a price > 0 or specific plan ID.
  const isPaidPlan =
    subscription?.status === "ACTIVE" &&
    subscription?.planName?.toLowerCase() !== "free";

  //   if (isPaidPlan) {
  //     return null;
  //   }

  // Find the Pro or Premium plan to promote
  const promotedPlan =
    displayPlans.find(
      (p) =>
        p.name.toLowerCase().includes("pro") ||
        p.name.toLowerCase().includes("premium"),
    ) || displayPlans.find((p) => p.price > 0); // Fallback to first paid plan

  if (!promotedPlan) return null;

  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full"
      >
        <Card className="border-border/50 py-0 bg-card overflow-hidden transition-all hover:border-primary/20 hover:shadow-md group relative">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-stretch">
              {/* Left Content Section */}
              <div className="flex-1 p-3 sm:p-2 sm:px-4 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                    >
                      <Crown className="mr-1 h-3 w-3" />
                      Pro
                    </motion.div>
                    <span className="text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">
                      {t("subtitle")}
                    </span>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="w-full sm:w-auto sm:ml-auto rounded-full font-medium shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <Link href={promotedPlan.ctaLink}>
                      <span className="relative z-10 flex items-center justify-center">
                        {t("upgradeNow")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="border-border/50 bg-card overflow-hidden transition-all hover:border-primary/20 hover:shadow-md group relative">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Left Content Section */}
            <div className="flex-1 p-6 md:p-8 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  Pro
                </motion.div>
                <span className="text-sm text-muted-foreground">
                  {t("subtitle")}
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight mb-2 text-foreground">
                {t("title")}
              </h3>

              <p className="text-muted-foreground mb-6 max-w-xl">
                Take your career to the next level with advanced AI features,
                unlimited downloads, and premium templates.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  {
                    icon: Check,
                    text: t("features.unlimitedCvs"),
                    color: "text-green-600 dark:text-green-500",
                    bg: "bg-green-500/10",
                  },
                  {
                    icon: Zap,
                    text: t("features.aiTailoring"),
                    color: "text-blue-600 dark:text-blue-500",
                    bg: "bg-blue-500/10",
                  },
                  {
                    icon: Sparkles,
                    text: t("features.pdfExports"),
                    color: "text-purple-600 dark:text-purple-500",
                    bg: "bg-purple-500/10",
                  },
                  {
                    icon: ShieldCheck,
                    text: t("features.noWatermark"),
                    color: "text-orange-600 dark:text-orange-500",
                    bg: "bg-orange-500/10",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        feature.bg,
                        feature.color,
                      )}
                    >
                      <feature.icon className="h-3.5 w-3.5" />
                    </div>
                    {feature.text}
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto font-medium shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  <Link href={promotedPlan.ctaLink}>
                    <span className="relative z-10 flex items-center">
                      {t("upgradeNow")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </Link>
                </Button>
                <div className="text-sm text-muted-foreground pt-2">
                  {t("startFrom")}{" "}
                  <span className="font-bold text-foreground">
                    {promotedPlan.price} EGP
                  </span>
                  <span className="text-xs">/{promotedPlan.period}</span>
                </div>
              </div>
            </div>

            {/* Right Decorative Section (Desktop) */}
            <div className="hidden md:flex w-1/3 relative border-l border-border/50 min-h-full">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-transparent opacity-50" />

              <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center w-full h-full">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-background shadow-lg border border-border/50 relative"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent rounded-2xl opacity-50" />
                  <Crown className="h-10 w-10 text-primary relative z-10" />
                </motion.div>

                <h4 className="font-semibold text-lg">{promotedPlan.name}</h4>
                <p className="text-sm text-muted-foreground mt-2 px-2">
                  {promotedPlan.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
