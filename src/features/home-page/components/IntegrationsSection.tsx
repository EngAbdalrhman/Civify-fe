"use client";

import { Linkedin, FileText, Briefcase, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { useTranslations } from "next-intl";

const iconMap = {
  Linkedin,
  FileText,
  Briefcase,
  Cloud,
};

export function IntegrationsSection() {
  const t = useTranslations('landing.integrations');
  const integrationKeys = ['linkedin', 'google-docs', 'word', 'indeed', 'glassdoor', 'google-drive'];
  
  // Icon handling needs mapping from key to component. 
  // I'll make a helper since icon names in keys match iconMap keys mostly, but let's be explicit.
  const getIcon = (key: string) => {
    switch(key) {
      case 'linkedin': return Linkedin;
      case 'google-docs': return FileText;
      case 'word': return FileText;
      case 'indeed': return Briefcase;
      case 'glassdoor': return Briefcase;
      case 'google-drive': return Cloud;
      default: return Cloud;
    }
  };

  return (
    <section className="py-20 md:py-32">
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

        {/* Integrations Grid */}
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {integrationKeys.map((key) => {
            const Icon = getIcon(key);

            return (
              <Card
                key={key}
                className="group cursor-pointer border-2 transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
              >
                <CardContent className="flex flex-col items-center p-8 text-center">
                  {/* Icon */}
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-8 w-8" />
                  </div>

                  {/* Name */}
                  <h3 className="mb-2 text-lg font-bold">{t(`items.${key}.name`)}</h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">{t(`items.${key}.description`)}</p>

                  {/* Connect button on hover */}
                  <div className="mt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-sm font-semibold text-primary">Connect →</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
