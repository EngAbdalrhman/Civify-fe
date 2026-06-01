"use client";

import {
  Mail,
  MessageSquare,
  Map,
  Languages,
  Linkedin,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const OUTPUT_KEYS = ["coverLetter", "interview", "roadmap"] as const;
const OUTPUT_ICONS = {
  coverLetter: Mail,
  interview: MessageSquare,
  roadmap: Map,
};

const WORKFLOW_KEYS = ["linkedin", "translate", "jobMatches"] as const;
const WORKFLOW_ICONS = {
  linkedin: Linkedin,
  translate: Languages,
  jobMatches: Briefcase,
};

const WORKFLOW_HREFS: Record<
  (typeof WORKFLOW_KEYS)[number],
  "/chrome-extension" | "/app/resume-builder" | "/app/job-matches"
> = {
  linkedin: "/chrome-extension",
  translate: "/app/resume-builder",
  jobMatches: "/app/job-matches",
};

function OutputPreview({ outputKey }: { outputKey: (typeof OUTPUT_KEYS)[number] }) {
  const t = useTranslations(`landing.applicationOutputs.outputs.${outputKey}`);

  if (outputKey === "coverLetter") {
    return (
      <div className="rounded-md border bg-muted/40 p-3 text-start text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">{t("previewLine1")}</p>
        <p className="line-clamp-2">{t("previewLine2")}</p>
      </div>
    );
  }

  if (outputKey === "interview") {
    return (
      <ul className="rounded-md border bg-muted/40 p-3 text-start text-xs text-muted-foreground space-y-2 list-disc ps-4">
        <li>{t("previewQ1")}</li>
        <li>{t("previewQ2")}</li>
      </ul>
    );
  }

  return (
    <ol className="rounded-md border bg-muted/40 p-3 text-start text-xs text-muted-foreground space-y-1.5 list-decimal ps-4">
      <li>{t("previewStep1")}</li>
      <li>{t("previewStep2")}</li>
    </ol>
  );
}

export function ApplicationOutputsSection() {
  const t = useTranslations("landing.applicationOutputs");

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mx-auto mb-16 grid max-w-6xl gap-6 md:grid-cols-3">
          {OUTPUT_KEYS.map((key) => {
            const Icon = OUTPUT_ICONS[key];
            return (
              <Card
                key={key}
                className="border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold">
                      {t(`outputs.${key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(`outputs.${key}.description`)}
                    </p>
                  </div>
                  <OutputPreview outputKey={key} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-16 flex justify-center">
          <Button size="lg" asChild>
            <Link href="/app/upload">
              {t("tryTailor")}
              <ArrowRight className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mx-auto max-w-5xl">
          <h3 className="mb-3 text-center text-xl font-semibold">
            {t("workflowTitle")}
          </h3>
          <p className="mb-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            {t("workflowNote")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORKFLOW_KEYS.map((key) => {
              const Icon = WORKFLOW_ICONS[key];
              const href = WORKFLOW_HREFS[key];
              return (
                <Card
                  key={key}
                  className="border transition-colors hover:border-primary/40"
                >
                  <CardContent className="flex flex-col gap-3 p-5 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-semibold">{t(`workflow.${key}.title`)}</h4>
                    <p className="text-xs text-muted-foreground">
                      {t(`workflow.${key}.description`)}
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0" asChild>
                      <Link href={href}>{t("learnMore")}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
