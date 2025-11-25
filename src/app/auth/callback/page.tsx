"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { authService } from "@/lib/services/auth.service";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Prevent multiple executions
    if (isProcessing) return;

    const handleCallback = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      if (accessToken) {
        setIsProcessing(true);
        try {
          // Store refresh token first, then access token
          // This ensures tokenManager gets both tokens when setAccessToken is called
          if (refreshToken) {
            authService.setRefreshToken(refreshToken);
          }
          authService.setAccessToken(accessToken);

          // Fetch and set user data
          await refreshUser();

          toast({
            title: "Successfully logged in",
            description: "Welcome back!",
          });

          // Redirect to dashboard
          router.push("/dashboard");
        } catch (error) {
          console.error("Error during OAuth callback:", error);
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Failed to complete login. Please try again.",
          });
          router.push("/login?error=oauth_failed");
        }
      } else {
        // Handle error or missing tokens
        console.error("Missing tokens in callback URL");
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "No authentication tokens received.",
        });
        router.push("/login?error=oauth_failed");
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing login...</p>
      </div>
    </div>
  );
}
