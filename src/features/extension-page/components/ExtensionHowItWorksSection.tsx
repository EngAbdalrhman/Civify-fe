"use client";

import { KeyRound, Download, LogIn, MousePointerClick } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function ExtensionHowItWorksSection() {
  const t = useTranslations("extension.howItWorks");

  const steps = [
    { key: "step1", icon: KeyRound, number: "1" },
    { key: "step2", icon: Download, number: "2" },
    { key: "step3", icon: LogIn, number: "3" },
    { key: "step4", icon: MousePointerClick, number: "4" },
  ] as const;

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1.5 text-sm">
            {t("badge")}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Steps */}
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block rtl:left-auto rtl:right-6" />

            <div className="space-y-12">
              {steps.map(({ key, icon: Icon, number }) => (
                <div
                  key={key}
                  className="relative flex items-start gap-6 md:gap-8"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                      {number}
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pb-2">
                    <div className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold">
                          {t(`${key}.title`)}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {t(`${key}.description`)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
