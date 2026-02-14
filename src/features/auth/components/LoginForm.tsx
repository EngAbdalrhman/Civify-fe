"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/routing";
import { useLogin, LoginSchemaType, useVerifyOtp } from "@/features/auth/hooks";
import { SubmitHandler } from "react-hook-form";
import { usePermissions } from "@/contexts/PermissionContext";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const REMEMBER_ME_KEY = "civify_remember_identifier";

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { fetchPermissions } = usePermissions();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    form,
    login,
    isLoginPending,
    isLoginSuccess,
    showResendVerification,
    handleResendVerification,
    isResendPending,
    // 2FA
    requires2FA,
    loginUsername,
    reset2FA,
  } = useLogin();

  const { otpCode, setOtpCode, handleVerify, isVerifying, isVerifySuccess } =
    useVerifyOtp();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  // Load remembered identifier on mount
  useEffect(() => {
    const savedIdentifier = localStorage.getItem(REMEMBER_ME_KEY);
    if (savedIdentifier) {
      setValue("identifier", savedIdentifier);
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit: SubmitHandler<LoginSchemaType> = (data) => {
    // Handle Remember Me - save or clear identifier
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, data.identifier);
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
    login(data);
  };

  // Handle redirect after successful login - fetch permissions first
  useEffect(() => {
    const handleLoginSuccess = async () => {
      if ((isLoginSuccess && !requires2FA) || isVerifySuccess) {
        if (isRedirecting) return; // Prevent double redirect
        setIsRedirecting(true);

        // Fetch permissions before redirecting
        await fetchPermissions();
        router.push("/app");
      }
    };

    handleLoginSuccess();
  }, [
    isLoginSuccess,
    requires2FA,
    isVerifySuccess,
    fetchPermissions,
    router,
    isRedirecting,
  ]);

  const handleGoogleLogin = () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8077/apis";
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  const handleLinkedInLogin = () => {
    // Redirect to backend LinkedIn OAuth endpoint
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8077/apis";
    window.location.href = `${backendUrl}/oauth2/authorization/linkedin`;
  };

  // 2FA OTP Verification UI
  if (requires2FA && loginUsername) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              {t("twoFactorAuth") || "Two-Factor Authentication"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("otpSentToEmail") ||
                "A verification code has been sent to your email"}
            </p>
          </div>

          <div className="rounded-lg border p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("verificationCode") || "Verification Code"}
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                {t("enterOtpCode") || "Enter the 6-digit code from your email"}
              </p>
            </div>

            <Button
              className="w-full"
              onClick={() => handleVerify(loginUsername)}
              disabled={isVerifying || otpCode.length < 4}
            >
              {isVerifying
                ? t("verifying") || "Verifying..."
                : t("verify") || "Verify"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={reset2FA}
            >
              {t("backToLogin") || "Back to Login"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("login")}</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Please login to your account
          </p>
        </div>

        {/* Resend Verification Alert */}
        {showResendVerification && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3 dark:bg-yellow-900/20 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 dark:text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
                  Email Not Verified
                </h3>
                <p className="text-sm text-yellow-700 mt-1 dark:text-yellow-300">
                  Please check your inbox for the verification email. Didn't
                  receive it?
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-yellow-300 hover:bg-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-900/40"
              onClick={handleResendVerification}
              disabled={isResendPending}
            >
              {isResendPending ? "Sending..." : "Resend Verification Email"}
            </Button>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-lg border p-6 space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("identifier") || "Email or Username"}
            </label>
            <input
              type="text"
              {...register("identifier")}
              className="w-full rounded-md border px-3 py-2 bg-background"
              placeholder={
                t("identifierPlaceholder") || "your@email.com or username"
              }
            />
            {errors.identifier && (
              <p className="text-error text-xs mt-1">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("password")}</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-md border px-3 py-2 bg-background"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-error text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              {t("rememberMe")}
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <Button className="w-full" disabled={isLoginPending}>
            {isLoginPending ? "Logging in..." : t("login")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-white hover:text-primary transition-all duration-200 ease-in-out"
            onClick={handleGoogleLogin}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("loginWithGoogle")}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-white hover:text-primary transition-all duration-200 ease-in-out mt-2"
            onClick={handleLinkedInLogin}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                fill="#0077B5"
              />
            </svg>
            {t("loginWithLinkedIn")}
          </Button>
        </form>

        <p className="text-center text-sm">
          {t("noAccount")}{" "}
          <Link href="/signup" className="text-primary hover:underline">
            {t("signup")}
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground px-4">
          {t.rich("agreement", {
            terms: (chunks) => (
              <Link href="/terms" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/policy" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </div>
  );
}
