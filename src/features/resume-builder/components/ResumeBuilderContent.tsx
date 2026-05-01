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
import { ensureUniqueSectionItemIds } from "@/features/resume-builder/utils/normalizeResumeIds";

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
      // Only sync guest data when user has NO existing resume open.
      // If resumeId exists, the user is editing a saved resume — skip sync
      // to avoid creating a duplicate on every page refresh.
      if (resumeId) {
        // Stale guest cache from a previous session — just clear it
        guestStorage.clearGuestResume();
      } else {
        const cached = guestStorage.loadGuestResume();
        if (cached) {
          syncGuestResume(cached);
          return;
        }
      }
    }

    if (isGuest && hasCache) {
      // Guest with cached data — show restore prompt
      const cached = guestStorage.loadGuestResume();
      if (cached) {
        setCachedData(ensureUniqueSectionItemIds(cached) as ResumeData);
        setShowCachePrompt(true);
        return;
      }
    }

    // No cache or authenticated with no cache — use initial data
    setResolvedData(
      ensureUniqueSectionItemIds(initialData ?? emptyResumeData) as ResumeData,
    );
  }, [isLoading, isGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  const syncGuestResume = async (data: ResumeData) => {
    const title = guestStorage.getGuestResumeTitle();
    const normalized = ensureUniqueSectionItemIds(data) as ResumeData;

    try {
      const created = await ResumeService.create(title, normalized);
      setSyncedResumeId(created.id);
      // toast.success("Resume saved to your account!");

      // Clear localStorage after successful sync
      guestStorage.clearGuestResume();

      // Set the synced data as resolved data
      setResolvedData({ ...normalized, id: created.id } as ResumeData);
    } catch (error) {
      console.error("Failed to sync guest resume:", error);
      toast.error(
        "Failed to save your resume. Don't worry, it's still saved locally.",
      );
      // Fall back to the cached data
      setResolvedData(normalized);
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
    setResolvedData(
      ensureUniqueSectionItemIds(initialData || emptyResumeData) as ResumeData,
    );
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
