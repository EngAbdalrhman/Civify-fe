"use client";

import { Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useRouter } from "@/i18n/routing";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { isAuthenticated } from "@/utils/cookies";

export function PricingSection() {
  const t = useTranslations("landing.pricing");
  const router = useRouter();
  const { displayPlans, isLoading, error, isAnnual, setIsAnnual } = usePlans();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    setIsUserAuthenticated(isAuthenticated());
  }, []);

  const handlePlanSelect = (ctaLink: string) => {
    // If it's a signup link (free plan), just go there
    if (ctaLink.startsWith("/signup")) {
      router.push(ctaLink);
      return;
    }

    if (!isUserAuthenticated) {
      // Redirect to signup with callback
      // Construct callback URL: /checkout?planId=X
      const callbackUrl = encodeURIComponent(ctaLink);
      router.push(`/signup?callbackUrl=${callbackUrl}`);
    } else {
      // Proceed to checkout
      router.push(ctaLink);
    }
  };

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">{t("subtitle")}</p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 bg-muted/50 p-1 rounded-full inline-flex border">
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
                ({t("save")})
              </span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-destructive text-lg font-medium mb-2">
              {t("errorLoading")}
            </p>
            <p className="text-muted-foreground text-sm">{t("errorContact")}</p>
          </div>
        )}

        {/* Pricing Cards */}
        {!isLoading && !error && displayPlans.length > 0 && (
          <>
            {displayPlans.length > 3 ? (
              <div className="mx-auto max-w-6xl px-4">
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {displayPlans.map((tier) => (
                      <CarouselItem
                        key={tier.id}
                        className="pl-4 md:basis-1/2 lg:basis-1/3"
                      >
                        <div className="h-full p-1">
                          <Card
                            className={`relative flex h-full flex-col border-2 transition-all duration-300 ${
                              tier.highlighted
                                ? "border-primary shadow-2xl shadow-primary/20"
                                : "hover:border-primary/50 hover:shadow-xl"
                            }`}
                          >
                            {tier.highlighted && (
                              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
                                {t("mostPopular")}
                              </Badge>
                            )}

                            <CardHeader className="pb-8 pt-8">
                              <div className="mb-2 text-center">
                                <h3 className="text-2xl font-bold">
                                  {tier.name}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {tier.description}
                                </p>
                              </div>

                              <div className="mt-4 text-center">
                                <div className="flex items-baseline justify-center gap-1">
                                  <span className="text-5xl font-bold">
                                    {tier.price}
                                  </span>
                                  <span className="text-xl font-bold text-muted-foreground">
                                    EGP
                                  </span>
                                  <span className="text-muted-foreground">
                                    /{tier.period}
                                  </span>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="flex flex-1 flex-col">
                              {/* Features */}
                              <ul className="mb-8 flex-1 space-y-3">
                                {tier.features.map((feature, index) => (
                                  <li
                                    key={index}
                                    className={`flex items-start gap-3 ${!feature.included ? 'opacity-50' : ''}`}
                                  >
                                    <Check className={`h-5 w-5 flex-shrink-0 ${feature.included ? 'text-green-600' : 'text-muted-foreground opacity-50'}`} />
                                    <span className={`text-sm ${!feature.included ? 'line-through text-muted-foreground' : ''}`}>{feature.text}</span>
                                  </li>
                                ))}
                              </ul>

                              {/* CTA */}
                              <Button
                                size="lg"
                                className={`w-full ${
                                  tier.highlighted
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    : ""
                                }`}
                                variant={
                                  tier.highlighted ? "default" : "outline"
                                }
                                onClick={() => handlePlanSelect(tier.ctaLink)}
                              >
                                {tier.cta}
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-4 lg:-left-12" />
                  <CarouselNext className="-right-4 lg:-right-12" />
                </Carousel>
              </div>
            ) : (
              <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {displayPlans.map((tier) => (
                  <Card
                    key={tier.id}
                    className={`relative flex flex-col border-2 transition-all duration-300 ${
                      tier.highlighted
                        ? "border-primary shadow-2xl shadow-primary/20 scale-105"
                        : "hover:border-primary/50 hover:shadow-xl"
                    }`}
                  >
                    {tier.highlighted && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
                        {t("mostPopular")}
                      </Badge>
                    )}

                    <CardHeader className="pb-8 pt-8">
                      <div className="mb-2 text-center">
                        <h3 className="text-2xl font-bold">{tier.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {tier.description}
                        </p>
                      </div>

                      <div className="mt-4 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-bold">{tier.price}</span>
                          <span className="text-xl font-bold text-muted-foreground">
                            EGP
                          </span>
                          <span className="text-muted-foreground">
                            /{tier.period}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col">
                      {/* Features */}
                      <ul className="mb-8 flex-1 space-y-3">
                        {tier.features.map((feature, index) => (
                          <li key={index} className={`flex items-start gap-3 ${!feature.included ? 'opacity-50' : ''}`}>
                            <Check className={`h-5 w-5 flex-shrink-0 ${feature.included ? 'text-green-600' : 'text-muted-foreground opacity-50'}`} />
                            <span className={`text-sm ${!feature.included ? 'line-through text-muted-foreground' : ''}`}>{feature.text}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Button
                        size="lg"
                        className={`w-full ${
                          tier.highlighted
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : ""
                        }`}
                        variant={tier.highlighted ? "default" : "outline"}
                        onClick={() => handlePlanSelect(tier.ctaLink)}
                      >
                        {tier.cta}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {t("noCreditCard")}
            </span>{" "}
            • {t("cancelAnytime")}
          </p>
        </div>
      </div>
    </section>
  );
}
