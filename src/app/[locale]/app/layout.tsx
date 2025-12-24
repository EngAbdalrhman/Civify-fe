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
  HelpCircle 
} from 'lucide-react';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { useAuth } from '@/hooks/use-auth';
import { Link, usePathname } from '@/i18n/routing';
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('nav');
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

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
     return `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
        active 
          ? 'bg-gray-300/30 text-gray-700 translate-x-1' 
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1'
     }`;
  };

  // Determine logo based on theme
  const logoSrc = mounted && resolvedTheme === 'dark' 
    ? '/civify-logo-simple-dark-2.png' 
    : '/civify-logo-simple.png';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="w-64 border-r bg-background flex flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
           {/* Logo */}
           <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Image
                      src={logoSrc}
                      alt="Civify Logo"
                      width={75}
                      height={35}
                      className="object-contain"
                    />
                  </div>
                </Link>
            </div>
            <div className="grid flex-1 ltr:text-left rtl:text-right text-sm leading-tight">
               <span className="truncate font-semibold">Civify</span>
               <span className="truncate text-xs text-muted-foreground">Pro Plan</span>
            </div>
          </div>

          <nav className="space-y-1">
            {/* Dashboard - authenticated only */}
            {isAuthenticated && (
              <Link 
                href="/app" 
                className={getLinkClasses('/app')}
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('dashboard')}
              </Link>
            )}
            
            {/* Upload CV - always visible (guest feature) */}
            <Link 
              href="/app/upload" 
              className={getLinkClasses('/app/upload')}
            >
              <UploadCloud className="h-4 w-4" />
              {t('upload')}
            </Link>
            
            {/* Analytics - authenticated only */}
            {isAuthenticated && (
              <Link 
                href="/app/analytics" 
                 className={getLinkClasses('/app/analytics')}
              >
                <BarChart2 className="h-4 w-4" />
                {t('analytics')}
              </Link>
            )}
            
            {/* API Keys - authenticated only */}
            {isAuthenticated && (
              <Link 
                href="/app/api-keys" 
                 className={getLinkClasses('/app/api-keys')}
              >
                <Key className="h-4 w-4" />
                API Keys
              </Link>
            )}
            
            {/* Settings - authenticated only */}
            {isAuthenticated && (
              <Link 
                href="/app/settings" 
                 className={getLinkClasses('/app/settings')}
              >
                <Settings className="h-4 w-4" />
                {t('settings')}
              </Link>
            )}
            
            {/* Help Center - always visible */}
            <Link 
              href="/app/help" 
               className={`${getLinkClasses('/app/help')} mt-4`}
            >
              <HelpCircle className="h-4 w-4" />
              Help Center
            </Link>

            {isAdmin && (
              <Link 
                href="/admin/users" 
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground mt-4 border-t pt-4"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 ltr:ml-64 rtl:mr-64 flex flex-col min-h-screen">
        <DashboardNavbar />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Main Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>

          {/* Right Utility Panel */}
          {isUploadPage && (
            <aside className="w-80 border-l bg-muted/10 p-6 hidden xl:block overflow-y-auto">
              <div className="space-y-6">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                  <div className="flex flex-col space-y-1.5 p-0">
                    <h3 className="font-semibold leading-none tracking-tight">AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">Ready to help you optimize.</p>
                  </div>
                  <div className="p-0 pt-4 text-sm">
                    <p className="text-muted-foreground">Select a resume section to get started with AI optimization tips.</p>
                  </div>
                </div>
                
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                   <h3 className="font-semibold mb-2">Quick Tips</h3>
                   <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                      <li>Use action verbs</li>
                      <li>Quantify achievements</li>
                      <li>Tailor to the job post</li>
                   </ul>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
