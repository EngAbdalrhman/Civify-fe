"use client";

import { DashboardNavbar } from "@/components/DashboardNavbar";
import { usePathname } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/utils/cookies";
import { OnboardingProvider, TourProvider } from "@/features/onboarding";
import { NotificationStreamProvider } from "@/providers/NotificationStreamProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Sidebar collapse state - default collapsed for resume builder
  const isResumeBuilderPage = pathname.includes("/resume-builder");
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(isResumeBuilderPage);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Update sidebar state when navigating to/from resume builder
  useEffect(() => {
    setIsSidebarCollapsed(isResumeBuilderPage);
  }, [isResumeBuilderPage]);

  // Avoid hydration mismatch and verify auth state
  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);
    setIsAuthChecking(false);
  }, [pathname]);

  // Re-sync auth state when the token is refreshed by the API client
  useEffect(() => {
    const handleAuthChange = () => {
      const token = getAccessToken();
      setIsAuthenticated(!!token);
    };
    window.addEventListener("auth-state-changed", handleAuthChange);
    window.addEventListener("civify:session-updated", handleAuthChange);
    return () => {
      window.removeEventListener("auth-state-changed", handleAuthChange);
      window.removeEventListener("civify:session-updated", handleAuthChange);
    };
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const mainMargin = isSidebarCollapsed
    ? "md:ltr:ml-16 md:rtl:mr-16"
    : "md:ltr:ml-64 md:rtl:mr-64";

  return (
    <OnboardingProvider>
      <NotificationStreamProvider>
      <TourProvider>
        <div className="flex min-h-screen bg-background">
        <AppSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isAuthenticated={isAuthenticated}
          isAuthChecking={isAuthChecking}
        />

        {/* Main Content Wrapper */}
        <div
          className={cn(
            "flex-1 flex flex-col transition-all duration-300 bg-zinc-50 dark:bg-zinc-950",
            mainMargin,
            isResumeBuilderPage ? "h-screen overflow-hidden" : "min-h-screen",
          )}
        >
          {/* Mobile Header with Menu Toggle */}
          <div className="flex items-center md:hidden border-b bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="m-2"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            >
              {isMobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div className="flex-1">
              <DashboardNavbar />
            </div>
          </div>
          {/* Desktop Navbar */}
          <div className="hidden md:block">
            <DashboardNavbar />
          </div>

          <div
            className={cn(
              "flex flex-1",
              isResumeBuilderPage ? "overflow-hidden" : "overflow-hidden",
            )}
          >
            {/* Main Page Content */}
            <main
              className={cn(
                "flex-1",
                isResumeBuilderPage ? "overflow-hidden" : "overflow-y-auto p-6",
              )}
            >
              {isResumeBuilderPage ? (
                children
              ) : (
                <div className="max-w-7xl mx-auto space-y-6">{children}</div>
              )}
            </main>
          </div>
        </div>
      </div>
      </TourProvider>
      </NotificationStreamProvider>
    </OnboardingProvider>
  );
}
