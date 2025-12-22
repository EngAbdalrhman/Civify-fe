import { useMutation } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { toast } from "sonner";
import type { 
  CvParseResponse, 
  CvTailorRequest, 
  CvTailorResponse 
} from "../types";

// Hook for uploading and parsing CV
export const useUploadCv = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<CvParseResponse> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/v1/cvs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2 min timeout for file processing
      });
      
      // Handle CommonResponse wrapper
      return response.data?.data || response.data;
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to parse CV";
      toast.error(errorMessage);
    },
  });
};

// Hook for tailoring CV
export const useTailorCv = () => {
  return useMutation({
    mutationFn: async (request: CvTailorRequest): Promise<CvTailorResponse> => {
      const response = await apiClient.post("/v1/cvs/tailor", request, {
        timeout: 180000, // 3 min timeout for AI processing
      });
      
      // Handle CommonResponse wrapper
      return response.data?.data || response.data;
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to tailor CV";
      toast.error(errorMessage);
    },
  });
};

export { useUploadCv as default };
