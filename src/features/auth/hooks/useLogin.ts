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
    identifier: z
      .string()
      .min(1, t("identifierRequired") || "Please enter your email or username"),
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
      // Detect if identifier is email (contains @) or username
      const isEmail = data.identifier.includes("@");
      const payload = isEmail
        ? { email: data.identifier, password: data.password }
        : { username: data.identifier, password: data.password };

      const response = await apiClient.post<{
        requires2FA?: boolean;
        message?: string;
      }>("/login", payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Check if 2FA is required
      if (data.requires2FA) {
        setRequires2FA(true);
        // Store identifier for 2FA verification
        setLoginUsername(form.getValues("identifier"));
        toast.info(data.message || "Please enter the OTP sent to your email");
      }
      // If tokens are returned, login is complete (handled by API client storing tokens)
    },
    onError: (error: { errorCode?: string; message?: string }) => {
      const errorCode = error?.errorCode;
      const errorMessage = error?.message || "Login failed";

      // Check if error is about email verification
      if (errorCode === "AUTH_001") {
        const identifier = form.getValues("identifier");
        // Only resend verification if it looks like an email
        if (identifier.includes("@")) {
          setUnverifiedEmail(identifier);
          setShowResendVerification(true);
          resendVerification(identifier);
          toast.error(t("emailNotVerified") || errorMessage);
          toast.info(
            t("verificationSentAutomatically") ||
              "Verification email sent automatically!",
          );
        } else {
          toast.error(t("emailNotVerified") || errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // Resend verification email mutation
  const { mutate: resendVerification, isPending: isResendPending } =
    useMutation({
      mutationFn: async (email: string) => {
        const response = await apiClient.post(
          "/auth/resend-verification",
          null,
          {
            params: { email },
            timeout: 60000,
          },
        );
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
  identifier: string;
  password: string;
};
