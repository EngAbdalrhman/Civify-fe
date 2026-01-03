"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useTranslations } from "next-intl";

export function TemplatesSection() {
  const t = useTranslations('landing.templates');
  const templateKeys = ['ats-clean', 'professional', 'minimalist', 'modern', 'technical', 'creative'];

  return (
    <section className="bg-gradient-to-b from-blue-50/30 to-background py-20 dark:from-gray-900 dark:to-background md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Templates Carousel */}
        <div className="mx-auto max-w-6xl">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {templateKeys.map((key) => (
                <CarouselItem key={key} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="group overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10">
                    <CardContent className="p-0">
                      {/* Template Preview */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        {/* Placeholder for template image */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-8">
                            <div className="mb-4 text-6xl font-bold text-gray-300 dark:text-gray-700">
                              CV
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 w-32 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
                              <div className="h-2 w-24 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
                              <div className="h-2 w-28 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
                            </div>
                          </div>
                        </div>

                        {/* ATS Badge - All are compliant now so show always */}
                        <Badge className="absolute right-4 top-4 bg-green-600 hover:bg-green-700">
                          ✓ {t('badge')}
                        </Badge>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>

                      {/* Template Info */}
                      <div className="p-6">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-xl font-bold">{t(`items.${key}.name`)}</h3>
                          <Badge variant="secondary">{t(`items.${key}.category`)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{t(`items.${key}.description`)}</p>
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

        {/* Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{t('note.bold')}</span>
            {" "}{t('note.text')}
          </p>
        </div>
      </div>
    </section>
  );
}
