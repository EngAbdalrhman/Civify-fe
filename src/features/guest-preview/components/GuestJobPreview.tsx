"use client";

import { useState } from "react";
import {
  ArrowRight,
  Loader2,
  FileText,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useGuestPreview } from "../hooks/useGuestPreview";
import { SkillsExtractPreview } from "./SkillsExtractPreview";
import { CVPreviewPartial } from "./CVPreviewPartial";
import { SignupPrompt } from "./SignupPrompt";
import { sampleResumeData, sampleJobDescription } from "../types";
import { useTranslations } from "next-intl";

interface GuestJobPreviewProps {
  useSampleData?: boolean;
}

export function GuestJobPreview({
  useSampleData = false,
}: GuestJobPreviewProps) {
  const t = useTranslations("guestPreview");
  const {
    step,
    jobDescription,
    extractedSkills,
    matchScore,
    isLoading,
    setJobDescription,
    analyzeJobDescription,
    goToSignup,
    goBack,
    reset,
  } = useGuestPreview();

  const [showSample, setShowSample] = useState(useSampleData);

  // Auto-load sample data if requested
  const handleUseSample = () => {
    setJobDescription(sampleJobDescription);
    setShowSample(true);
  };

  // Step 1: Input Job Description
  if (step === "input") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <FileText className="h-4 w-4" />
            {t("input.badge")}
          </div>
          <CardTitle className="text-2xl">{t("input.title")}</CardTitle>
          <CardDescription>{t("input.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder={t("input.placeholder")}
            className="min-h-[200px] resize-none"
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {jobDescription.length} / 50 {t("input.minChars")}
            </span>
            <button
              onClick={handleUseSample}
              className="text-primary underline-offset-4 hover:underline"
            >
              {t("input.useSample")}
            </button>
          </div>

          <Button
            onClick={analyzeJobDescription}
            disabled={jobDescription.length < 50 || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("input.analyzing")}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t("input.analyze")}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Preview Results
  if (step === "preview") {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header with Match Score */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("preview.back")}
          </Button>
          {matchScore && (
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white">
              <Sparkles className="h-4 w-4" />
              <span className="font-bold">{matchScore}%</span>
              <span className="text-sm">{t("preview.matchScore")}</span>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Skills Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("preview.skillsTitle")}
              </CardTitle>
              <CardDescription>{t("preview.skillsSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              {extractedSkills && (
                <SkillsExtractPreview skills={extractedSkills} />
              )}
            </CardContent>
          </Card>

          {/* Right: CV Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("preview.cvTitle")}</CardTitle>
              <CardDescription>{t("preview.cvSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <CVPreviewPartial
                resumeData={sampleResumeData}
                isBlurred={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* CTA to Continue */}
        <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h3 className="font-semibold">{t("preview.ctaTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("preview.ctaSubtitle")}
              </p>
            </div>
            <Button onClick={goToSignup} size="lg">
              {t("preview.ctaButton")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 3: Signup Prompt
  return (
    <div className="py-12">
      <SignupPrompt matchScore={matchScore ?? undefined} onBack={goBack} />
    </div>
  );
}
