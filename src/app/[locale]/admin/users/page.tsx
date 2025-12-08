import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const t = useTranslations('admin.users');
  const common = useTranslations('common');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Manage platform users and roles</p>
        </div>
        <Button>{common('create')}</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('totalUsers')}</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">12,345</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('activeUsers')}</h3>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">8,901</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('newUsers')}</h3>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">+123</div>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <div className="text-center py-10 text-muted-foreground">
            User table component will be placed here
          </div>
        </div>
      </div>
    </div>
  );
}
