"use client";

import { useResumeData } from "../hooks/useResumeData";
import { CachePromptDialog } from "./CachePromptDialog";
import { LoadingSpinner } from "./LoadingSpinner";
import { ResumeBuilderWrapper } from "./ResumeBuilderWrapper";

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
    <ResumeBuilderWrapper
      initialData={initialData}
      resumeId={resumeId}
      isGuest={isGuest}
    />
  );
}
