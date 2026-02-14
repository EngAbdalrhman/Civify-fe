"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ResumeData, AtsScore } from "@/features/upload-cv/types";
import { ResumeService } from "@/services/resume.service";
import { STORAGE_KEY } from "../utils/constants";

interface UseResumeBuilderParams {
  initialData: ResumeData;
  resumeId?: string | null;
  isGuest: boolean;
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
}

export function useResumeBuilder({
  initialData,
  resumeId,
  isGuest,
}: UseResumeBuilderParams): UseResumeBuilderReturn {
  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const [activeTab, setActiveTab] = useState("content");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
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
  const tCommon = useTranslations("common");

  // Update ref when initialData changes
  useEffect(() => {
    originalDataRef.current = initialData;
    setResumeData(initialData);
  }, [initialData]);

  const handleSaveClick = () => {
    if (isGuest) {
      toast.info(t("saveDialog.description"), {
        action: {
          label: tCommon("login"),
          onClick: () => router.push("/login?callbackUrl=/app/resume-builder"),
        },
      });
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
      if (currentResumeId) {
        await ResumeService.update(currentResumeId, resumeTitle, resumeData);
      } else {
        const created = await ResumeService.create(resumeTitle, resumeData);
        setCurrentResumeId(created.id);
        // Clear guest cache after successful save
        localStorage.removeItem(STORAGE_KEY);
      }
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
    if (isGuest) {
      localStorage.removeItem(STORAGE_KEY);
    }
    toast.info(t("toasts.resetInfo"));
  };

  const handleCalculateScore = async () => {
    if (isGuest) {
      toast.info("Please login to use ATS Score analysis", {
        action: {
          label: tCommon("login"),
          onClick: () => router.push("/login?callbackUrl=/app/resume-builder"),
        },
      });
      return;
    }

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
  };
}
