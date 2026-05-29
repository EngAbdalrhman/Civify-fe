"use client";

import { useMemo, useRef, useState } from "react";
import { ResumeData } from "@/features/upload-cv/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useResumeBuilder } from "../hooks/useResumeBuilder";
import { useFullscreen } from "../hooks/useFullscreen";
import { useFileUpload } from "../hooks/useFileUpload";
import { useResumeTranslation } from "../hooks/useResumeTranslation";

import { MobileViewToggle } from "./MobileViewToggle";
import { EditorSidebar } from "./EditorSidebar";
import { PreviewPanel } from "./PreviewPanel";
import { TranslateDialog } from "./TranslateDialog";
import {
  TourWelcomePrompt,
  getResumeBuilderTourSteps,
} from "@/features/onboarding";
import { SaveDialog } from "./SaveDialog";
import { AuthGateDialog } from "./AuthGateDialog";
import { AtsScoreDialog } from "./AtsScoreDialog";

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
  const [maskPII, setMaskPII] = useState(false);
  const t = useTranslations("builder");
  const tTour = useTranslations("tour");

  const builder = useResumeBuilder({
    initialData,
    resumeId,
    isGuest: isGuestProp,
  });
  const { isFullScreen, toggleFullscreen } = useFullscreen();
  const upload = useFileUpload({
    onSuccess: builder.handleResumeDataUpdate,
  });

  const translation = useResumeTranslation(
    builder.resumeData,
    builder.handleTranslateComplete
  );

  const resumeBuilderTourSteps = useMemo(
    () => getResumeBuilderTourSteps(tTour),
    [tTour],
  );

  const handleFullScreenToggle = async () => {
    try {
      await toggleFullscreen(previewContainerRef);
    } catch (err) {
      console.error("Fullscreen error:", err);
      toast.error(t("toasts.fullscreenError"));
    }
  };

  const handleReset = () => {
    setMaskPII(false);
    builder.handleReset();
  };

  return (
    <>
      <TourWelcomePrompt
        pageId="resume-builder"
        steps={resumeBuilderTourSteps}
      />
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
          onSaveClick={builder.handleSaveClick}
          onResetClick={handleReset}
          saveStatus={builder.saveStatus}
          lastSavedAt={builder.lastSavedAt}
          isUploading={upload.isUploading}
          fileInputRef={upload.fileInputRef}
          onFileUpload={upload.handleFileUpload}
          onUploadClick={upload.triggerFileUpload}
          isCalculatingScore={builder.isCalculatingScore}
          onCalculateScore={builder.handleCalculateScore}
          isGuest={builder.isGuest}
          onAuthGate={builder.handleAuthGatedAction}
          isTranslating={translation.isTranslating}
          onTranslateClick={() => translation.setShowTranslateDialog(true)}
          autoSaveEnabled={builder.autoSaveEnabled}
          maskPII={maskPII}
          onMaskPIIChange={setMaskPII}
        />

        {/* Right Area - Live Preview */}
        <PreviewPanel
          resumeData={builder.resumeData}
          isFullScreen={isFullScreen}
          onFullScreenToggle={handleFullScreenToggle}
          mobileView={builder.mobileView}
          previewContainerRef={previewContainerRef}
          maskPII={maskPII}
          onMaskPIIChange={setMaskPII}
        />
      </div>

      {/* Save Dialog (only for authenticated users) */}
      <SaveDialog
        open={builder.showSaveDialog}
        onOpenChange={builder.setShowSaveDialog}
        title={builder.resumeTitle}
        onTitleChange={builder.setResumeTitle}
        onConfirm={builder.handleSaveConfirm}
        showSaveAsNew={!builder.autoSaveEnabled && !!builder.currentResumeId}
        onSaveAsNew={builder.handleSaveAsNew}
      />

      {/* Auth Gate Dialog (for guests) */}
      <AuthGateDialog
        open={builder.showAuthGate}
        onOpenChange={builder.setShowAuthGate}
      />

      {/* Token Limit Exceeded Modal */}
      <AlertDialog
        open={upload.tokenLimitExceeded}
        onOpenChange={(open) => {
          if (!open) upload.resetTokenLimit();
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

      <AtsScoreDialog
        open={builder.showScoreDialog}
        onOpenChange={builder.setShowScoreDialog}
        score={builder.atsScore}
        isLoading={builder.isCalculatingScore}
        onApplyAtsTemplate={() => {
          builder.setResumeData({
            ...builder.resumeData,
            metadata: {
              ...builder.resumeData.metadata,
              templateId: "ats",
              skillsDisplayStyle: "tags",
              languagesDisplayStyle: "level",
              fontFamily: "Arial",
              bodyFontFamily: "Arial",
              headingFontFamily: "Georgia",
            },
          });
          builder.setShowScoreDialog(false);
        }}
      />

      {/* Translate Dialog */}
      <TranslateDialog
        open={translation.showTranslateDialog}
        onOpenChange={translation.setShowTranslateDialog}
        currentLanguage={builder.resumeData.metadata?.language || 'en'}
        onTranslate={translation.handleTranslate}
        isTranslating={translation.isTranslating}
        saveMode={translation.translateSaveMode}
        onSaveModeChange={translation.handleSaveModeChange}
      />
    </>
  );
}
