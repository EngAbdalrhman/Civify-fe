"use client";

import { EyeOff, Target, FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function FeatureHighlightsSection() {
  const t = useTranslations("extension.features");

  const features = [
    {
      key: "mask",
      icon: EyeOff,
      number: "01",
      tags: ["Privacy", "Security", "One-Click"],
    },
    {
      key: "tailor",
      icon: Target,
      number: "02",
      tags: ["AI-Powered", "ATS-Ready", "Smart"],
    },
    {
      key: "coverLetter",
      icon: FileText,
      number: "03",
      tags: ["Personalized", "Professional", "Fast"],
    },
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
          {features.map(({ key, icon: Icon, number, tags }, index) => (
            <div
              key={key}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient accent bar */}
              <div className="h-1 w-full bg-linear-to-r from-primary/60 via-primary to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="p-8">
                {/* Number + Icon row */}
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary ring-4 ring-primary/5 group-hover:ring-primary/10 transition-all duration-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20 group-hover:text-primary/20 transition-colors duration-300 select-none">
                    {number}
                  </span>
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

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Example Output */}
                <div className="rounded-lg bg-muted/50 p-3 border border-border mb-5">
                  <p className="text-xs font-mono text-muted-foreground">
                    {t(`${key}.example`)}
                  </p>
                </div>

                {/* Learn more CTA */}
                <a
                  href="#how-it-works"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  <span>{t("learnMore")}</span>
                  <ArrowRight className="ml-1.5 h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
