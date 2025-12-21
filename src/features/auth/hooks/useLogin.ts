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
      // Backend expects /login endpoint (with /apis context path)
      const response = await apiClient.post("/login", {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onError: (error: any) => {
      const errorCode = error?.errorCode || error?.response?.data?.errorCode;
      const errorMessage = error?.message || error?.response?.data?.message || "Login failed";
      
      // Check if error is about email verification using error code
      if (errorCode === 'AUTH_001') {
        const email = form.getValues("email");
        setUnverifiedEmail(email);
        
        // Setup manual resend button just in case
        setShowResendVerification(true);
        
        // Automatically resend verification email
        resendVerification(email);
        toast.error(t("emailNotVerified") || errorMessage);
        toast.info(t("verificationSentAutomatically") || "Verification email sent automatically! Please check your inbox.");
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
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Verification email sent! Please check your inbox.");
      setShowResendVerification(false);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to resend email";
      toast.error(errorMessage);
    },
  });

  const handleResendVerification = () => {
    if (unverifiedEmail) {
      resendVerification(unverifiedEmail);
    }
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
  };
};

export type LoginSchemaType = {
  email: string;
  password: string;
};
