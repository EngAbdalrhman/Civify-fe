import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function PlansPage() {
  const t = useTranslations('plans');

  const plans = [
    {
      name: t('free'),
      price: '$0',
      period: t('monthly'),
      features: ['1 CV Template', 'Basic AI Suggestions', 'PDF Export', 'Watermark'],
      cta: t('selectPlan'),
      popular: false
    },
    {
      name: t('pro'),
      price: '$19',
      period: t('monthly'),
      features: ['Unlimited Templates', 'Advanced AI Writer', 'Word & PDF Export', 'No Watermark', 'Priority Support'],
      cta: t('upgrade'),
      popular: true
    },
    {
      name: t('enterprise'),
      price: '$99',
      period: t('monthly'),
      features: ['Everything in Pro', 'Team Management', 'Custom Branding', 'API Access', 'Dedicated Account Manager'],
      cta: t('selectPlan'),
      popular: false
    }
  ];

  return (
    <div className="py-20 px-4">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your career journey
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`relative rounded-2xl border p-8 shadow-sm flex flex-col ${
              plan.popular ? 'border-primary ring-1 ring-primary shadow-lg scale-105 bg-primary/5' : 'bg-card'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                <span className="ml-1 text-muted-foreground">/{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              asChild 
              className="w-full" 
              variant={plan.popular ? 'default' : 'outline'}
              size="lg"
            >
              <Link href="/subscription/confirm">{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
