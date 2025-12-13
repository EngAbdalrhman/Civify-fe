"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { 
  Users, 
  CreditCard, 
  Tag, 
  BarChart3, 
  Activity, 
  LayoutDashboard,
  Shield
} from 'lucide-react';
import { DashboardNavbar } from '@/components/DashboardNavbar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  // Helper to check if a link is active
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
      active 
        ? 'bg-gray-300/30 text-gray-700 translate-x-1' 
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1'
    }`;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 ltr:border-r rtl:border-l bg-background p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div className="grid flex-1 ltr:text-left rtl:text-right text-sm leading-tight">
              <span className="truncate font-semibold">Civify Admin</span>
              <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Link 
              href="/admin/users" 
              className={getLinkClasses('/admin/users')}
            >
              <Users className="h-4 w-4" />
              {t('users')}
            </Link>
            <Link 
              href="/admin/plans" 
              className={getLinkClasses('/admin/plans')}
            >
              <CreditCard className="h-4 w-4" />
              {t('plans')}
            </Link>
            <Link 
              href="/admin/promos" 
              className={getLinkClasses('/admin/promos')}
            >
              <Tag className="h-4 w-4" />
              {t('promos')}
            </Link>
            <Link 
              href="/admin/stats" 
              className={getLinkClasses('/admin/stats')}
            >
              <BarChart3 className="h-4 w-4" />
              {t('stats')}
            </Link>
            <Link 
              href="/admin/api-usage" 
              className={getLinkClasses('/admin/api-usage')}
            >
              <Activity className="h-4 w-4" />
              {t('apiUsage')}
            </Link>
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
