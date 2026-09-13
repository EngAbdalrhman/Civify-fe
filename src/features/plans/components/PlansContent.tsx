"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useRouter, Link } from "@/i18n/routing";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { Badge } from "@/components/ui/badge";
import { isAuthenticated } from "@/utils/cookies";
import { usePermissions } from "@/hooks/use-permissions";
import PayPerCvCard from "./PayPerCvCard";

interface PlansContentProps {
  hideFAQ?: boolean;
  isHeadingH1?: boolean;
}

export default function PlansContent({ 
  hideFAQ = false, 
  isHeadingH1 = true 
}: PlansContentProps = {}) {
  const t = useTranslations("plans");
  const router = useRouter();
  const { displayPlans, isLoading, error, isAnnual, setIsAnnual } = usePlans();
  const { groupName } = usePermissions();
  const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");
  const exchangeRate = 50.0;

  const renderPlanPrice = (priceEgp: number, period: string) => {
    if (priceEgp === 0) {
      return (
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-bold tracking-tight">0</span>
          <span className="ml-1 text-muted-foreground">{currency}/{period}</span>
        </div>
      );
    }

    if (currency === "USD") {
      const usdVal = (priceEgp / exchangeRate).toFixed(2);
      return (
        <div className="mt-4 flex flex-col">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold tracking-tight">${usdVal}</span>
            <span className="ml-1 text-muted-foreground text-sm">USD/{period}</span>
          </div>
          <span className="text-xs text-muted-foreground mt-0.5">(≈ {priceEgp} EGP)</span>
        </div>
      );
    }

    const usdEquiv = (priceEgp / exchangeRate).toFixed(2);
    return (
      <div className="mt-4 flex flex-col">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold tracking-tight">{priceEgp}</span>
          <span className="ml-1 text-muted-foreground text-sm">EGP/{period}</span>
        </div>
        <span className="text-xs text-muted-foreground mt-0.5">(≈ ${usdEquiv} USD)</span>
      </div>
    );
  };

  const handlePlanSelect = (ctaLink: string) => {
    // If it's a signup link (free plan), just go there
    if (ctaLink.startsWith("/signup")) {
      router.push(ctaLink);
      return;
    }

    // Read cookie at click time (state from useEffect can lag behind a valid session)
    const loggedIn = isAuthenticated() || !!groupName;

    if (!loggedIn) {
      const returnTo = encodeURIComponent(ctaLink);
      router.push(`/login?returnTo=${returnTo}`);
      return;
    }

    router.push(ctaLink);
  };

  if (isLoading) {
    return (
      <div className="py-20 px-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 px-4 text-center">
        <p className="text-destructive">{t("errorLoading")}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-20 px-4 overflow-x-hidden">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        {isHeadingH1 ? (
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
        ) : (
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
        )}
        <p className="text-xl text-muted-foreground">{t("subtitle")}</p>

        {/* Billing & Currency Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 bg-muted/50 p-1 rounded-full border">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isAnnual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("yearly")}{" "}
              <span className="text-xs text-green-600 font-bold">
                ({t("save20")})
              </span>
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center justify-center gap-1 bg-muted/50 p-1 rounded-full border text-xs">
            <button
              onClick={() => setCurrency("EGP")}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                currency === "EGP"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇪🇬 EGP
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                currency === "USD"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🌐 USD
            </button>
          </div>
        </div>
      </div>

      {displayPlans.length > 3 ? (
        <div className="mx-auto max-w-7xl px-4">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {displayPlans.map((plan) => (
                <CarouselItem
                  key={plan.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <div className="h-full p-1">
                    <div
                      key={plan.id}
                      className={`relative flex h-full flex-col rounded-2xl border p-8 shadow-sm ${
                        plan.highlighted
                          ? "scale-105 border-primary bg-primary/5 ring-1 ring-primary shadow-lg"
                          : "bg-card"
                      }`}
                    >
                      {plan.highlighted && (
                        <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                          {t("mostPopular")}
                        </Badge>
                      )}

                      <div className="mb-8">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                        {renderPlanPrice(plan.price, plan.period)}
                      </div>

                      <ul className="mb-8 flex-1 space-y-4">
                        {plan.features.map((feature, i) => (
                          <li key={i} className={`flex items-center gap-3 ${!feature.included ? 'opacity-50' : ''}`}>
                            <Check className={`h-5 w-5 flex-shrink-0 ${feature.included ? 'text-primary' : 'text-muted-foreground opacity-50'}`} />
                            <span className={`text-sm ${!feature.included ? 'line-through text-muted-foreground' : ''}`}>{feature.text}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={plan.highlighted ? "default" : "outline"}
                        size="lg"
                        onClick={() => handlePlanSelect(plan.ctaLink)}
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 lg:-left-12" />
            <CarouselNext className="-right-4 lg:-right-12" />
          </Carousel>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {displayPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
                plan.highlighted
                  ? "scale-105 border-primary bg-primary/5 ring-1 ring-primary shadow-lg"
                  : "bg-card"
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                  {t("mostPopular")}
                </Badge>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                {renderPlanPrice(plan.price, plan.period)}
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`flex items-center gap-3 ${!feature.included ? 'opacity-50' : ''}`}>
                    <Check className={`h-5 w-5 flex-shrink-0 ${feature.included ? 'text-primary' : 'text-muted-foreground opacity-50'}`} />
                    <span className={`text-sm ${!feature.included ? 'line-through text-muted-foreground' : ''}`}>{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                onClick={() => handlePlanSelect(plan.ctaLink)}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Pay-Per-CV One-Time Option */}
      <PayPerCvCard userCurrency={currency} />

      {/* FAQ Section */}
      {!hideFAQ && (
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("faqTitle")}
          </h2>
        <div className="space-y-4">
          {[
            {
              q: t("faq.q1"),
              a: t("faq.a1"),
            },
            {
              q: t("faq.q2"),
              a: t("faq.a2"),
            },
            {
              q: t("faq.q3"),
              a: t("faq.a3"),
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="text-lg font-medium mb-2">{faq.q}</h4>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Footer Info */}
      <div className="text-center mt-16 text-muted-foreground text-sm">
        <p>{t("pricesNote")}</p>
        <div className="mt-4 flex justify-center gap-4">
          <Link href="/terms" className="hover:text-foreground">
            {t("termsOfService")}
          </Link>
          <span>•</span>
          <Link href="/policy" className="hover:text-foreground">
            {t("privacyPolicy")}
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-foreground">
            {t("contactSupport")}
          </Link>
        </div>
      </div>
    </div>
  );
}
