import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { 
  Users, 
  CreditCard, 
  Tag, 
  BarChart3, 
  Activity, 
  LayoutDashboard 
} from 'lucide-react';
import { DashboardNavbar } from '@/components/DashboardNavbar';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('nav');

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 ltr:border-r rtl:border-l bg-background p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="h-6 w-6 rounded-md bg-primary" />
            <h2 className="text-lg font-semibold tracking-tight">{t('admin')}</h2>
          </div>
          
          <nav className="space-y-1">
            <Link 
              href="/admin/users" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              {t('users')}
            </Link>
            <Link 
              href="/admin/plans" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <CreditCard className="h-4 w-4" />
              {t('plans')}
            </Link>
            <Link 
              href="/admin/promos" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Tag className="h-4 w-4" />
              {t('promos')}
            </Link>
            <Link 
              href="/admin/stats" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              {t('stats')}
            </Link>
            <Link 
              href="/admin/api-usage" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
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
