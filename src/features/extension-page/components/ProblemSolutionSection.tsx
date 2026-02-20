"use client";

import {
  ClipboardCopy,
  PenLine,
  ShieldAlert,
  Zap,
  MousePointerClick,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function ProblemSolutionSection() {
  const t = useTranslations("extension.problem");

  const painPoints = [
    { key: "pain1", icon: ClipboardCopy },
    { key: "pain2", icon: PenLine },
    { key: "pain3", icon: ShieldAlert },
  ] as const;

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Problem */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-3 py-1.5 text-sm">
            {t("badge")}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Pain points grid */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {painPoints.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="relative p-6 rounded-2xl border border-destructive/20 bg-destructive/5 transition-all hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{t(`${key}Title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`${key}Desc`)}</p>
            </div>
          ))}
        </div>

        {/* Arrow transition */}
        <div className="flex justify-center mb-20">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-px w-12 bg-border" />
            <ArrowRight className="h-5 w-5 text-primary" />
            <div className="h-px w-12 bg-border" />
          </div>
        </div>

        {/* Solution */}
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge
            variant="secondary"
            className="mb-4 px-3 py-1.5 text-sm bg-success/10 text-success"
          >
            {t("solutionBadge")}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("solutionTitle")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("solutionDesc")}</p>
        </div>

        {/* Solution visual */}
        <div className="mx-auto max-w-lg">
          <div className="relative p-8 rounded-2xl border border-success/20 bg-success/5 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <MousePointerClick className="h-8 w-8" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
                <Zap className="h-3 w-3 mr-1" />
                Mask CV
              </Badge>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
                <Zap className="h-3 w-3 mr-1" />
                Tailor Resume
              </Badge>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
                <Zap className="h-3 w-3 mr-1" />
                Cover Letter
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
