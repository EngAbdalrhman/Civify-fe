"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ResumeData, AtsScore } from "@/features/upload-cv/types";
import { ResumeService } from "@/services/resume.service";
import { useGuestResumeStorage } from "./useGuestResumeStorage";
import { ensureUniqueSectionItemIds } from "@/features/resume-builder/utils/normalizeResumeIds";
import { BuilderSaveStatus } from "@/features/resume-builder/types";

interface UseResumeBuilderParams {
  initialData: ResumeData;
  resumeId?: string | null;
  isGuest?: boolean;
}

interface UseResumeBuilderReturn {
  // State
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  resumeTitle: string;
  setResumeTitle: (title: string) => void;
  isSaving: boolean;
  saveStatus: BuilderSaveStatus;
  lastSavedAt: string | null;
  currentResumeId: string | null;
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  mobileView: "editor" | "preview";
  setMobileView: (view: "editor" | "preview") => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isGuest: boolean;

  // Auth gate
  showAuthGate: boolean;
  setShowAuthGate: (show: boolean) => void;

  // ATS Score
  showScoreDialog: boolean;
  setShowScoreDialog: (show: boolean) => void;
  atsScore: AtsScore | null;
  isCalculatingScore: boolean;

  // Refs
  originalDataRef: React.RefObject<ResumeData>;

  // Handlers
  handleSaveClick: () => void;
  handleSaveConfirm: () => Promise<void>;
  handleReset: () => void;
  handleCalculateScore: () => Promise<void>;
  handleResumeDataUpdate: (data: ResumeData) => void;
  handleAuthGatedAction: () => void;
}

export function useResumeBuilder({
  initialData,
  resumeId,
  isGuest = false,
}: UseResumeBuilderParams): UseResumeBuilderReturn {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "content";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [resumeTitle, setResumeTitle] = useState(
    initialData.personalInfo?.fullName
      ? `${initialData.personalInfo.fullName}'s Resume`
      : "Untitled Resume",
  );
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(
    resumeId || null,
  );
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [saveStatus, setSaveStatus] = useState<BuilderSaveStatus>(
    resumeId ? "saved" : "unsaved",
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    resumeId ? new Date().toISOString() : null,
  );

  // ATS Score state
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  const originalDataRef = useRef<ResumeData>(initialData);
  const lastSavedSnapshotRef = useRef("");
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutosavingRef = useRef(false);
  const t = useTranslations("builder");

  // Guest storage
  const { saveGuestResume } = useGuestResumeStorage();

  const getDerivedTitle = useCallback(
    (data: ResumeData) => {
      const fullName = data.personalInfo?.fullName?.trim();
      return fullName ? `${fullName}'s Resume` : "Untitled Resume";
    },
    [],
  );

  const buildSnapshot = useCallback((data: ResumeData, title: string) => {
    return JSON.stringify({
      title: title.trim(),
      data: ensureUniqueSectionItemIds(data),
    });
  }, []);

  const persistResume = useCallback(
    async (mode: "manual" | "autosave", titleOverride?: string) => {
      const effectiveTitle =
        titleOverride?.trim() || resumeTitle.trim() || getDerivedTitle(resumeData);
      const normalizedData = ensureUniqueSectionItemIds(resumeData) as ResumeData;
      const nextSnapshot = buildSnapshot(normalizedData, effectiveTitle);

      if (
        mode === "autosave" &&
        nextSnapshot === lastSavedSnapshotRef.current &&
        currentResumeId
      ) {
        setSaveStatus("saved");
        return;
      }

      setIsSaving(true);
      setSaveStatus("saving");

      try {
        if (currentResumeId) {
          await ResumeService.update(currentResumeId, effectiveTitle, normalizedData);
        } else {
          const created = await ResumeService.create(effectiveTitle, normalizedData);
          setCurrentResumeId(created.id);
        }

        setResumeTitle(effectiveTitle);
        setResumeData(normalizedData);
        originalDataRef.current = normalizedData;
        lastSavedSnapshotRef.current = nextSnapshot;
        setLastSavedAt(new Date().toISOString());
        setSaveStatus("saved");

        if (mode === "manual") {
          toast.success(t("toasts.saveSuccess"));
        }
      } catch (error) {
        console.error(error);
        setSaveStatus("error");
        if (mode === "manual") {
          toast.error(t("toasts.saveError"));
        }
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [buildSnapshot, currentResumeId, getDerivedTitle, resumeData, resumeTitle, t],
  );

  // Update ref when initialData changes
  useEffect(() => {
    originalDataRef.current = initialData;
    setResumeData(initialData);
    const derivedTitle = initialData.personalInfo?.fullName
      ? `${initialData.personalInfo.fullName}'s Resume`
      : "Untitled Resume";
    setResumeTitle(derivedTitle);
    setCurrentResumeId(resumeId || null);
    lastSavedSnapshotRef.current = buildSnapshot(initialData, derivedTitle);
    setSaveStatus(resumeId ? "saved" : "unsaved");
    setLastSavedAt(resumeId ? new Date().toISOString() : null);
  }, [buildSnapshot, initialData, resumeId]);

  // Auto-save to localStorage for guests when data changes
  useEffect(() => {
    if (isGuest) {
      saveGuestResume(resumeData, resumeTitle);
      setSaveStatus("saved");
    }
  }, [resumeData, resumeTitle, isGuest, saveGuestResume]);

  useEffect(() => {
    if (isGuest) return;

    const effectiveTitle = resumeTitle.trim() || getDerivedTitle(resumeData);
    const nextSnapshot = buildSnapshot(resumeData, effectiveTitle);

    if (nextSnapshot === lastSavedSnapshotRef.current) {
      setSaveStatus(currentResumeId ? "saved" : "unsaved");
      return;
    }

    setSaveStatus("unsaved");

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      if (isAutosavingRef.current) return;
      isAutosavingRef.current = true;
      try {
        await persistResume("autosave", effectiveTitle);
      } catch {
        // status already handled in persistResume
      } finally {
        isAutosavingRef.current = false;
      }
    }, 1200);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [
    buildSnapshot,
    currentResumeId,
    getDerivedTitle,
    isGuest,
    persistResume,
    resumeData,
    resumeTitle,
  ]);

  const handleAuthGatedAction = useCallback(() => {
    setShowAuthGate(true);
  }, []);

  const handleSaveClick = () => {
    if (isGuest) {
      handleAuthGatedAction();
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    const effectiveTitle = resumeTitle.trim() || getDerivedTitle(resumeData);
    if (!effectiveTitle.trim()) {
      toast.error(t("toasts.enterTitle"));
      return;
    }

    setShowSaveDialog(false);
    await persistResume("manual", effectiveTitle);
  };

  const handleReset = () => {
    setResumeData(originalDataRef.current);
    toast.info(t("toasts.resetInfo"));
  };

  const handleCalculateScore = async () => {
    setShowScoreDialog(true);
    setIsCalculatingScore(true);
    setAtsScore(null);

    try {
      const score = await ResumeService.calculateScore(resumeData);
      setAtsScore(score);
    } catch (error) {
      console.error("Score calculation error:", error);
      toast.error("Failed to calculate ATS score");
      setShowScoreDialog(false);
    } finally {
      setIsCalculatingScore(false);
    }
  };

  const handleResumeDataUpdate = (data: ResumeData) => {
    setResumeData(data);
  };

  return {
    // State
    resumeData,
    setResumeData,
    resumeTitle,
    setResumeTitle,
    isSaving,
    saveStatus,
    lastSavedAt,
    currentResumeId,
    showSaveDialog,
    setShowSaveDialog,
    mobileView,
    setMobileView,
    activeTab,
    setActiveTab,
    isGuest,

    // Auth gate
    showAuthGate,
    setShowAuthGate,

    // ATS Score
    showScoreDialog,
    setShowScoreDialog,
    atsScore,
    isCalculatingScore,

    // Refs
    originalDataRef,

    // Handlers
    handleSaveClick,
    handleSaveConfirm,
    handleReset,
    handleCalculateScore,
    handleResumeDataUpdate,
    handleAuthGatedAction,
  };
}
