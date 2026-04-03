"use client";

import { useState, useCallback } from "react";
import { ArrowRight, Puzzle, Globe, Play } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function ZohoHeroSection() {
  const t = useTranslations("zoho-extension.hero");
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const openVideo = useCallback(() => setIsVideoOpen(true), []);
  const closeVideo = useCallback(() => setIsVideoOpen(false), []);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-secondary/40 dark:bg-secondary/20"
    >
      {/* Subtle background blobs using primary color */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium gap-2 shadow-sm"
            >
              <Puzzle className="w-4 h-4 text-blue-500" />
              {t("badge")}
            </Badge>
          </div>

          {/* Language Support Badge */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Badge
              variant="secondary"
              className="px-3 py-1.5 text-sm font-medium text-foreground/80"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5 text-green-600" />
              {t("trustLine")}
            </Badge>
          </div>

          {/* H1 Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
            {t("title")}
            <br />
            <span className="text-primary">{t("titleAccent")}</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl text-balance">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-14 px-8 text-base font-semibold shadow-md active:scale-95 transition-all"
            >
              <a
                href="https://marketplace.zoho.com/app/preview/recruit/civify"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("ctaPrimary")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group h-14 px-8 text-base font-semibold active:scale-95 transition-all bg-background/50 backdrop-blur-sm hover:bg-accent/80"
            >
              <Link href="/app/api-keys">
                {t("ctaSecondary")}
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
            <div className="text-center sm:text-left rtl:sm:text-right">
              <p className="text-2xl font-bold text-foreground">
                {t("statUsers")}
              </p>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">
                {t("statUsersLabel")}
              </p>
            </div>

            <div className="h-10 w-px bg-border hidden sm:block" />

            <div className="text-center sm:text-left rtl:sm:text-right">
              <p className="text-2xl font-bold text-foreground">
                {t("statTime")}
              </p>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">
                {t("statTimeLabel")}
              </p>
            </div>

            <div className="h-10 w-px bg-border hidden sm:block" />

            <div className="text-center sm:text-left rtl:sm:text-right">
              <p className="text-2xl font-bold text-primary">
                {t("statLanguages")}
              </p>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">
                {t("statLanguagesLabel")}
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
