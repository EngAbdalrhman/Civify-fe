"use client";

import { cn } from "@/lib/utils";

interface BetaBadgeProps {
  variant?: "default" | "compact" | "pill";
  className?: string;
}

export function BetaBadge({ variant = "default", className }: BetaBadgeProps) {
  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
          "bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded",
          "animate-pulse shadow-sm shadow-amber-400/30",
          className
        )}
      >
        β BETA
      </span>
    );
  }

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold",
          "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full",
          "border border-purple-400/30 shadow-lg shadow-purple-500/20",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        Early Access
      </span>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
        "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10",
        "border border-amber-500/30 dark:border-amber-400/20",
        "backdrop-blur-sm",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
      </span>
      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
        🚀 Beta Access — Limited Spots Available
      </span>
    </div>
  );
}
