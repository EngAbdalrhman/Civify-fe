"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
        {/* 404 number */}
        <div className="relative mb-6">
          <span className="text-[10rem] sm:text-[12rem] font-black leading-none tracking-tighter bg-gradient-to-b from-foreground to-foreground/20 bg-clip-text text-transparent select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground/30 animate-bounce [animation-duration:3s]" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md leading-relaxed">
          {t("description")}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            asChild
            size="lg"
            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Link href="/">
              <Home className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {t("goHome")}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2 rtl:rotate-180" />
            {t("goBack")}
          </Button>
        </div>
      </div>
    </div>
  );
}
