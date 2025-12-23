import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/api/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const useVerifyOtp = () => {
  const t = useTranslations("auth");
  const [otpCode, setOtpCode] = useState("");

  const {
    mutate: verifyOtp,
    isPending: isVerifying,
    isSuccess: isVerifySuccess,
    error: verifyError,
  } = useMutation({
    mutationFn: async ({ username, code }: { username: string; code: string }) => {
      // Using URLSearchParams to send as form data (not visible in browser URL bar)
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("code", code);
      
      const response = await apiClient.post("/auth/verify-otp", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // Tokens are automatically stored by the API client interceptor
      toast.success(t("loginSuccess") || "Login successful!");
    },
    onError: (error: { message?: string }) => {
      const errorMessage = error?.message || t("invalidOtp") || "Invalid or expired OTP";
      toast.error(errorMessage);
    },
  });

  const handleVerify = (username: string) => {
    if (!otpCode.trim()) {
      toast.error(t("enterOtp") || "Please enter the OTP code");
      return;
    }
    verifyOtp({ username, code: otpCode.trim() });
  };

  const resetOtp = () => {
    setOtpCode("");
  };

  return {
    otpCode,
    setOtpCode,
    handleVerify,
    verifyOtp,
    isVerifying,
    isVerifySuccess,
    verifyError,
    resetOtp,
  };
};
