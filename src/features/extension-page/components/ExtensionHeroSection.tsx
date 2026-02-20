"use client";

import { ArrowRight, Chrome, Globe } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function ExtensionHeroSection() {
  const t = useTranslations("extension.hero");

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-secondary/40 dark:bg-secondary/20"
    >
      {/* Subtle background blobs using primary color */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl" />

      <div className="container relative mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium gap-2"
            >
              <Chrome className="w-4 h-4" />
              {t("badge")}
            </Badge>
          </div>

          {/* Language Support Badge */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Badge
              variant="secondary"
              className="px-3 py-1.5 text-sm font-medium"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              {t("trustLine")}
            </Badge>
          </div>

          {/* H1 Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t("title")}
            <br />
            <span className="text-primary">{t("titleAccent")}</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-12 px-8 text-base font-semibold"
            >
              <Link href="/app/api-keys">
                {t("ctaPrimary")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group h-12 px-8 text-base font-semibold"
            >
              <a
                href="https://chromewebstore.google.com/detail/civify-resume-tailor/mbpibekhfbjpgbjddbmieniomejeojhl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Chrome className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0" />
                {t("ctaSecondary")}
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
            <div className="text-center sm:text-left rtl:sm:text-right">
              <p className="text-2xl font-bold text-foreground">
                {t("statUsers")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("statUsersLabel")}
              </p>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            <div className="text-center sm:text-left rtl:sm:text-right">
              <p className="text-2xl font-bold text-foreground">
                {t("statTime")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("statTimeLabel")}
              </p>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            <div className="text-center sm:text-left rtl:sm:text-right">
              <p className="text-2xl font-bold text-primary">
                {t("statLanguages")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("statLanguagesLabel")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
