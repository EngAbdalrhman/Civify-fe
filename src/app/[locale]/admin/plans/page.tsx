import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Package, Zap, Briefcase } from 'lucide-react';

export default function PlansPage() {
  const t = useTranslations('admin.plans');
  const common = useTranslations('common');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Manage subscription plans and features</p>
        </div>
        <Button>{t('createPlan')}</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Free Plan Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold text-xl">Free</h3>
                <p className="text-muted-foreground text-sm">Basic features</p>
              </div>
            </div>
            <span className="bg-secondary px-2 py-1 rounded text-xs font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="w-full">{common('edit')}</Button>
          </div>
        </div>

        {/* Pro Plan Card */}
        <div className="rounded-lg border p-6 shadow-sm border-primary/20 bg-primary/5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold text-xl">Pro</h3>
                <p className="text-muted-foreground text-sm">Advanced AI features</p>
              </div>
            </div>
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">Popular</span>
          </div>
          <div className="text-2xl font-bold mb-4">$19<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="w-full">{common('edit')}</Button>
          </div>
        </div>

        {/* Enterprise Plan Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-bold text-xl">Enterprise</h3>
                <p className="text-muted-foreground text-sm">For large teams</p>
              </div>
            </div>
            <span className="bg-secondary px-2 py-1 rounded text-xs font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold mb-4">$99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="w-full">{common('edit')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
