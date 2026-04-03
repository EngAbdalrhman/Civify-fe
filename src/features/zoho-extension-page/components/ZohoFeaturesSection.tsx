"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, UserCheck } from "lucide-react";

export function ZohoFeaturesSection() {
  const t = useTranslations("zoho-extension.features");

  const features = [
    {
      key: "parse",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      key: "summarize",
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      key: "assess",
      icon: UserCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ] as const;

  return (
    <section className="py-20 md:py-32 bg-background border-t border-border">
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
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {features.map(({ key, icon: Icon, color, bgColor }) => (
            <div
              key={key}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/20"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              <div className="relative z-10">
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl \${bgColor} \${color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-4 text-xl font-bold">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
