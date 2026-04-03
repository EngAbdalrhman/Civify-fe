"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

export function ExtensionTutorialVideoSection() {
  const t = useTranslations("extension.tutorial");

  return (
    <section id="tutorial" className="py-20 md:py-32 bg-secondary/40 dark:bg-secondary/20 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-50 dark:opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-50 dark:opacity-30" />

      <div className="container relative mx-auto px-4 z-10">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1.5 text-sm">
            {t("badge")}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl group">
            {/* Glassmorphism gradient effect before play */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
            
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src="https://www.youtube.com/embed/bXNFut-y_ac?si=NO2kSB0xSBwBsBIH&rel=0"
              title="Civify Chrome Extension Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
