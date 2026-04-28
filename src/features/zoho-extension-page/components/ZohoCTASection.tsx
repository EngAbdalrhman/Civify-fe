"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight, Puzzle } from "lucide-react";
import { Link } from "@/i18n/routing";

export function ZohoCTASection() {
  const t = useTranslations("zoho-extension.cta");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-800 py-20 md:py-32 flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />

      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />

      <div className="container relative mx-auto px-4 z-10 text-center text-white">
        {/* Icon */}
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md shadow-lg border border-white/20">
          <Puzzle className="h-10 w-10 text-white" />
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
            {t("title")}
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-xl text-white/90 text-balance leading-relaxed">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-14 bg-white px-8 text-base font-semibold text-blue-700 shadow-xl hover:bg-blue-50 active:scale-95 transition-all"
            >
              <a
                href="https://marketplace.zoho.com/app/preview/recruit/civify-for-zoho-recruit"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("ctaPrimary")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group h-14 px-8 text-base font-semibold border-2 border-white/80 text-white bg-white/5 backdrop-blur-sm hover:bg-white/20 active:scale-95 transition-all"
            >
              <Link href="/app/api-keys">
                {t("ctaSecondary")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
