import { Upload, FileText, Sparkles, Download, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const steps = [
  { step: 1, icon: Upload, key: "step1", href: "/app/upload" as const },
  { step: 2, icon: FileText, key: "step2", href: "/app/upload" as const },
  { step: 3, icon: Sparkles, key: "step3", href: "/app/upload" as const },
  { step: 4, icon: Download, key: "step4", href: "/app/upload" as const },
];

export function HowItWorksSection() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Steps Grid */}
        <div className="relative mx-auto max-w-6xl">
          {/* Connector line — centered through step circles */}
          <div
            className="pointer-events-none absolute top-7 hidden lg:block"
            style={{
              left: "calc(12.5% + 1.75rem)",
              right: "calc(12.5% + 1.75rem)",
            }}
          >
            <div className="h-0.5 w-full bg-border dark:bg-white/15" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.step}
                  className="relative flex flex-col items-center"
                >
                  {/* Step Number Circle */}
                  <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-md ring-4 ring-background">
                    {step.step}
                  </div>

                  {/* Interactive Card — entire card is clickable */}
                  <Link href={step.href} className="w-full">
                    <Card className="group relative w-full cursor-pointer overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-primary/40 dark:hover:bg-white/[0.09]">
                      <CardContent className="flex flex-col items-center p-6 text-center">
                        {/* Icon */}
                        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 dark:bg-primary/15 dark:text-primary">
                          <Icon className="h-7 w-7" />
                        </div>

                        {/* Title */}
                        <h3 className="mb-2 text-lg font-bold text-foreground">
                          {t(`steps.${step.key}.title`)}
                        </h3>

                        {/* Description */}
                        <p className="mb-5 text-sm text-muted-foreground leading-relaxed">
                          {t(`steps.${step.key}.description`)}
                        </p>

                        {/* CTA text */}
                        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                          {t(`steps.${step.key}.cta`)}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
