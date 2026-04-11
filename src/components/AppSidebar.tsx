"use client";

import { useTranslations } from "next-intl";
import {
  BarChart2,
  UploadCloud,
  LayoutDashboard,
  Shield,
  Key,
  HelpCircle,
  Zap,
  FileEdit,
  PanelLeftClose,
  PanelLeft,
  Target,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Link, usePathname } from "@/i18n/routing";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/utils/cookies";
import { useActiveSubscription } from "@/hooks/useSubscription";

interface AppSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isAuthenticated: boolean;
  isAuthChecking: boolean;
}

export function AppSidebar({
  isMobileOpen,
  setIsMobileOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isAuthenticated,
  isAuthChecking,
}: AppSidebarProps) {
  const t = useTranslations("nav");
  const { isAdmin } = useAuth();
  const { hasAnyPermission, groupName, isLoading } = usePermissions();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: activeSubscription, isLoading: isPlanLoading } =
    useActiveSubscription();
  const planName = activeSubscription?.planName || null;

  // Permission checks for menu items
  const canViewApiKeys = hasAnyPermission(["API.ACCESS", "API.KEY.CREATE"]);
  const canViewAnalytics = hasAnyPermission(["STATS.VIEW", "API_USAGE.VIEW"]);
  const canViewJobMatches = hasAnyPermission(["CV.JOB_MATCH"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to check if a link is active
  const isActive = (path: string) => {
    if (path === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(path);
  };

  const isMobileExpanded = isMobileOpen;
  const shouldShowCollapsed = isSidebarCollapsed && !isMobileExpanded;

  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    return cn(
      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
      active
        ? `bg-gray-300/30 ${mounted && resolvedTheme === "dark" ? "text-white" : "text-grey-700"} translate-x-1`
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1",
      shouldShowCollapsed && "justify-center px-2",
    );
  };

  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/civify-logo-simple-dark-2.png"
      : "/civify-logo-simple.png";

  const sidebarWidth = shouldShowCollapsed ? "w-16" : "w-64";

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={cn(
          "border-r bg-background flex flex-col fixed inset-y-0 z-50 transition-all duration-300",
          sidebarWidth,
          // Mobile: hidden by default, show when isMobileOpen is true
          "max-md:-translate-x-full max-md:rtl:translate-x-full",
          isMobileOpen && "max-md:translate-x-0 max-md:rtl:translate-x-0",
        )}
      >
        <div className={cn("p-4", shouldShowCollapsed ? "px-2" : "p-6")}>
          <div
            className={cn(
              "flex items-center gap-2 mb-8",
              shouldShowCollapsed && "justify-center",
            )}
          >
            {/* Logo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Image
                    src={logoSrc}
                    alt="Civify Logo"
                    width={shouldShowCollapsed ? 32 : 75}
                    height={shouldShowCollapsed ? 32 : 35}
                    className="object-contain"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>
              </Link>
            </div>
            {!shouldShowCollapsed && (
              <div className="grid flex-1 ltr:text-left rtl:text-right text-sm leading-tight">
                <span className="truncate font-semibold">Civify</span>
                <span className="truncate text-xs text-muted-foreground mt-1">
                  {!mounted ||
                  isAuthChecking ||
                  (isAuthenticated && (isLoading || isPlanLoading)) ? (
                    <span className="animate-pulse bg-muted rounded h-3 w-16 inline-block" />
                  ) : (
                    groupName ||
                    planName ||
                    (isAuthenticated ? t("freePlan") : t("guest"))
                  )}
                </span>
              </div>
            )}
          </div>

          <nav data-tour="sidebar-nav" className="space-y-1">
            {/* Dashboard - authenticated only */}
            {isAuthenticated && (
              <Link
                href="/app"
                className={getLinkClasses("/app")}
                title={shouldShowCollapsed ? t("dashboard") : undefined}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!shouldShowCollapsed && t("dashboard")}
              </Link>
            )}

            {/* Resume Builder - visible for all users (guests can use it) */}
            <Link
              href="/app/resume-builder"
              className={getLinkClasses("/app/resume-builder")}
              title={shouldShowCollapsed ? t("resumeBuilder") : undefined}
            >
              <FileEdit className="h-4 w-4 shrink-0" />
              {!shouldShowCollapsed && t("resumeBuilder")}
            </Link>

            {/* Upload CV - visible for all (guests redirected on action) */}
            <Link
              href="/app/upload"
              className={getLinkClasses("/app/upload")}
              title={shouldShowCollapsed ? t("upload") : undefined}
            >
              <UploadCloud className="h-4 w-4 shrink-0" />
              {!shouldShowCollapsed && t("upload")}
            </Link>

            {/* Job Matches Analytics */}
            {isAuthenticated && canViewJobMatches && (
              <Link
                href="/app/job-matches"
                className={getLinkClasses("/app/job-matches")}
                title={shouldShowCollapsed ? "Job Matches" : undefined}
              >
                <Target className="h-4 w-4 shrink-0" />
                {!shouldShowCollapsed && "Job Matches"}
              </Link>
            )}

            {/* Analytics - requires STATS.VIEW or API_USAGE.VIEW */}
            {isAuthenticated && canViewAnalytics && (
              <Link
                href="/app/analytics"
                className={getLinkClasses("/app/analytics")}
                title={shouldShowCollapsed ? t("analytics") : undefined}
              >
                <BarChart2 className="h-4 w-4 shrink-0" />
                {!shouldShowCollapsed && t("analytics")}
              </Link>
            )}

            {/* API Keys - requires API.ACCESS or API.KEY.CREATE */}
            {isAuthenticated && canViewApiKeys && (
              <Link
                href="/app/api-keys"
                className={getLinkClasses("/app/api-keys")}
                title={shouldShowCollapsed ? t("apiKeys") : undefined}
              >
                <Key className="h-4 w-4 shrink-0" />
                {!shouldShowCollapsed && t("apiKeys")}
              </Link>
            )}

            {/* Buy Tokens - authenticated only */}
            {isAuthenticated && (
              <Link
                href="/app/tokens"
                className={getLinkClasses("/app/tokens")}
                title={shouldShowCollapsed ? t("buyTokens") : undefined}
              >
                <Zap className="h-4 w-4 shrink-0" />
                {!shouldShowCollapsed && t("buyTokens")}
              </Link>
            )}

            {/* Help Center - always visible */}
            <Link
              href="/app/help"
              className={cn(getLinkClasses("/app/help"), "mt-4")}
              title={shouldShowCollapsed ? t("helpCenter") : undefined}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              {!shouldShowCollapsed && t("helpCenter")}
            </Link>

            {isAdmin && (
              <Link
                href="/admin/users"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground mt-4 border-t pt-4",
                  shouldShowCollapsed && "justify-center px-2",
                )}
                title={shouldShowCollapsed ? t("adminDashboard") : undefined}
              >
                <Shield className="h-4 w-4 shrink-0" />
                {!shouldShowCollapsed && t("adminDashboard")}
              </Link>
            )}
          </nav>
        </div>

        {/* Sidebar Toggle Button */}
        <div
          className={cn("mt-auto p-4 border-t", shouldShowCollapsed && "px-2")}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={cn(
              "w-full hidden md:flex",
              shouldShowCollapsed ? "justify-center px-2" : "justify-start",
            )}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {shouldShowCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
