"use client";

import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function ExtensionTestimonialsSection() {
  const t = useTranslations("extension.testimonials");

  const testimonials = ["t1", "t2", "t3"] as const;

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-blue-50/30 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1.5 text-sm">
            {t("badge")}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Testimonial Cards */}
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((key) => (
            <div
              key={key}
              className="relative rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg"
            >
              {/* Quote icon */}
              <div className="mb-4">
                <Quote className="h-8 w-8 text-primary/20" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="mb-6 text-foreground leading-relaxed">
                &ldquo;{t(`${key}.quote`)}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                  {t(`${key}.name`).charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t(`${key}.name`)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`${key}.role`)} · {t(`${key}.company`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
