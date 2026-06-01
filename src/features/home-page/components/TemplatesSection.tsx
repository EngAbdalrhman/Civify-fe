"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { LANDING_TEMPLATE_IDS } from "@/features/home-page/data/demoResumeByTemplate";
import { TemplatePreviewCard } from "./TemplatePreviewCard";

export function TemplatesSection() {
  const t = useTranslations("landing.templates");

  return (
    <section className="bg-gradient-to-b from-blue-50/30 to-background py-20 dark:from-gray-900 dark:to-background md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mx-auto max-w-6xl">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {LANDING_TEMPLATE_IDS.map((key) => (
                <CarouselItem
                  key={key}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="group overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10">
                    <CardContent className="p-0">
                      <div className="relative h-[300px] sm:h-[340px] overflow-hidden border-b border-border/50">
                        <TemplatePreviewCard templateId={key} />
                        <Badge className="absolute right-3 top-3 z-10 border-0 bg-green-600 shadow-md hover:bg-green-700">
                          ✓ {t("badge")}
                        </Badge>
                      </div>

                      <div className="p-6">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h3 className="text-xl font-bold">
                            {t(`items.${key}.name`)}
                          </h3>
                          <Badge variant="secondary" className="shrink-0">
                            {t(`items.${key}.category`)}
                          </Badge>
                        </div>
                        <p className="mb-4 text-sm text-muted-foreground">
                          {t(`items.${key}.description`)}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/app/resume-builder">
                            {t("openBuilder")}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {t("note.bold")}
            </span>{" "}
            {t("note.text")}
          </p>
        </div>
      </div>
    </section>
  );
}
