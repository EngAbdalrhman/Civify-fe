import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ResumeData, emptyResumeData } from "@/features/upload-cv/types";
import { ResumeService } from "@/services/resume.service";
import { toast } from "sonner";
import { STORAGE_KEY } from "../utils/constants";

interface UseResumeDataReturn {
  initialData: ResumeData | null;
  resumeId: string | null;
  isLoading: boolean;
  isGuest: boolean;
  showCachePrompt: boolean;
  handleContinueCached: () => void;
  handleStartFresh: () => void;
  setShowCachePrompt: (show: boolean) => void;
}

export function useResumeData(): UseResumeDataReturn {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");

  const [initialData, setInitialData] = useState<ResumeData | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(resumeIdParam);
  const [isLoading, setIsLoading] = useState(true);
  const [showCachePrompt, setShowCachePrompt] = useState(false);
  const [cachedData, setCachedData] = useState<ResumeData | null>(null);

  const isGuest = !user || !user.id;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Priority 1: If resumeId is provided, fetch from API
        if (resumeIdParam && !isGuest) {
          try {
            const resume = await ResumeService.getById(resumeIdParam);
            const dataWithId = { ...resume.data, id: resume.id };
            setInitialData(dataWithId);
            setResumeId(resume.id);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error("Failed to load resume from API", error);
            toast.error("Failed to load resume. Starting fresh.");
          }
        }

        // Priority 2: Check for cached guest data
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            // If there's cached data but we're not editing a specific resume, ask user
            if (!resumeIdParam) {
              setCachedData(parsed);
              setShowCachePrompt(true);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error("Failed to parse cached resume", e);
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        // Priority 3: Start fresh
        setInitialData(emptyResumeData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [resumeIdParam, isGuest]);

  const handleContinueCached = () => {
    if (cachedData) {
      setInitialData(cachedData);
    }
    setShowCachePrompt(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    setInitialData(emptyResumeData);
    setShowCachePrompt(false);
  };

  return {
    initialData,
    resumeId,
    isLoading,
    isGuest,
    showCachePrompt,
    handleContinueCached,
    handleStartFresh,
    setShowCachePrompt,
  };
}
