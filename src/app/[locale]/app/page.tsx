import { useTranslations } from 'next-intl';
import { User as UserIcon, FileText, Activity as ActivityIcon } from 'lucide-react';

export default function PersonalPage() {
  const t = useTranslations('dashboard.personalPage');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          Manage your profile and view your CVs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="flex items-center gap-2 font-semibold mb-2">
            <UserIcon className="h-4 w-4 text-primary" />
            {t('profile')}
          </h3>
          <p className="text-sm text-muted-foreground">
            Update your personal information
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="flex items-center gap-2 font-semibold mb-2">
            <FileText className="h-4 w-4 text-primary" />
            {t('cvs')}
          </h3>
          <p className="text-sm text-muted-foreground">
            View and manage your CVs
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="flex items-center gap-2 font-semibold mb-2">
            <ActivityIcon className="h-4 w-4 text-primary" />
            {t('recent')}
          </h3>
          <p className="text-sm text-muted-foreground">
            Your recent activity
          </p>
        </div>
      </div>
    </div>
  );
}
