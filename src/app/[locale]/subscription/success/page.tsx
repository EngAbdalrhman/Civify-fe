import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function SuccessPage() {
  const t = useTranslations('subscription.success');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-green-100 p-6 mb-6 dark:bg-green-900/20">
        <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-500" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        {t('message')}
      </p>
      
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/app">{t('goToDashboard')}</Link>
        </Button>
        <Button variant="outline" size="lg">
          {t('viewReceipt')}
        </Button>
      </div>
    </div>
  );
}
