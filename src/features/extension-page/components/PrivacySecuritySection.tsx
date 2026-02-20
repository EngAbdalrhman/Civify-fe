"use client";

import { ShieldCheck, Eye, Database, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function PrivacySecuritySection() {
  const t = useTranslations("extension.privacy");

  const cards = [
    { key: "card1", icon: Eye },
    { key: "card2", icon: Database },
    { key: "card3", icon: ShieldCheck },
  ] as const;

  return (
    <section id="privacy" className="py-20 md:py-32 bg-background">
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

        {/* Privacy Cards */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="rounded-2xl border border-primary/20 bg-card p-8 transition-all hover:shadow-lg"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-lg font-bold">{t(`${key}Title`)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(`${key}Desc`)}
              </p>
            </div>
          ))}
        </div>

        {/* Transparency Note */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary leading-relaxed">{t("note")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
