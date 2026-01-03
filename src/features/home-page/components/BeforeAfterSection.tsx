"use client";

import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useTranslations } from "next-intl";

export function BeforeAfterSection() {
  const t = useTranslations('landing.beforeAfter');
  const beforeKeys = ['item1', 'item2', 'item3'];
  const issuesKeys = ['item1', 'item2', 'item3', 'item4'];
  const afterKeys = ['item1', 'item2', 'item3'];
  const improvementsKeys = ['item1', 'item2', 'item3', 'item4'];

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            {t('badge')}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Comparison */}
        <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-12">
          {/* Before */}
          <Card className="border-2 border-slate-200 dark:border-slate-800">
            <CardContent className="p-8">
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                  {t('before.badge')}
                </Badge>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t('before.score')}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 p-6 dark:bg-slate-900/50">
                <ul className="space-y-3 text-muted-foreground">
                  {beforeKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      <span>{t(`before.items.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t('before.issuesTitle')}
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {issuesKeys.map((key) => (
                    <li key={key}>• {t(`before.issues.${key}`)}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-purple-500/50">
              <ArrowRight className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* After */}
          <Card className="border-2 border-purple-200 dark:border-purple-900">
            <CardContent className="p-8">
              <div className="mb-4 flex items-center justify-between">
                <Badge className="bg-purple-600 text-sm hover:bg-purple-700">
                  {t('after.badge')}
                </Badge>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {t('after.score')}
                </span>
              </div>

              <div className="rounded-lg bg-purple-50 p-6 dark:bg-purple-950/20">
                <ul className="space-y-3 text-foreground">
                  {afterKeys.map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-600" />
                      <span>
                        {t.rich(`after.items.${key}`, {
                          strong1: (chunks) => <strong>{chunks}</strong>,
                          strong2: (chunks) => <strong>{chunks}</strong>,
                          strong3: (chunks) => <strong>{chunks}</strong>,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {t('after.improvementsTitle')}
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {improvementsKeys.map((key) => (
                    <li key={key}>✓ {t(`after.improvements.${key}`)}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
