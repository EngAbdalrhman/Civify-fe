"use client";

import { EyeOff, Target, FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function FeatureHighlightsSection() {
  const t = useTranslations("extension.features");

  const features = [
    { key: "mask", icon: EyeOff },
    { key: "tailor", icon: Target },
    { key: "coverLetter", icon: FileText },
  ] as const;

  return (
    <section
      id="features"
      className="py-20 md:py-32 bg-secondary/30 dark:bg-secondary/10"
    >
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

        {/* Feature Cards */}
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold">{t(`${key}.title`)}</h3>
              <p className="mb-4 text-muted-foreground text-sm leading-relaxed">
                {t(`${key}.description`)}
              </p>

              {/* Best for */}
              <p className="mb-4 text-xs font-medium text-primary">
                {t(`${key}.bestFor`)}
              </p>

              {/* Example Output */}
              <div className="rounded-lg bg-muted/50 p-3 border border-border">
                <p className="text-xs font-mono text-muted-foreground">
                  {t(`${key}.example`)}
                </p>
              </div>

              {/* Hover arrow */}
              <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-sm font-medium">Learn more</span>
                <ArrowRight className="ml-1 h-4 w-4 rtl:rotate-180" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
