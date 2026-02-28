import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ResumeData, emptyResumeData } from "@/features/upload-cv/types";
import { ResumeService } from "@/services/resume.service";
import { toast } from "sonner";
import { isAuthenticated } from "@/utils/cookies";

interface UseResumeDataReturn {
  initialData: ResumeData | null;
  resumeId: string | null;
  isLoading: boolean;
  isGuest: boolean;
}

export function useResumeData(): UseResumeDataReturn {
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");

  const [initialData, setInitialData] = useState<ResumeData | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(resumeIdParam);
  const [isLoading, setIsLoading] = useState(true);

  const isGuest = !isAuthenticated();

  useEffect(() => {
    const loadData = async () => {
      try {
        // If authenticated and resumeId is provided, fetch from API
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

        // Start fresh
        setInitialData(emptyResumeData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [resumeIdParam, isGuest]);

  return {
    initialData,
    resumeId,
    isLoading,
    isGuest,
  };
}
