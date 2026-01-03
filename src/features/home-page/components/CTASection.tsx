"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

import { useTranslations } from "next-intl";

export function CTASection() {
  const t = useTranslations('landing.ctaSection');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 py-20 md:py-32">
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
            {t('title')}
          </h2>

          {/* Subtext */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
            {t('subtitle')}
            <br />
            <span className="font-semibold">{t('highlight')}</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-14 bg-white px-8 text-base font-semibold text-purple-600 hover:bg-white/90"
            >
              <Link href="/app/resume-builder">
                {t('cta')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/80">
            <div>
              <span className="font-semibold">{t('trust')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
