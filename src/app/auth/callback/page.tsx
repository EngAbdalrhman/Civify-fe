"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken) {
      // Store access token
      authService.setAccessToken(accessToken);
      // Refresh token is handled by HttpOnly cookie set by backend
      
      toast({
        title: "Successfully logged in",
        description: "Welcome back!",
      });
      
      // Redirect to dashboard
      router.push("/admin/dashboard");
    } else {
      // Handle error or missing tokens
      console.error("Missing tokens in callback URL");
      router.push("/login?error=oauth_failed");
    }
  }, [router, searchParams, toast]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing login...</p>
      </div>
    </div>
  );
}
