"use client";

import { useRef } from "react";
import { ResumeData } from "@/features/upload-cv/types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useResumeBuilder } from "../hooks/useResumeBuilder";
import { useFullscreen } from "../hooks/useFullscreen";
import { useFileUpload } from "../hooks/useFileUpload";

import { MobileViewToggle } from "./MobileViewToggle";
import { EditorSidebar } from "./EditorSidebar";
import { PreviewPanel } from "./PreviewPanel";
import { SaveDialog } from "./SaveDialog";
import { AtsScoreDialog } from "./AtsScoreDialog";

interface ResumeBuilderProps {
  initialData: ResumeData;
  resumeId?: string | null;
  isGuest: boolean;
}

export function ResumeBuilder({
  initialData,
  resumeId,
  isGuest,
}: ResumeBuilderProps) {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("builder");

  const builder = useResumeBuilder({ initialData, resumeId, isGuest });
  const { isFullScreen, toggleFullscreen } = useFullscreen();
  const upload = useFileUpload({
    isGuest,
    onSuccess: builder.handleResumeDataUpdate,
  });

  const handleFullScreenToggle = async () => {
    try {
      await toggleFullscreen(previewContainerRef);
    } catch (err) {
      console.error("Fullscreen error:", err);
      toast.error(t("toasts.fullscreenError"));
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background relative">
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
          onResetClick={builder.handleReset}
          isUploading={upload.isUploading}
          fileInputRef={upload.fileInputRef}
          onFileUpload={upload.handleFileUpload}
          onUploadClick={upload.triggerFileUpload}
          isCalculatingScore={builder.isCalculatingScore}
          onCalculateScore={builder.handleCalculateScore}
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

      {/* Save Dialog */}
      <SaveDialog
        open={builder.showSaveDialog}
        onOpenChange={builder.setShowSaveDialog}
        title={builder.resumeTitle}
        onTitleChange={builder.setResumeTitle}
        onConfirm={builder.handleSaveConfirm}
      />

      {/* ATS Score Dialog */}
      <AtsScoreDialog
        open={builder.showScoreDialog}
        onOpenChange={builder.setShowScoreDialog}
        score={builder.atsScore}
        isLoading={builder.isCalculatingScore}
      />
    </>
  );
}
