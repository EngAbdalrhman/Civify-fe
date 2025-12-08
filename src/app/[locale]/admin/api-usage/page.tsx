import { useTranslations } from 'next-intl';

export default function ApiUsagePage() {
  const t = useTranslations('admin.apiUsage');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">Monitor API consumption and rate limits</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">{t('requests')}</h3>
          <p className="text-3xl font-bold mt-2">1.2M</p>
          <span className="text-xs text-muted-foreground">Total requests this month</span>
        </div>
        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">{t('limit')}</h3>
          <p className="text-3xl font-bold mt-2">5M</p>
          <span className="text-xs text-muted-foreground">Monthly quota</span>
        </div>
        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">{t('remaining')}</h3>
          <p className="text-3xl font-bold mt-2">3.8M</p>
          <span className="text-xs text-green-500 font-medium">76% remaining</span>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="font-semibold mb-4">Usage History</h3>
          <div className="h-[300px] flex items-center justify-center bg-muted/10 rounded">
            <p className="text-muted-foreground">API Usage Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
