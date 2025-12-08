import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function PromosPage() {
  const t = useTranslations('admin.promos');
  const common = useTranslations('common');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <Button>{t('createPromo')}</Button>
      </div>

      <div className="rounded-lg border shadow-sm">
        <div className="p-6">
          <div className="text-center py-10 text-muted-foreground">
            Promotions table component will be placed here
          </div>
        </div>
      </div>
    </div>
  );
}
