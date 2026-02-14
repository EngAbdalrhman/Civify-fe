"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { LayoutDashboard, Shield, ShieldX } from 'lucide-react';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { usePermissions } from '@/contexts/PermissionContext';
import { ADMIN_MENU_ITEMS, ADMIN_ACTION_PERMISSIONS } from '@/config/adminMenuConfig';
import { Button } from '@/components/ui/button';
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const { permissions, isLoading, hasPermission } = usePermissions();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user has access to admin dashboard at all
  const hasAdminAccess = isLoading || hasPermission(ADMIN_ACTION_PERMISSIONS.ADMIN_DASHBOARD_VIEW);

  // Helper to check if a link is active
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
      active 
        ? `bg-gray-300/30 ${mounted && resolvedTheme === 'dark' ? 'text-white' : 'text-grey-700'} translate-x-1` 
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1'
    }`;
  };

  // Filter menu items based on user permissions
  const allowedMenuItems = ADMIN_MENU_ITEMS.filter((item) => {
    // If loading, show all (skeleton state)
    if (isLoading) return true;
    // Only show items user has permission for
    return hasPermission(item.permission);
  });

  // Show access denied if user doesn't have admin access
  if (!isLoading && !hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don&apos;t have permission to access the admin dashboard. 
            Contact your administrator if you believe this is an error.
          </p>
          <Button onClick={() => router.push('/app')} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 ltr:border-r rtl:border-l bg-background p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Image
                      src={mounted && resolvedTheme === 'dark' ? '/civify-logo-simple-dark-2.png' : '/civify-logo-simple.png'}
                      alt="Civify Admin"
                      width={75}
                      height={35}
                      className="object-contain"
                    />
                  </div>
                </Link>
            </div>
             <div className="grid flex-1 ltr:text-left rtl:text-right text-sm leading-tight">
              <span className="truncate font-semibold">Civify Admin</span>
              <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>
          
          <nav className="space-y-1">
            {isLoading ? (
              // Show skeleton while loading permissions
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-9 bg-muted/50 rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              allowedMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path}
                    href={item.path} 
                    className={getLinkClasses(item.path)}
                  >
                    <Icon className="h-4 w-4" />
                    {t(item.labelKey)}
                  </Link>
                );
              })
            )}
          </nav>
          
          <div className="pt-4 border-t">
            <Link 
              href="/app" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('dashboard')}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <DashboardNavbar />
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
