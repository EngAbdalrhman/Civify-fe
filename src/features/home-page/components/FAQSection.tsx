import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useTranslations } from "next-intl";

export function FAQSection() {
  const t = useTranslations("landing.faq");
  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

  return (
    <section className="bg-gradient-to-b from-background to-blue-50/30 py-20 dark:to-gray-900 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqKeys.map((key) => (
              <AccordionItem key={key} value={key} className="border-b-2">
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                  {t(`items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t(`items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            {t("stillQuestions")}{" "}
            <a
              href="/contact"
              className="font-semibold text-primary hover:underline"
            >
              {t("contactSupportTeam")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
