"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { User, LogIn } from "lucide-react";
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

export function DashboardNavbar() {
  const { logout, isLoggingOut } = useLogout();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    setIsAuthenticated(!!token);
    
    // Re-check on storage change (in case user logs in/out in another tab)
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem("auth_token");
      setIsAuthenticated(!!currentToken);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4 flex-1">
        {/* Date / Welcome */}
        <div className="hidden md:block text-sm text-muted-foreground mr-4">
          {date}
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
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-500 cursor-pointer"
                onClick={logout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

