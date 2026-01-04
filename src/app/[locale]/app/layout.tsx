"use client";

import { useTranslations } from 'next-intl';
import { 
  User,
  BarChart2,
  Settings,
  UploadCloud,
  LayoutDashboard,
  Shield,
  Key,
  HelpCircle,
  Zap,
  FileEdit,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/contexts/PermissionContext';
import { Link, usePathname } from '@/i18n/routing';
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('nav');
  const { isAdmin } = useAuth();
  const { hasAnyPermission, groupName } = usePermissions();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);

  // Sidebar collapse state - default collapsed for resume builder
  const isResumeBuilderPage = pathname.includes('/resume-builder');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isResumeBuilderPage);

  // Permission checks for menu items
  const canViewApiKeys = hasAnyPermission(['API.ACCESS', 'API.KEY.CREATE']);
  const canViewAnalytics = hasAnyPermission(['STATS.VIEW', 'API_USAGE.VIEW']);

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

  // Update sidebar state when navigating to/from resume builder
  useEffect(() => {
    setIsSidebarCollapsed(isResumeBuilderPage);
  }, [isResumeBuilderPage]);

  // Fetch subscription plan name
  useEffect(() => {
    const fetchSubscription = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!token) return;
      
      try {
        const response = await apiClient.get('/v1/subscriptions/my-subscription');
        setPlanName(response.data?.planName || null);
      } catch {
        // User might not have a subscription
      }
    };
    fetchSubscription();
  }, []);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to check if a link is active
  const isActive = (path: string) => {
    if (path === '/app') {
      return pathname === '/app';
    }
    return pathname.startsWith(path);
  };

  const isUploadPage = pathname.includes('/upload');

  const getLinkClasses = (path: string) => {
     const active = isActive(path);
     return cn(
       "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
       active 
         ? `bg-gray-300/30 ${mounted && resolvedTheme === 'dark' ? 'text-white' : 'text-grey-700'} translate-x-1` 
         : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1',
       isSidebarCollapsed && "justify-center px-2"
     );
  };

  // Determine logo based on theme
  const logoSrc = mounted && resolvedTheme === 'dark' 
    ? '/civify-logo-simple-dark-2.png' 
    : '/civify-logo-simple.png';

  const sidebarWidth = isSidebarCollapsed ? 'w-16' : 'w-64';
  const mainMargin = isSidebarCollapsed ? 'ltr:ml-16 rtl:mr-16' : 'ltr:ml-64 rtl:mr-64';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <aside className={cn(
        "border-r bg-background flex flex-col fixed inset-y-0 z-50 transition-all duration-300",
        sidebarWidth
      )}>
        <div className={cn("p-4", isSidebarCollapsed ? "px-2" : "p-6")}>
          <div className={cn("flex items-center gap-2 mb-8", isSidebarCollapsed && "justify-center")}>
           {/* Logo */}
           <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Image
                      src={isSidebarCollapsed ? '/civify-logo-simple.png' : logoSrc}
                      alt="Civify Logo"
                      width={isSidebarCollapsed ? 32 : 75}
                      height={isSidebarCollapsed ? 32 : 35}
                      className="object-contain"
                    />
                  </div>
                </Link>
            </div>
            {!isSidebarCollapsed && (
              <div className="grid flex-1 ltr:text-left rtl:text-right text-sm leading-tight">
                 <span className="truncate font-semibold">Civify</span>
                 <span className="truncate text-xs text-muted-foreground">
                   {groupName || planName || (isAuthenticated ? t('freePlan') : t('guest'))}
                 </span>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {/* Dashboard - authenticated only */}
            {isAuthenticated && (
              <Link 
                href="/app" 
                className={getLinkClasses('/app')}
                title={isSidebarCollapsed ? t('dashboard') : undefined}
              >
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                {!isSidebarCollapsed && t('dashboard')}
              </Link>
            )}
            
            {/* Resume Builder - visible for all users (guests can use it) */}
            <Link 
              href="/app/resume-builder" 
              className={getLinkClasses('/app/resume-builder')}
              title={isSidebarCollapsed ? t('resumeBuilder') : undefined}
            >
              <FileEdit className="h-4 w-4 flex-shrink-0" />
              {!isSidebarCollapsed && t('resumeBuilder')}
            </Link>
            
            {/* Upload CV - visible for all (guests redirected on action) */}
            <Link 
              href="/app/upload" 
              className={getLinkClasses('/app/upload')}
              title={isSidebarCollapsed ? t('upload') : undefined}
            >
              <UploadCloud className="h-4 w-4 flex-shrink-0" />
              {!isSidebarCollapsed && t('upload')}
            </Link>
        
            {/* Analytics - requires STATS.VIEW or API_USAGE.VIEW */}
            {isAuthenticated && canViewAnalytics && (
              <Link 
                href="/app/analytics" 
                className={getLinkClasses('/app/analytics')}
                title={isSidebarCollapsed ? t('analytics') : undefined}
              >
                <BarChart2 className="h-4 w-4 flex-shrink-0" />
                {!isSidebarCollapsed && t('analytics')}
              </Link>
            )}
            
            {/* API Keys - requires API.ACCESS or API.KEY.CREATE */}
            {isAuthenticated && canViewApiKeys && (
              <Link 
                href="/app/api-keys" 
                className={getLinkClasses('/app/api-keys')}
                title={isSidebarCollapsed ? t('apiKeys') : undefined}
              >
                <Key className="h-4 w-4 flex-shrink-0" />
                {!isSidebarCollapsed && t('apiKeys')}
              </Link>
            )}
            
            {/* Buy Tokens - authenticated only */}
            {isAuthenticated && (
              <Link 
                href="/app/tokens" 
                className={getLinkClasses('/app/tokens')}
                title={isSidebarCollapsed ? t('buyTokens') : undefined}
              >
                <Zap className="h-4 w-4 flex-shrink-0" />
                {!isSidebarCollapsed && t('buyTokens')}
              </Link>
            )}
            
            {/* Help Center - always visible */}
            <Link 
              href="/app/help" 
              className={cn(getLinkClasses('/app/help'), "mt-4")}
              title={isSidebarCollapsed ? t('helpCenter') : undefined}
            >
              <HelpCircle className="h-4 w-4 flex-shrink-0" />
              {!isSidebarCollapsed && t('helpCenter')}
            </Link>

            {isAdmin && (
              <Link 
                href="/admin/users" 
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground mt-4 border-t pt-4",
                  isSidebarCollapsed && "justify-center px-2"
                )}
                title={isSidebarCollapsed ? t('adminDashboard') : undefined}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                {!isSidebarCollapsed && t('adminDashboard')}
              </Link>
            )}
          </nav>
        </div>

        {/* Sidebar Toggle Button */}
        <div className={cn("mt-auto p-4 border-t", isSidebarCollapsed && "px-2")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={cn("w-full", isSidebarCollapsed ? "justify-center px-2" : "justify-start")}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
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

      {/* Main Content Wrapper */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300", 
        mainMargin,
        isResumeBuilderPage ? "h-screen overflow-hidden" : "min-h-screen"
      )}>
        <DashboardNavbar />
        
        <div className={cn("flex flex-1", isResumeBuilderPage ? "overflow-hidden" : "overflow-hidden")}>
          {/* Main Page Content */}
          <main className={cn("flex-1", isResumeBuilderPage ? 'overflow-hidden' : 'overflow-y-auto p-6')}>
            {isResumeBuilderPage ? (
              children
            ) : (
              <div className="max-w-7xl mx-auto space-y-6">
                {children}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
