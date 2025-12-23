import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import apiClient from "@/api/client";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useState } from "react";

export const useLogin = () => {
  const t = useTranslations("auth");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginUsername, setLoginUsername] = useState<string | null>(null);

  const loginSchema = z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(1, t("passwordRequired")),
  });

  type LoginSchemaType = z.infer<typeof loginSchema>;

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const {
    mutate: login,
    isPending: isLoginPending,
    isSuccess: isLoginSuccess,
    error: loginError,
  } = useMutation({
    mutationFn: async (data: LoginSchemaType) => {
      const response = await apiClient.post("/login", {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Check if 2FA is required
      if (data.requires2FA) {
        setRequires2FA(true);
        // Store email as the username for 2FA verification
        setLoginUsername(form.getValues("email"));
        toast.info(data.message || "Please enter the OTP sent to your email");
      }
      // If tokens are returned, login is complete (handled by API client storing tokens)
    },
    onError: (error: { errorCode?: string; message?: string }) => {
      const errorCode = error?.errorCode;
      const errorMessage = error?.message || "Login failed";
      
      // Check if error is about email verification
      if (errorCode === "AUTH_001") {
        const email = form.getValues("email");
        setUnverifiedEmail(email);
        setShowResendVerification(true);
        resendVerification(email);
        toast.error(t("emailNotVerified") || errorMessage);
        toast.info(t("verificationSentAutomatically") || "Verification email sent automatically!");
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // Resend verification email mutation
  const { mutate: resendVerification, isPending: isResendPending } = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post("/auth/resend-verification", null, {
        params: { email },
        timeout: 60000,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Verification email sent! Please check your inbox.");
      setShowResendVerification(false);
    },
    onError: (error: { message?: string }) => {
      const errorMessage = error?.message || "Failed to resend email";
      toast.error(errorMessage);
    },
  });

  const handleResendVerification = () => {
    if (unverifiedEmail) {
      resendVerification(unverifiedEmail);
    }
  };

  // Reset 2FA state (e.g., when user wants to go back)
  const reset2FA = () => {
    setRequires2FA(false);
    setLoginUsername(null);
  };

  return {
    form,
    login,
    isLoginPending,
    isLoginSuccess,
    loginError,
    showResendVerification,
    handleResendVerification,
    isResendPending,
    // 2FA related
    requires2FA,
    loginUsername,
    reset2FA,
  };
};

export type LoginSchemaType = {
  email: string;
  password: string;
};
