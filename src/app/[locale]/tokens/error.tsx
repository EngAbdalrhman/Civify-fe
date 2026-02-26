"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon & Glow Effect */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
          <div className="relative bg-destructive/10 p-4 rounded-full border border-destructive/20 shadow-sm">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground">
            We encountered an unexpected issue while loading the token packages.
            Don't worry, your data is safe.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => reset()}
            size="lg"
            variant="default"
            className="w-full sm:w-auto gap-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/app" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2 transition-all hover:bg-muted hover:text-black text-foreground"
            >
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>

        {/* Developer Error Context (visible in dev mode only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border/50 text-left overflow-hidden">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message || "Unknown error occurred"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
