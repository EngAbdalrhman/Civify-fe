"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { pricingTiers } from "../data";

export function PricingSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your job search needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {pricingTiers.map((tier) => (
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
                  Most Popular
                </Badge>
              )}

              <CardHeader className="pb-8 pt-8">
                <div className="mb-2 text-center">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                </div>

                <div className="mt-4 text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/{tier.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  size="lg"
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : ""
                  }`}
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  <Link href={tier.ctaLink}>{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">No credit card needed for free plan</span>
            {" "}• Cancel anytime • 14-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}
