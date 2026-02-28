"use client";

import { useState, useEffect, useCallback } from "react";
import { useResumeData } from "../hooks/useResumeData";
import { useGuestResumeStorage } from "../hooks/useGuestResumeStorage";
import { LoadingSpinner } from "./LoadingSpinner";
import { ResumeBuilder } from "./ResumeBuilder";
import { CachePromptDialog } from "./CachePromptDialog";
import { emptyResumeData, ResumeData } from "@/features/upload-cv/types";
import { isAuthenticated } from "@/utils/cookies";
import { ResumeService } from "@/services/resume.service";
import { toast } from "sonner";

export function ResumeBuilderContent() {
  const { initialData, resumeId, isLoading, isGuest } = useResumeData();
  const guestStorage = useGuestResumeStorage();

  const [resolvedData, setResolvedData] = useState<ResumeData | null>(null);
  const [showCachePrompt, setShowCachePrompt] = useState(false);
  const [cachedData, setCachedData] = useState<ResumeData | null>(null);

  // Post-login sync state
  const [syncedResumeId, setSyncedResumeId] = useState<string | null>(null);

  // Detect cached guest resume on mount
  useEffect(() => {
    if (isLoading) return;

    const hasCache = guestStorage.hasGuestResume();

    if (!isGuest && hasCache) {
      // User just logged in and has cached guest data — trigger sync
      const cached = guestStorage.loadGuestResume();
      if (cached) {
        syncGuestResume(cached);
        return;
      }
    }

    if (isGuest && hasCache) {
      // Guest with cached data — show restore prompt
      const cached = guestStorage.loadGuestResume();
      if (cached) {
        setCachedData(cached);
        setShowCachePrompt(true);
        return;
      }
    }

    // No cache or authenticated with no cache — use initial data
    setResolvedData(initialData);
  }, [isLoading, isGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  const syncGuestResume = async (data: ResumeData) => {
    const title = guestStorage.getGuestResumeTitle();

    try {
      const created = await ResumeService.create(title, data);
      setSyncedResumeId(created.id);
      toast.success("Resume saved to your account!");

      // Clear localStorage after successful sync
      guestStorage.clearGuestResume();

      // Set the synced data as resolved data
      setResolvedData({ ...data, id: created.id } as ResumeData);
    } catch (error) {
      console.error("Failed to sync guest resume:", error);
      toast.error(
        "Failed to save your resume. Don't worry, it's still saved locally.",
      );
      // Fall back to the cached data
      setResolvedData(data);
    }
  };

  const handleContinueEditing = useCallback(() => {
    setShowCachePrompt(false);
    if (cachedData) {
      setResolvedData(cachedData);
    }
  }, [cachedData]);

  const handleStartFresh = useCallback(() => {
    setShowCachePrompt(false);
    guestStorage.clearGuestResume();
    setResolvedData(initialData || emptyResumeData);
  }, [initialData, guestStorage]);

  if (isLoading || (!resolvedData && !showCachePrompt)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cache Prompt Dialog for guests with previous data */}
      {showCachePrompt && (
        <CachePromptDialog
          open={showCachePrompt}
          onOpenChange={setShowCachePrompt}
          onContinue={handleContinueEditing}
          onStartFresh={handleStartFresh}
        />
      )}

      {/* Main Builder */}
      {resolvedData && (
        <ResumeBuilder
          initialData={resolvedData}
          resumeId={syncedResumeId || resumeId}
          isGuest={isGuest}
        />
      )}
    </div>
  );
}
