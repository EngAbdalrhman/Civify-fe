"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/routing";
import { useState } from "react";
import apiClient from "@/api/client";
import { toast } from "sonner";

type Step = "email" | "otp" | "newPassword";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", null, {
        params: { email }
      });
      toast.success("If an account exists, a reset code has been sent to your email");
      setStep("otp");
    } catch (err) {
      setError("Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/verify-reset-otp", null, {
        params: { email, otp }
      });
      const token = response.data?.data?.resetToken;
      if (token) {
        setResetToken(token);
        setStep("newPassword");
        toast.success("Code verified! Please set your new password");
      } else {
        setError("Invalid verification response");
      }
    } catch (err) {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post("/auth/reset-password", null, {
        params: { resetToken, newPassword }
      });
      toast.success("Password reset successful! Please login with your new password");
      router.push("/login");
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("forgotPassword") || "Forgot Password"}</h1>
          <p className="text-muted-foreground mt-2">
            {step === "email" && "Enter your email to receive a verification code"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
            {step === "newPassword" && "Create a new password for your account"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2">
          {["email", "otp", "newPassword"].map((s, i) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                step === s ? "bg-primary" : 
                ["email", "otp", "newPassword"].indexOf(step) > i ? "bg-primary/50" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === "email" && (
          <form onSubmit={handleRequestOtp} className="rounded-lg border p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("email") || "Email"}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-background"
                placeholder="your@email.com"
                required
                autoFocus
              />
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="rounded-lg border p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-md border px-3 py-2 text-center text-2xl tracking-widest font-mono bg-background"
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <Button className="w-full" disabled={isLoading || otp.length < 6}>
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("email")}
            >
              Back
            </Button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "newPassword" && (
          <form onSubmit={handleResetPassword} className="rounded-lg border p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-background"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-background"
                placeholder="••••••••"
                required
              />
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("login") || "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
}
