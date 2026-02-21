"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import apiClient from "@/api/client";
import { CvParseResponse, ResumeData } from "@/features/upload-cv/types";
import { ALLOWED_FILE_TYPES, UPLOAD_TIMEOUT } from "../utils/constants";

interface UseFileUploadParams {
  onSuccess: (data: ResumeData) => void;
}

interface UseFileUploadReturn {
  isUploading: boolean;
  tokenLimitExceeded: boolean;
  resetTokenLimit: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  triggerFileUpload: () => void;
}

export function useFileUpload({
  onSuccess,
}: UseFileUploadParams): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [tokenLimitExceeded, setTokenLimitExceeded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("builder");

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const resetTokenLimit = () => {
    setTokenLimitExceeded(false);
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
    setTokenLimitExceeded(false);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<CvParseResponse>(
        "/v1/cvs/upload",
        formData as unknown as object,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: UPLOAD_TIMEOUT,
          skipErrorToast: true,
        },
      );

      const data = response.data;

      // Access nested data from CommonResponse wrapper
      const responseData = (data as any)?.data || data;

      // Check for TOKEN_LIMIT_EXCEEDED before treating as success
      if (
        !responseData?.success &&
        responseData?.errorCode === "TOKEN_LIMIT_EXCEEDED"
      ) {
        setTokenLimitExceeded(true);
        return;
      }

      if (responseData?.resumeData) {
        onSuccess(responseData.resumeData);
      } else {
        toast.error(t("toasts.parseError"));
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      
      // Also catch if the interceptor threw the token limit error
      if (
        error?.errorCode === "TOKEN_LIMIT_EXCEEDED" ||
        error?.message === "TOKEN_LIMIT_EXCEEDED"
      ) {
        setTokenLimitExceeded(true);
      } else {
        toast.error(t("toasts.parseError"));
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return {
    isUploading,
    tokenLimitExceeded,
    resetTokenLimit,
    fileInputRef,
    handleFileUpload,
    triggerFileUpload,
  };
}
