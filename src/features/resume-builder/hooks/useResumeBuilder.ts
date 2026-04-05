"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ResumeData, AtsScore } from "@/features/upload-cv/types";
import { ResumeService } from "@/services/resume.service";
import { useGuestResumeStorage } from "./useGuestResumeStorage";
import { ensureUniqueSectionItemIds } from "@/features/resume-builder/utils/normalizeResumeIds";

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

  // ATS Score state
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [atsScore, setAtsScore] = useState<AtsScore | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  const router = useRouter();
  const originalDataRef = useRef<ResumeData>(initialData);
  const t = useTranslations("builder");

  // Guest storage
  const { saveGuestResume } = useGuestResumeStorage();

  // Update ref when initialData changes
  useEffect(() => {
    originalDataRef.current = initialData;
    setResumeData(initialData);
  }, [initialData]);

  // Auto-save to localStorage for guests when data changes
  useEffect(() => {
    if (isGuest) {
      saveGuestResume(resumeData, resumeTitle);
    }
  }, [resumeData, resumeTitle, isGuest, saveGuestResume]);

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
      originalDataRef.current = dataToSave;
      toast.success(t("toasts.saveSuccess"));
    } catch (error) {
      console.error(error);
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
  };

  return {
    // State
    resumeData,
    setResumeData,
    resumeTitle,
    setResumeTitle,
    isSaving,
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
