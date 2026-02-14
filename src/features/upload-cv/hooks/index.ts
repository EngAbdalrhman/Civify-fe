import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type {
  CvParseResponse,
  CvTailorRequest,
  CvTailorResponse,
} from "../types";

// Hook for uploading and parsing CV
export const useUploadCv = () => {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: async (file: File): Promise<CvParseResponse> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<
        {
          data?: CvParseResponse;
          success?: boolean;
          errorCode?: string;
        } & CvParseResponse
      >("/v1/cvs/upload", formData as unknown as object, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2 min timeout for file processing
        skipErrorToast: true,
      });

      // Handle CommonResponse wrapper
      const data = response.data?.data || response.data;

      // Check for token limit exceeded error
      if (
        !data.success &&
        (data as { errorCode?: string }).errorCode === "TOKEN_LIMIT_EXCEEDED"
      ) {
        const error = new Error("TOKEN_LIMIT_EXCEEDED") as Error & {
          errorCode?: string;
        };
        error.errorCode = "TOKEN_LIMIT_EXCEEDED";
        throw error;
      }

      return data;
    },
    onError: (error: any) => {
      // Don't show toast for TOKEN_LIMIT_EXCEEDED - let the component handle it
      if (
        error?.errorCode === "TOKEN_LIMIT_EXCEEDED" ||
        error?.message === "TOKEN_LIMIT_EXCEEDED"
      ) {
        return;
      }

      const errorCode = error?.errorCode || "DEFAULT";
      // Try to get translation for error code, fallback to server message or default
      const errorMessage = t.has(errorCode) 
        ? t(errorCode) 
        : (error?.message || t("parseFailed"));
      
      toast.error(errorMessage);
    },
  });
};

// Hook for tailoring CV
export const useTailorCv = () => {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: async (request: CvTailorRequest): Promise<CvTailorResponse> => {
      const response = await apiClient.post<
        { data?: CvTailorResponse } & CvTailorResponse
      >("/v1/cvs/tailor", request as unknown as object, {
        timeout: 180000, // 3 min timeout for AI processing
        skipErrorToast: true,
      });

      // Handle CommonResponse wrapper
      return response.data?.data || response.data;
    },
    onError: (error: any) => {
      // Don't show toast for TOKEN_LIMIT_EXCEEDED - let the component handle it
      if (
        error?.errorCode === "TOKEN_LIMIT_EXCEEDED" ||
        error?.message === "TOKEN_LIMIT_EXCEEDED"
      ) {
        return;
      }

      const errorCode = error?.errorCode || "DEFAULT";
      const errorMessage = t.has(errorCode) 
        ? t(errorCode) 
        : (error?.message || t("tailorFailed"));

      toast.error(errorMessage);
    },
  });
};

export { useUploadCv as default };
