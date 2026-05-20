"use client";

import { ArrowRight, Globe } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BetaBadge } from "@/components/BetaBadge";

import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="container relative z-10 mx-auto px-4 pt-20 pb-36 md:pt-32 md:pb-48">
        <div className="mx-auto max-w-4xl text-center">

          {/* Language Support Badges */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Badge
              variant="secondary"
              className="px-3 py-1.5 text-sm font-medium"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              English
            </Badge>
            <Badge
              variant="secondary"
              className="px-3 py-1.5 text-sm font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            >
              🇪🇬 العربية - {t("badge")}
            </Badge>
          </div>

          {/* Problem-Focused Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-red-500 dark:text-red-400">
              {t("titlePart1")}
            </span>{" "}
            {t("titlePart2")} <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("titlePart3")}
            </span>
          </h1>

          {/* Solution Subtext */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("subtitle")}
            <br />
            <span className="font-semibold text-foreground">
              {t("matchScore")} {t("interviews")}
            </span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-12 px-8 text-base font-semibold"
            >
              <Link href="/app/upload">
                {t("ctaPrimary")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
            {/* <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-400 dark:border-gray-800"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">4.9/5</span> from early testers
                </p>
              </div>
            </div> */}

            {/* <div className="h-8 w-px bg-border hidden sm:block" /> */}

            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-foreground">92%</p>
              <p className="text-sm text-muted-foreground">
                Average match score
              </p>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-foreground">3x</p>
              <p className="text-sm text-muted-foreground">More interviews</p>
            </div>

            <div className="h-8 w-px bg-border hidden sm:block" />

            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                🇪🇬
              </p>
              <p className="text-sm text-muted-foreground">Arabic OCR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-auto text-background"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
