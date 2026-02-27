"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { LogIn, UserPlus } from "lucide-react";

const OAUTH_RETURN_TO_KEY = "civify_oauth_returnTo";

interface AuthGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthGateDialog({ open, onOpenChange }: AuthGateDialogProps) {
  const t = useTranslations("builder.authGate");
  const router = useRouter();

  const handleLogin = () => {
    onOpenChange(false);
    router.push("/login?returnTo=/app/resume-builder");
  };

  const handleSignup = () => {
    onOpenChange(false);
    router.push("/signup?returnTo=/app/resume-builder");
  };

  const handleGoogleLogin = () => {
    onOpenChange(false);
    // Store return path for OAuth callback
    try {
      localStorage.setItem(OAUTH_RETURN_TO_KEY, "/app/resume-builder");
    } catch {}
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8077/apis";
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  const handleLinkedInLogin = () => {
    onOpenChange(false);
    try {
      localStorage.setItem(OAUTH_RETURN_TO_KEY, "/app/resume-builder");
    } catch {}
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8077/apis";
    window.location.href = `${backendUrl}/oauth2/authorization/linkedin`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Button className="w-full gap-2" size="lg" onClick={handleLogin}>
            <LogIn className="h-4 w-4" />
            {t("login")}
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            size="lg"
            onClick={handleSignup}
          >
            <UserPlus className="h-4 w-4" />
            {t("signup")}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("orContinueWith")}
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
            {t("google")}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full hover:bg-white hover:text-primary transition-all duration-200 ease-in-out"
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
            {t("linkedin")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
