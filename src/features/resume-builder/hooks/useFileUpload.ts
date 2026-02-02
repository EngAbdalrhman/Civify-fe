"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import apiClient from "@/api/client";
import { CvParseResponse, ResumeData } from "@/features/upload-cv/types";
import { ALLOWED_FILE_TYPES, UPLOAD_TIMEOUT } from "../utils/constants";

interface UseFileUploadParams {
  isGuest: boolean;
  onSuccess: (data: ResumeData) => void;
}

interface UseFileUploadReturn {
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  triggerFileUpload: () => void;
}

export function useFileUpload({
  isGuest,
  onSuccess,
}: UseFileUploadParams): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useTranslations("builder");

  const triggerFileUpload = () => {
    if (isGuest) {
      toast.info(t("toasts.guestUpload"), {
        action: {
          label: t("toasts.loginAction"),
          onClick: () => router.push("/login?callbackUrl=/app/resume-builder"),
        },
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(t("toasts.uploadError"));
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<CvParseResponse>(
        "/v1/cvs/upload",
        formData as unknown as object,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: UPLOAD_TIMEOUT,
        },
      );

      const data = response.data;

      // Access nested data from CommonResponse wrapper
      const responseData = (data as any).data || data;

      if (responseData?.resumeData) {
        onSuccess(responseData.resumeData);
        toast.success(t("toasts.parseSuccess"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("toasts.parseError"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return {
    isUploading,
    fileInputRef,
    handleFileUpload,
    triggerFileUpload,
  };
}
