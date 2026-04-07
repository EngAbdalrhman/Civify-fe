"use client";

import { useCallback, useRef, useState } from "react";
import { ResumeData } from "@/features/upload-cv/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useTailorCv } from "@/features/upload-cv/hooks";
import { ensureUniqueSectionItemIds } from "@/features/resume-builder/utils/normalizeResumeIds";
import { ResumeService } from "@/services/resume.service";
import { JobApplicationService } from "@/services/job-application.service";

import { useResumeBuilder } from "../hooks/useResumeBuilder";
import { useFullscreen } from "../hooks/useFullscreen";
import { useFileUpload } from "../hooks/useFileUpload";
import {
  TailoringOptions,
  TargetJobResultState,
  TargetJobState,
} from "@/features/resume-builder/types";

import { MobileViewToggle } from "./MobileViewToggle";
import { EditorSidebar } from "./EditorSidebar";
import { PreviewPanel } from "./PreviewPanel";
import { useTourAutoStart, getResumeBuilderTourSteps } from "@/features/onboarding";
import { SaveDialog } from "./SaveDialog";
import { AuthGateDialog } from "./AuthGateDialog";
import { AtsScoreDialog } from "./AtsScoreDialog";
import { LinkedInImportDialog } from "./LinkedInImportDialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Zap, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ResumeBuilderProps {
  initialData: ResumeData;
  resumeId?: string | null;
  isGuest?: boolean;
}

export function ResumeBuilder({
  initialData,
  resumeId,
  isGuest: isGuestProp = false,
}: ResumeBuilderProps) {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("builder");
  const tTour = useTranslations("tour");
  const tr = (key: string, fallback: string) =>
    t.has(key as never) ? t(key as never) : fallback;

  const builder = useResumeBuilder({
    initialData,
    resumeId,
    isGuest: isGuestProp,
  });
  const { isFullScreen, toggleFullscreen } = useFullscreen();
  const upload = useFileUpload({
    onSuccess: builder.handleResumeDataUpdate,
  });
  const tailorCv = useTailorCv();
  const [targetJob, setTargetJob] = useState<TargetJobState>({
    jobTitle: initialData.personalInfo?.jobTitle || "",
    company: "",
    jobDescription: "",
    jobUrl: "",
    lastTailoredAt: null,
  });
  const [tailoringOptions, setTailoringOptions] = useState<TailoringOptions>({
    generateCoverLetter: true,
    includeInterviewQuestions: true,
    includeRoadmap: true,
  });
  const [targetJobError, setTargetJobError] = useState("");
  const [isScrapingJobUrl, setIsScrapingJobUrl] = useState(false);
  const [isSavingTailoredResume, setIsSavingTailoredResume] = useState(false);
  const [targetJobResult, setTargetJobResult] = useState<TargetJobResultState>({
    response: null,
    savedResumeId: null,
  });
  const [showLinkedInImportDialog, setShowLinkedInImportDialog] = useState(false);
  const [tailorTokenLimitExceeded, setTailorTokenLimitExceeded] = useState(false);

  useTourAutoStart("resume-builder", getResumeBuilderTourSteps(tTour));

  const handleFullScreenToggle = async () => {
    try {
      await toggleFullscreen(previewContainerRef);
    } catch (err) {
      console.error("Fullscreen error:", err);
      toast.error(tr("toasts.fullscreenError", "Fullscreen not supported"));
    }
  };

  const handleTargetJobChange = useCallback(
    (updates: Partial<TargetJobState>) => {
      setTargetJob((prev) => ({ ...prev, ...updates }));
      if (Object.prototype.hasOwnProperty.call(updates, "jobDescription")) {
        setTargetJobError("");
      }
    },
    [],
  );

  const handleTailoringOptionsChange = useCallback(
    (updates: Partial<TailoringOptions>) => {
      setTailoringOptions((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleScrapeJobUrl = useCallback(async () => {
    if (!targetJob.jobUrl.trim()) return;

    try {
      new URL(targetJob.jobUrl);
    } catch {
      toast.error(tr("targetJob.errors.invalidUrl", "Please enter a valid job URL"));
      return;
    }

    setIsScrapingJobUrl(true);
    try {
      const content = await JobApplicationService.scrapeJd(targetJob.jobUrl);
      if (!content) {
        toast.error(
          tr("targetJob.errors.scrapeEmpty", "We couldn't extract a description from that URL"),
        );
        return;
      }

      setTargetJob((prev) => ({ ...prev, jobDescription: content }));
      setTargetJobError("");
      toast.success(tr("targetJob.toasts.jdImported", "Job description imported"));
    } catch (error) {
      console.error("JD scrape failed:", error);
      toast.error(tr("targetJob.errors.scrapeFailed", "Failed to import the job description"));
    } finally {
      setIsScrapingJobUrl(false);
    }
  }, [targetJob.jobUrl, tr]);

  const handleGenerateTailoredResume = useCallback(() => {
    if (builder.isGuest) {
      builder.handleAuthGatedAction();
      return;
    }

    const trimmedDescription = targetJob.jobDescription.trim();
    if (!trimmedDescription) {
      setTargetJobError(
        tr("targetJob.errors.descriptionRequired", "Job description is required"),
      );
      return;
    }
    if (trimmedDescription.length < 50) {
      setTargetJobError(
        tr(
          "targetJob.errors.descriptionMinLength",
          "Job description must be at least 50 characters",
        ),
      );
      return;
    }

    setTargetJobError("");
    tailorCv.mutate(
      {
        resumeData: builder.resumeData,
        jobDescription: trimmedDescription,
        jobTitle: targetJob.jobTitle || undefined,
        companyName: targetJob.company || undefined,
        generateCoverLetter: tailoringOptions.generateCoverLetter,
        includeInterviewQuestions: tailoringOptions.includeInterviewQuestions,
        includeRoadmap: tailoringOptions.includeRoadmap,
      },
      {
        onSuccess: (response) => {
          setTargetJob((prev) => ({
            ...prev,
            lastTailoredAt: new Date().toISOString(),
          }));
          setTargetJobResult({
            response,
            savedResumeId: null,
          });
          toast.success(tr("targetJob.toasts.tailorSuccess", "Tailored resume generated"));
        },
        onError: (error: any) => {
          if (
            error?.errorCode === "TOKEN_LIMIT_EXCEEDED" ||
            error?.message === "TOKEN_LIMIT_EXCEEDED"
          ) {
            setTailorTokenLimitExceeded(true);
          }
        },
      },
    );
  }, [builder, tailorCv, tailoringOptions, targetJob, tr]);

  const handleApplyTailoredResume = useCallback(() => {
    if (!targetJobResult.response?.tailoredCv) return;

    builder.handleResumeDataUpdate(
      ensureUniqueSectionItemIds(targetJobResult.response.tailoredCv) as ResumeData,
    );
    toast.success(tr("targetJob.toasts.applySuccess", "Tailored content applied to the builder"));
  }, [builder, targetJobResult.response, tr]);

  const handleSaveTailoredDuplicate = useCallback(async () => {
    if (!targetJobResult.response?.tailoredCv) return;

    if (builder.isGuest) {
      builder.handleAuthGatedAction();
      return;
    }

    setIsSavingTailoredResume(true);
    try {
      const normalized = ensureUniqueSectionItemIds(
        targetJobResult.response.tailoredCv,
      ) as ResumeData;
      const baseName = normalized.personalInfo.fullName || "Resume";
      const roleSuffix =
        targetJob.jobTitle || tr("targetJob.defaultTailoredTitle", "Tailored Resume");
      const title = `${baseName} - ${roleSuffix}`;
      const saved = await ResumeService.create(title, normalized);
      setTargetJobResult((prev) => ({ ...prev, savedResumeId: saved.id }));
      toast.success(
        tr(
          "targetJob.toasts.saveDuplicateSuccess",
          "Tailored resume saved as a duplicate",
        ),
      );
    } catch (error) {
      console.error("Failed to save tailored duplicate:", error);
      toast.error(
        tr(
          "targetJob.toasts.saveDuplicateError",
          "Failed to save the tailored duplicate",
        ),
      );
    } finally {
      setIsSavingTailoredResume(false);
    }
  }, [builder, targetJob.jobTitle, targetJobResult.response, tr]);

  const handleCopyCoverLetter = useCallback(() => {
    const content = targetJobResult.response?.coverLetter;
    if (!content) return;
    navigator.clipboard.writeText(content);
    toast.success(
      tr("targetJob.toasts.coverLetterCopied", "Cover letter copied to clipboard"),
    );
  }, [targetJobResult.response?.coverLetter, tr]);

  const handleDownloadCoverLetter = useCallback(() => {
    const content = targetJobResult.response?.coverLetter;
    if (!content) return;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(
      builder.resumeData.personalInfo.fullName || "cover-letter"
    )
      .replace(/\s+/g, "_")
      .toLowerCase()}_cover_letter.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [builder.resumeData.personalInfo.fullName, targetJobResult.response?.coverLetter]);

  return (
    <>
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background relative">
        {/* Mobile View Toggle */}
        <MobileViewToggle
          mobileView={builder.mobileView}
          onToggle={() =>
            builder.setMobileView(
              builder.mobileView === "editor" ? "preview" : "editor",
            )
          }
        />

        {/* Left Sidebar - Editor Configuration */}
        <EditorSidebar
          resumeData={builder.resumeData}
          onResumeDataChange={builder.setResumeData}
          activeTab={builder.activeTab}
          onActiveTabChange={builder.setActiveTab}
          mobileView={builder.mobileView}
          isSaving={builder.isSaving}
          saveStatus={builder.saveStatus}
          lastSavedAt={builder.lastSavedAt}
          onSaveClick={builder.handleSaveClick}
          onResetClick={builder.handleReset}
          isUploading={upload.isUploading}
          fileInputRef={upload.fileInputRef}
          onFileUpload={upload.handleFileUpload}
          onUploadClick={upload.triggerFileUpload}
          onLinkedInImportClick={() => setShowLinkedInImportDialog(true)}
          isCalculatingScore={builder.isCalculatingScore}
          onCalculateScore={builder.handleCalculateScore}
          targetJob={targetJob}
          tailoringOptions={tailoringOptions}
          targetJobResult={targetJobResult}
          targetJobError={targetJobError}
          isScrapingJobUrl={isScrapingJobUrl}
          isTailoring={tailorCv.isPending}
          isSavingTailoredResume={isSavingTailoredResume}
          onTargetJobChange={handleTargetJobChange}
          onTailoringOptionsChange={handleTailoringOptionsChange}
          onScrapeJobUrl={handleScrapeJobUrl}
          onGenerateTailoredResume={handleGenerateTailoredResume}
          onApplyTailoredResume={handleApplyTailoredResume}
          onSaveTailoredDuplicate={handleSaveTailoredDuplicate}
          onCopyCoverLetter={handleCopyCoverLetter}
          onDownloadCoverLetter={handleDownloadCoverLetter}
          isGuest={builder.isGuest}
          onAuthGate={builder.handleAuthGatedAction}
        />

        {/* Right Area - Live Preview */}
        <PreviewPanel
          resumeData={builder.resumeData}
          isFullScreen={isFullScreen}
          onFullScreenToggle={handleFullScreenToggle}
          mobileView={builder.mobileView}
          previewContainerRef={previewContainerRef}
        />
      </div>

      {/* Save Dialog (only for authenticated users) */}
      <SaveDialog
        open={builder.showSaveDialog}
        onOpenChange={builder.setShowSaveDialog}
        title={builder.resumeTitle}
        onTitleChange={builder.setResumeTitle}
        onConfirm={builder.handleSaveConfirm}
      />

      {/* Auth Gate Dialog (for guests) */}
      <AuthGateDialog
        open={builder.showAuthGate}
        onOpenChange={builder.setShowAuthGate}
      />

      <AtsScoreDialog
        open={builder.showScoreDialog}
        onOpenChange={builder.setShowScoreDialog}
        score={builder.atsScore}
        isLoading={builder.isCalculatingScore}
      />

      <LinkedInImportDialog
        open={showLinkedInImportDialog}
        onOpenChange={setShowLinkedInImportDialog}
        currentResume={builder.resumeData}
        onImport={builder.handleResumeDataUpdate}
      />

      {/* Token Limit Exceeded Modal */}
      <AlertDialog
        open={upload.tokenLimitExceeded || tailorTokenLimitExceeded}
        onOpenChange={(open) => {
          if (!open) {
            upload.resetTokenLimit();
            setTailorTokenLimitExceeded(false);
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              {t("tokenLimit.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("tokenLimit.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="sm:mr-auto sm:rtl:ml-auto sm:rtl:mr-0">
              {t("tokenLimit.cancel")}
            </AlertDialogCancel>
            <Link href="/plans" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full gap-2">
                <CreditCard className="h-4 w-4" />
                {t("tokenLimit.buyTokens")}
              </Button>
            </Link>
            <Link href="/plans" className="w-full sm:w-auto">
              <AlertDialogAction className="w-full gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 border-0">
                <Zap className="h-4 w-4 fill-current" />
                {t("tokenLimit.upgrade")}
              </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
