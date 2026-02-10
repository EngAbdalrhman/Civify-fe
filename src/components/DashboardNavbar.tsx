"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { User, LogIn, Settings, LogOut, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks";
import { ThemeToggle } from "./theme-toggle";
import { Link } from "@/i18n/routing";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { getAccessToken } from "@/utils/cookies";
import apiClient from "@/api/client";

export function DashboardNavbar() {
  const t = useTranslations();
  const locale = useLocale();
  const { logout, isLoggingOut } = useLogout();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<{ firstName: string; username: string } | null>(null);

  // Check authentication status on mount and fetch profile
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      const isAuth = !!token;
      setIsAuthenticated(isAuth);

      if (isAuth && !userProfile) {
        try {
          const response = await apiClient.get<{ firstName: string; username: string }>('/v1/users/me');
          setUserProfile(response.data);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    };

    checkAuth();

    // Re-check on window focus (in case user logs in/out in another tab)
    window.addEventListener("focus", checkAuth);
    // Also poll periodically to catch cookie changes
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener("focus", checkAuth);
      clearInterval(interval);
    };
  }, [userProfile]); // Added userProfile to dependency to avoid refetching loop if strict mode, though logic prevents it. Actually checkAuth calls setUserProfile only if !userProfile.

  // Date Logic
  const getFormattedDate = () => {
    const now = new Date();
    if (locale === 'ar') {
       return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(now);
    }
    
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(now);
  };

  const formattedDate = getFormattedDate();
  const displayName = userProfile?.firstName || userProfile?.username || "User";

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4 flex-1">
        {/* Date / Welcome */}
        <div className="hidden md:block text-sm text-muted-foreground mr-4">
          <div className="font-medium text-foreground">
             {isAuthenticated && (
               <span>
                 {t('common.welcome')}, {displayName}
               </span>
             )}
          </div>
          <div>{formattedDate}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <LanguageSwitcher />
        <ThemeToggle />

        {/* Real-time Notifications - only show for authenticated users */}
        {isAuthenticated && <NotificationBell />}

        {/* User Profile / Sign In */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href="/app/profile"
                  className="w-full cursor-pointer flex items-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("dashboard.personalPage.profile")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/app/billing"
                  className="w-full cursor-pointer flex items-center"
                >
                  <Receipt className="mr-2 h-4 w-4" />
                  <span>{t("nav.billing")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/app/settings"
                  className="w-full cursor-pointer flex items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("nav.settings")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 cursor-pointer flex items-center"
                onClick={logout}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? t("nav.logout") + "..." : t("nav.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4 mr-2" />
              {t("nav.signIn")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
