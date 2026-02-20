"use client";

import { ArrowRight, Chrome, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function ExtensionCTASection() {
  const t = useTranslations("extension.cta");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />

      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center text-white">
          {/* Icon */}
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-8 w-8" />
          </div>

          {/* Headline */}
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {t("title")}
          </h2>

          {/* Subtext */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-14 bg-white px-8 text-base font-semibold text-blue-700 shadow-lg hover:bg-gray-100 hover:text-blue-800"
            >
              <Link href="/app/api-keys">
                {t("ctaPrimary")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group h-14 px-8 text-base font-semibold border-2 border-white text-white bg-white/10 hover:bg-white/20"
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

          {/* Reassurance */}
          <div className="mt-8">
            <p className="text-sm text-white/70">{t("reassurance")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
