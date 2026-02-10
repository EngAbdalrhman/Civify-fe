"use client";

import { useTranslations } from "next-intl";
import {
  FileEdit,
  Sparkles,
  ArrowRight,
  Plus,
  BarChart2,
  BookOpen,
  Key,
  RotateCcw,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { ResumeCarousel } from "@/components/dashboard/ResumeCarousel";
import { useOnboarding } from "@/features/onboarding";
import { DashboardPricingPromotion } from "@/components/dashboard/DashboardPricingPromotion";

export function PersonalizedDashboard() {
  const { primaryIntent } = useOnboarding();

  if (primaryIntent === "build") {
    return <BuilderDashboard />;
  }

  if (primaryIntent === "tailor") {
    return <TailorDashboard />;
  }

  if (primaryIntent === "api") {
    return <ApiDashboard />;
  }

  return <DefaultDashboard />;
}

// ─── Change Preference Button ───────────────────────────────────────────────

function ChangePreferenceButton() {
  const t = useTranslations("onboarding.dashboard");
  const { resetOnboarding } = useOnboarding();

  return (
    <button
      onClick={resetOnboarding}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <RotateCcw className="h-3 w-3" />
      {t("changePreference")}
    </button>
  );
}

// ─── Builder Dashboard ──────────────────────────────────────────────────────

function BuilderDashboard() {
  const t = useTranslations("onboarding.dashboard.builder");

  return (
    <div className="space-y-6">
      <DashboardPricingPromotion />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ChangePreferenceButton />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Link
          href="/app/resume-builder"
          className="group flex items-center gap-4 rounded-lg border p-5 transition-colors hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm bg-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
            <FileEdit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">{t("continueCta")}</h3>
            <p className="text-xs text-muted-foreground">{t("continueDesc")}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href="/app/resume-builder"
          className="group flex items-center gap-4 rounded-lg border border-dashed p-5 transition-colors hover:border-primary/40 hover:shadow-sm bg-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">{t("createNew")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("createNewDesc")}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>

      <ResumeCarousel />
    </div>
  );
}

// ─── Tailor Dashboard ───────────────────────────────────────────────────────

function TailorDashboard() {
  const t = useTranslations("onboarding.dashboard.tailor");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ChangePreferenceButton />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Link
          href="/app/upload"
          className="group flex items-center gap-4 rounded-lg border p-5 transition-colors hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-sm bg-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">{t("tailorCta")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("tailorCtaDesc")}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href="/app/resume-builder"
          className="group flex items-center gap-4 rounded-lg border border-dashed p-5 transition-colors hover:border-primary/40 hover:shadow-sm bg-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <FileEdit className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium">{t("buildFirst")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("buildFirstDesc")}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>

      <ResumeCarousel />
    </div>
  );
}

// ─── API Dashboard ──────────────────────────────────────────────────────────

function ApiDashboard() {
  const t = useTranslations("onboarding.dashboard.api");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ChangePreferenceButton />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link
          href="/app/usage-limits"
          className="group flex flex-col items-start gap-3 rounded-lg border p-5 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm bg-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
            <Key className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium">{t("manageKeys")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("manageKeysDesc")}
            </p>
          </div>
        </Link>

        <Link
          href="/app/api-documentation"
          className="group flex flex-col items-start gap-3 rounded-lg border p-5 transition-colors hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm bg-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium">{t("viewDocs")}</h3>
            <p className="text-xs text-muted-foreground">{t("viewDocsDesc")}</p>
          </div>
        </Link>

        <Link
          href="/app/analytics"
          className="group flex flex-col items-start gap-3 rounded-lg border p-5 transition-colors hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-sm bg-card"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/40">
            <BarChart2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium">{t("usageStats")}</h3>
            <p className="text-xs text-muted-foreground">
              {t("usageStatsDesc")}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ─── Default Dashboard (fallback) ───────────────────────────────────────────

function DefaultDashboard() {
  return (
    <div className="space-y-6">
      <DashboardPricingPromotion />
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here&apos;s your workspace.
        </p>
      </div>

      <ResumeCarousel />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/app/resume-builder"
          className="group flex items-center gap-3 rounded-lg border p-4 transition-colors hover:shadow-sm bg-card"
        >
          <FileEdit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-medium">Build Resume</h3>
            <p className="text-xs text-muted-foreground">
              Create or edit your resume
            </p>
          </div>
        </Link>

        <Link
          href="/app/upload"
          className="group flex items-center gap-3 rounded-lg border p-4 transition-colors hover:shadow-sm bg-card"
        >
          <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <div>
            <h3 className="text-sm font-medium">Tailor CV</h3>
            <p className="text-xs text-muted-foreground">
              Optimize for a job posting
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
