"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { useTranslations } from "next-intl";

export function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');
  const testimonialKeys = ['t1', 't2', 't3', 't4'];

  // Map to avatars (kept static for now as images)
  const getAvatar = (key: string) => {
     switch(key) {
        case 't1': return "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah";
        case 't2': return "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael";
        case 't3': return "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily";
        case 't4': return "https://api.dicebear.com/7.x/avataaars/svg?seed=David";
        default: return "";
     }
  };
  
  const getName = (key: string) => {
      switch(key) {
        case 't1': return "Sarah Johnson";
        case 't2': return "Michael Chen";
        case 't3': return "Emily Rodriguez";
        case 't4': return "David Kim";
        default: return "";
      }
  };

  return (
    <section className="bg-gradient-to-b from-background to-purple-50/30 py-20 dark:to-gray-900 md:py-32">
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

        {/* Testimonials Carousel */}
        <div className="mx-auto max-w-6xl">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonialKeys.map((key) => {
                const name = getName(key);
                const avatar = getAvatar(key);
                const role = t(`items.${key}.role`);
                const company = t(`items.${key}.company`);
                const quote = t(`items.${key}.quote`);
                const metric = t.has(`items.${key}.metric`) ? t(`items.${key}.metric`) : null;
                
                return (
                  <CarouselItem key={key} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10">
                      <CardContent className="flex h-full flex-col p-6">
                        {/* Rating - All 5 stars */}
                        <div className="mb-4 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>

                        {/* Quote */}
                        <blockquote className="mb-6 flex-1 text-muted-foreground">
                          "{quote}"
                        </blockquote>

                        {/* Success Metric */}
                        {metric && (
                          <Badge className="mb-4 w-fit bg-green-600 hover:bg-green-700">
                            ✓ {metric}
                          </Badge>
                        )}

                        {/* Author */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={avatar} alt={name} />
                            <AvatarFallback>
                              {name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{name}</p>
                            <p className="text-sm text-muted-foreground">
                              {role} at {company}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{t('stats.users.value')}</p>
            <p className="text-sm text-muted-foreground">{t('stats.users.label')}</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{t('stats.rating.value')}</p>
            <p className="text-sm text-muted-foreground">{t('stats.rating.label')}</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{t('stats.reviews.value')}</p>
            <p className="text-sm text-muted-foreground">{t('stats.reviews.label')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
