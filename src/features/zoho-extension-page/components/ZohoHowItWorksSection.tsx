"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Download, KeyRound, Link as LinkIcon, Play } from "lucide-react";

export function ZohoHowItWorksSection() {
  const t = useTranslations("zoho-extension.howItWorks");

  const steps = [
    { key: "step1", icon: Download, number: "1" },
    { key: "step2", icon: KeyRound, number: "2" },
    { key: "step3", icon: LinkIcon, number: "3" },
    { key: "step4", icon: Play, number: "4" },
  ] as const;

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-secondary/30 dark:bg-secondary/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="outline" className="mb-4 px-3 py-1.5 text-sm bg-background border-primary/20">
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
                  className="relative flex items-start gap-6 md:gap-8 group"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {number}
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pb-2">
                    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 transition-all hover:shadow-md hover:border-primary/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold">
                          {t(`${key}.title`)}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
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
