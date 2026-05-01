"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ResumeData, AtsScore } from "@/features/upload-cv/types";
import { ResumeService } from "@/services/resume.service";
import { useGuestResumeStorage } from "./useGuestResumeStorage";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { ensureUniqueSectionItemIds } from "@/features/resume-builder/utils/normalizeResumeIds";
import type { BuilderSaveStatus } from "@/features/resume-builder/types";

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
  currentResumeId: string | null;
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  mobileView: "editor" | "preview";
  setMobileView: (view: "editor" | "preview") => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isGuest: boolean;

  // Save status (autosave)
  saveStatus: BuilderSaveStatus;
  lastSavedAt: string | null;

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
  handleTranslateComplete: (translatedData: ResumeData, saveMode: 'new' | 'replace', targetLang: string) => Promise<void>;
  autoSaveEnabled: boolean;
  handleSaveAsNew: (title: string) => Promise<void>;
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

  // Save status (autosave)
  const [saveStatus, setSaveStatus] = useState<BuilderSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // ATS Score state
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  const router = useRouter();
  const originalDataRef = useRef<ResumeData>(initialData);
  const lastSavedDataRef = useRef<ResumeData>(initialData);
  const titleSetByUserRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations("builder");

  // Guest storage
  const { saveGuestResume } = useGuestResumeStorage();

  // User preferences
  const { data: userPrefs } = useUserPreferences();
  const autoSaveEnabled = userPrefs?.autoSaveEnabled ?? true;

  // Update ref when initialData changes — preserve user-set title
  useEffect(() => {
    originalDataRef.current = initialData;
    lastSavedDataRef.current = initialData;
    setResumeData(initialData);
    // Only derive title if user hasn't manually set one
    if (!titleSetByUserRef.current) {
      const derived = initialData.personalInfo?.fullName
        ? `${initialData.personalInfo.fullName}'s Resume`
        : "Untitled Resume";
      setResumeTitle(derived);
    }
  }, [initialData]);

  // Wrap setResumeTitle to track when user explicitly sets a title
  const handleSetResumeTitle = useCallback((title: string) => {
    titleSetByUserRef.current = true;
    setResumeTitle(title);
  }, []);

  // Auto-save to localStorage for guests when data changes
  useEffect(() => {
    if (isGuest) {
      saveGuestResume(resumeData, resumeTitle);
    }
  }, [resumeData, resumeTitle, isGuest, saveGuestResume]);

  // ── Autosave (debounced 2s) for authenticated users ──
  const persistResume = useCallback(async () => {
    if (isGuest || !currentResumeId) return;

    // Only save if data has actually changed
    const currentJson = JSON.stringify(resumeData);
    const lastSavedJson = JSON.stringify(lastSavedDataRef.current);
    if (currentJson === lastSavedJson) return;

    setSaveStatus("saving");
    try {
      const dataToSave = ensureUniqueSectionItemIds(resumeData) as ResumeData;
      await ResumeService.update(currentResumeId, resumeTitle, dataToSave);
      lastSavedDataRef.current = dataToSave;
      setResumeData(dataToSave);
      setLastSavedAt(new Date().toISOString());
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, [isGuest, currentResumeId, resumeData, resumeTitle]);

  useEffect(() => {
    if (isGuest || !currentResumeId || !autoSaveEnabled) return;

    // Clear any pending timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      persistResume();
    }, 2000);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [resumeData, persistResume, isGuest, currentResumeId, autoSaveEnabled]);

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
    if (!resumeTitle.trim()) {
      toast.error(t("toasts.enterTitle"));
      return;
    }

    setIsSaving(true);
    setShowSaveDialog(false);

    setSaveStatus("saving");
    try {
      const dataToSave = ensureUniqueSectionItemIds(resumeData) as ResumeData;
      if (currentResumeId) {
        await ResumeService.update(currentResumeId, resumeTitle, dataToSave);
      } else {
        const created = await ResumeService.create(resumeTitle, dataToSave);
        setCurrentResumeId(created.id);
      }
      // Update local state with the normalized data to avoid sync issues
      setResumeData(dataToSave);
      lastSavedDataRef.current = dataToSave;
      setLastSavedAt(new Date().toISOString());
      setSaveStatus("saved");
      toast.success(t("toasts.saveSuccess"));
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
      toast.error(t("toasts.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAsNew = async (newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error(t("toasts.enterTitle"));
      return;
    }

    setIsSaving(true);
    setShowSaveDialog(false);

    setSaveStatus("saving");
    try {
      const dataToSave = ensureUniqueSectionItemIds(resumeData) as ResumeData;
      const created = await ResumeService.create(newTitle, dataToSave);
      
      titleSetByUserRef.current = true;
      setResumeTitle(newTitle);
      setCurrentResumeId(created.id);
      
      // Update local state with the normalized data to avoid sync issues
      setResumeData(dataToSave);
      lastSavedDataRef.current = dataToSave;
      originalDataRef.current = dataToSave; // New resume, so new original data
      setLastSavedAt(new Date().toISOString());
      setSaveStatus("saved");
      toast.success(t("toasts.saveSuccess"));
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
      toast.error(t("toasts.saveError"));
    } finally {
      setIsSaving(false);
    }
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
    originalDataRef.current = data;
    lastSavedDataRef.current = data;
  };

  const handleTranslateComplete = async (translatedData: ResumeData, saveMode: 'new' | 'replace', targetLang: string) => {
    const dataToSave = ensureUniqueSectionItemIds(translatedData) as ResumeData;
    
    // Auto switch layout direction based on language
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    if (!dataToSave.metadata) dataToSave.metadata = {};
    if (rtlLanguages.includes(targetLang.toLowerCase())) {
      dataToSave.metadata.layoutDirection = 'rtl';
    } else {
      dataToSave.metadata.layoutDirection = 'ltr';
    }

    setResumeData(dataToSave);
    originalDataRef.current = dataToSave;
    lastSavedDataRef.current = dataToSave;

    if (isGuest) return;

    try {
      setSaveStatus("saving");
      if (saveMode === 'new') {
        const newTitle = `${resumeTitle} - ${targetLang}`;
        setResumeTitle(newTitle);
        const created = await ResumeService.create(newTitle, dataToSave);
        setCurrentResumeId(created.id);
        toast.success(t("toasts.saveSuccess"));
      } else {
        if (currentResumeId) {
          await ResumeService.update(currentResumeId, resumeTitle, dataToSave);
          toast.success(t("toasts.saveSuccess"));
        }
      }
      setLastSavedAt(new Date().toISOString());
      setSaveStatus("saved");
    } catch (error) {
      console.error('Save translation error:', error);
      setSaveStatus("error");
      toast.error(t("toasts.saveError"));
    }
  };

  return {
    // State
    resumeData,
    setResumeData,
    resumeTitle,
    setResumeTitle: handleSetResumeTitle,
    isSaving,
    currentResumeId,
    showSaveDialog,
    setShowSaveDialog,
    mobileView,
    setMobileView,
    activeTab,
    setActiveTab,
    isGuest,

    // Save status (autosave)
    saveStatus,
    lastSavedAt,

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
    handleTranslateComplete,
    autoSaveEnabled,
    handleSaveAsNew,
  };
}
