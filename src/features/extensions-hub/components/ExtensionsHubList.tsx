"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Chrome, Puzzle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExtensionsHubList() {
  const t = useTranslations("extensions-hub");

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Background glowing orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none opacity-50 transition-opacity duration-1000 dark:opacity-20" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full filter blur-[100px] pointer-events-none opacity-50 dark:opacity-20" />

      <main className="container relative z-10 mx-auto px-4 py-24 sm:py-32 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mb-20">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
            {t("hero.badge")}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
            {t("hero.title")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              {t("hero.titleAccent")}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Extensions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl">
          
          {/* Card 1: Chrome Extension */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/30 dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 shadow-sm dark:from-blue-900/40 dark:to-blue-800/20 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500">
                <Chrome className="h-8 w-8" />
              </div>
              
              <Badge variant="secondary" className="w-fit mb-4">
                {t("chromeExt.badge")}
              </Badge>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t("chromeExt.title")}
              </h2>
              
              <p className="text-muted-foreground leading-relaxed mb-10 flex-grow text-lg">
                {t("chromeExt.description")}
              </p>
              
              <Button asChild size="lg" className="w-full sm:w-auto self-start group/btn font-semibold">
                <Link href="/chrome-extension">
                  {t("chromeExt.action")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Card 2: Zoho Recruit */}
          <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-primary/30 dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)]">
            <div className="absolute inset-0 bg-gradient-to-bl from-green-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-50 text-green-600 shadow-sm dark:from-green-900/40 dark:to-green-800/20 dark:text-green-400 group-hover:scale-110 transition-transform duration-500">
                <Puzzle className="h-8 w-8" />
              </div>
              
              <Badge variant="secondary" className="w-fit mb-4 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-100/80">
                {t("zohoExt.badge")}
              </Badge>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t("zohoExt.title")}
              </h2>
              
              <p className="text-muted-foreground leading-relaxed mb-10 flex-grow text-lg">
                {t("zohoExt.description")}
              </p>
              
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto self-start group/btn font-semibold border-2 hover:bg-accent/50 transition-colors">
                <Link href="/zoho-extension">
                  {t("zohoExt.action")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1 rtl:rotate-180 rtl:group-hover/btn:-translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
