"use client";

import { Languages, Globe, AlignRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function LanguageSection() {
  const t = useTranslations("extension.language");

  const features = [
    { key: "feature1", icon: Languages },
    { key: "feature2", icon: Globe },
    { key: "feature3", icon: AlignRight },
  ] as const;

  return (
    <section className="py-20 md:py-32 bg-secondary/30 dark:bg-secondary/10">
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

        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* UI Concept Mockup */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
                Extension Settings
              </p>

              {/* Toggle mockup */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">
                    {t("toggleLabel")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">EN</span>
                    <div
                      className="w-10 h-5 bg-primary rounded-full relative cursor-pointer"
                      role="switch"
                      aria-checked="true"
                      aria-label="Language toggle"
                    >
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all" />
                    </div>
                    <span className="text-xs font-medium">AR</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">
                    {t("outputLabel")}
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    العربية
                    <svg
                      className="h-3 w-3 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* RTL badge */}
              <div className="mt-4">
                <Badge className="bg-success/10 text-success hover:bg-success/15">
                  {t("rtlBadge")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Feature descriptions */}
          <div className="order-1 lg:order-2 space-y-6">
            {features.map(({ key, icon: Icon }) => (
              <div key={key} className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {t(`${key}Title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(`${key}Desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
