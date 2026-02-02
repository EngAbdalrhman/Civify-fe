"use client";

import { useResumeData } from "../hooks/useResumeData";
import { CachePromptDialog } from "./CachePromptDialog";
import { LoadingSpinner } from "./LoadingSpinner";
import { ResumeBuilder } from "./ResumeBuilder";
import { emptyResumeData } from "@/features/upload-cv/types";

export function ResumeBuilderContent() {
  const {
    initialData,
    resumeId,
    isLoading,
    isGuest,
    showCachePrompt,
    handleContinueCached,
    handleStartFresh,
    setShowCachePrompt,
  } = useResumeData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show cache prompt dialog
  if (showCachePrompt && !initialData) {
    return (
      <CachePromptDialog
        open={showCachePrompt}
        onOpenChange={setShowCachePrompt}
        onContinue={handleContinueCached}
        onStartFresh={handleStartFresh}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResumeBuilder
        initialData={initialData || emptyResumeData}
        resumeId={resumeId}
        isGuest={isGuest}
      />
    </div>
  );
}
