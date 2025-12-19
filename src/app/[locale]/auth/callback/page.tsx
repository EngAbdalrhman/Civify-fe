"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract accessToken from query parameters
    const accessToken = searchParams.get("accessToken");

    if (accessToken) {
      // Store token in localStorage
      localStorage.setItem("auth_token", accessToken);
      
      // Show success message
      toast.success("Login successful! Redirecting...");
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/app");
      }, 1000);
    } else {
      // No token found - OAuth failed or was cancelled
      toast.error("Authentication failed. Please try again.");
      
      // Redirect to login
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
