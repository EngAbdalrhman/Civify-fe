"use client";

import { ArrowLeft, Home, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 select-none"
        aria-hidden
      >
        <div className="absolute left-1/4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/3 blur-3xl [animation-delay:1s]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="relative mb-6">
          <span className="select-none bg-gradient-to-b from-foreground to-foreground/20 bg-clip-text text-[10rem] font-black leading-none tracking-tighter text-transparent sm:text-[12rem]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 animate-bounce text-muted-foreground/30 [animation-duration:3s] sm:h-20 sm:w-20" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold sm:text-3xl">{t("title")}</h1>
        <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("description")}
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Link href="/">
              <Home className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t("goHome")}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="ltr:mr-2 rtl:ml-2 h-4 w-4 rtl:rotate-180" />
            {t("goBack")}
          </Button>
        </div>
      </div>
    </div>
  );
}
