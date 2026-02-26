"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { User, LogIn, Settings, LogOut, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLogout } from "@/features/auth/hooks";
import { ThemeToggle } from "./theme-toggle";
import { Link } from "@/i18n/routing";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { getAccessToken } from "@/utils/cookies";

import { useUserProfile } from "@/hooks/useUserProfile";

export function DashboardNavbar() {
  const t = useTranslations();
  const locale = useLocale();
  const { logout, isLoggingOut } = useLogout();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { data: userProfile } = useUserProfile();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      const isAuth = !!token;
      setIsAuthenticated(isAuth);
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
  }, []);

  // Date Logic
  const getFormattedDate = () => {
    const now = new Date();
    if (locale === "ar") {
      return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
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
  const email = userProfile?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4 flex-1">
        {/* Date / Welcome */}
        <div className="hidden md:block text-sm text-muted-foreground mr-4">
          <div className="font-medium text-foreground">
            {isAuthenticated && (
              <span>
                {t("common.welcome")}, {displayName}
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
                className="relative h-10 w-10 rounded-full hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-transparent"
              >
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage
                    src={userProfile?.profilePictureUrl || undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[280px] p-0 rounded-[20px] shadow-2xl border-none overflow-hidden"
              align="end"
              forceMount
            >
              <div className="flex items-center gap-3 p-4 pb-3">
                <Avatar className="h-10 w-10 border border-border/10">
                  <AvatarImage
                    src={userProfile?.profilePictureUrl || undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-[15px] font-semibold text-foreground leading-tight tracking-tight">
                    {displayName}
                  </p>
                  <p className="text-[13px] text-muted-foreground/80 leading-normal">
                    {email}
                  </p>
                </div>
              </div>
              <div className="h-px bg-border/40 mx-4 mb-2" />
              <DropdownMenuGroup className="px-2 pb-2">
                <DropdownMenuItem
                  asChild
                  className="group p-2.5 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary data-[state=open]:bg-primary/5 data-[state=open]:text-primary transition-all duration-200"
                >
                  <Link
                    href="/app/profile"
                    className="flex items-center w-full"
                  >
                    <User className="mr-3 h-[18px] w-[18px] text-muted-foreground group-focus:text-primary transition-colors stroke-2" />
                    <span className="font-medium text-[14px]">
                      View Profile
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="group p-2.5 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary transition-all duration-200"
                >
                  <Link
                    href="/app/settings"
                    className="flex items-center w-full"
                  >
                    <Settings className="mr-3 h-[18px] w-[18px] text-muted-foreground group-focus:text-primary transition-colors stroke-2" />
                    <span className="font-medium text-[14px]">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="group p-2.5 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary transition-all duration-200"
                >
                  <Link
                    href="/app/billing"
                    className="flex items-center w-full"
                  >
                    <CreditCard className="mr-3 h-[18px] w-[18px] text-muted-foreground group-focus:text-primary transition-colors stroke-2" />
                    <span className="font-medium text-[14px]">
                      Subscription
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <div className="h-px bg-border/40 mx-4 my-1" />
              <div className="px-2 pb-2 pt-1">
                <DropdownMenuItem
                  className="group p-2.5 rounded-xl cursor-pointer focus:bg-red-50 text-foreground focus:text-red-600 transition-all duration-200"
                  onClick={logout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-3 h-[18px] w-[18px] text-muted-foreground group-focus:text-red-600 transition-colors stroke-2" />
                  <span className="font-medium text-[14px]">
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </span>
                </DropdownMenuItem>
              </div>
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
