"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ZohoFAQSection() {
  const t = useTranslations("zoho-extension.faq");

  const faqKeys = ["q1", "q2", "q3"] as const;

  return (
    <section className="py-20 md:py-32 bg-secondary/20 dark:bg-secondary/10">
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

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqKeys.map((key) => (
              <AccordionItem
                key={key}
                value={key}
                className="rounded-xl border border-border bg-card px-6 transition-all hover:bg-muted/50 data-[state=open]:bg-muted/50"
              >
                <AccordionTrigger className="text-left font-semibold text-base py-4 hover:no-underline">
                  {t(`items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-5">
                  {t(`items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
