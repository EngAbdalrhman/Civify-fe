"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import { AppLogo } from "@/components/app/AppLogo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  LogOut,
  Settings,
  CreditCard,
  Key,
  FileText,
  Shield,
  ChevronDown,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { SettingsMenu } from "../SettingsMenu";

interface NavbarProps {
  userProfile?: {
    name?: string;
    email?: string;
    isAdmin?: boolean;
    plan?: string;
  } | null;
}

export function Navbar({ userProfile }: NavbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      router.push("/login");
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case "premium":
        return "bg-blue-500";
      case "enterprise":
        return "bg-purple-500";
      case "lifetime":
        return "bg-gradient-to-r from-yellow-500 to-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <AppLogo size="sm" />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            {/* API Management Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Key className="h-4 w-4 mr-2" />
                  API Management
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/api-keys")}
                  className="cursor-pointer"
                >
                  <Key className="mr-2 h-4 w-4" />
                  <span>API Keys</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/api-logs")}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>API Logs</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Subscription Plans Button */}
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/plans")}
              className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <CreditCard className="h-4 w-4" />
              Plans
            </Button>

            {userProfile?.isAdmin && (
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/dashboard")}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-100"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                      {getInitials(userProfile?.name, user.email || undefined)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {userProfile?.name || user.email?.split("@")[0]}
                    </span>
                    {userProfile?.plan && (
                      <Badge
                        className={`text-xs ${getPlanBadgeColor(
                          userProfile.plan
                        )} text-white`}
                      >
                        {userProfile.plan.charAt(0).toUpperCase() +
                          userProfile.plan.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel
                  onClick={() => router.push("/dashboard/profile")}
                  className="cursor-pointer"
                >
                  <div className="flex flex-row space-y-1 items-center">
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium leading-none">
                        {userProfile?.name || user.email?.split("@")[0]}
                      </p>
                      <span className="text-sm font-medium">
                        Profile Settings
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/plans")}
                  className="cursor-pointer"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Plans & Billing</span>
                </DropdownMenuItem>

                <SettingsMenu />

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoading ? "Signing out..." : "Sign Out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
