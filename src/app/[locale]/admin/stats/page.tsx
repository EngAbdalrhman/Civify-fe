import { useTranslations } from 'next-intl';

export default function StatsPage() {
  const t = useTranslations('admin.stats');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">Platform performance and revenue statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">{t('revenue')}</h3>
          <p className="text-3xl font-bold mt-2">$45,231</p>
          <span className="text-xs text-green-500 font-medium">+20.1% from last month</span>
        </div>
        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">{t('conversions')}</h3>
          <p className="text-3xl font-bold mt-2">3.2%</p>
          <span className="text-xs text-green-500 font-medium">+1.2% from last month</span>
        </div>
        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">{t('growth')}</h3>
          <p className="text-3xl font-bold mt-2">+12.5%</p>
          <span className="text-xs text-green-500 font-medium">+4.3% from last month</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6 shadow-sm h-[300px] flex items-center justify-center bg-muted/10">
          <p className="text-muted-foreground">Revenue Chart Placeholder</p>
        </div>
        <div className="rounded-lg border p-6 shadow-sm h-[300px] flex items-center justify-center bg-muted/10">
          <p className="text-muted-foreground">User Growth Chart Placeholder</p>
        </div>
      </div>
    </div>
  );
}
