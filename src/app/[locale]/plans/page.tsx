'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { Badge } from '@/components/ui/badge';

export default function PlansPage() {
  const t = useTranslations('plans');
  const { displayPlans, isLoading, error, isAnnual, setIsAnnual } = usePlans();

  if (isLoading) {
    return (
      <div className="py-20 px-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 px-4 text-center">
        <p className="text-destructive">{t('errorLoading')}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-20 px-4">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your career journey
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 bg-muted/50 p-1 rounded-full inline-flex border mt-8">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              !isAnnual
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              isAnnual
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly <span className="text-xs text-green-600 font-bold">(Save 20%)</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {displayPlans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative rounded-2xl border p-8 shadow-sm flex flex-col ${
              plan.highlighted ? 'border-primary ring-1 ring-primary shadow-lg scale-105 bg-primary/5' : 'bg-card'
            }`}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </Badge>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
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
              variant={plan.highlighted ? 'default' : 'outline'}
              size="lg"
            >
              <Link href={plan.ctaLink}>{plan.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards (Visa, Mastercard) through Fawaterak for local payments.",
            },
            {
              q: "Can I cancel my subscription at any time?",
              a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.",
            },
            {
              q: "What is the difference between CV generations and parsing?",
              a: "CV generation creates a new CV from scratch or template. Parsing extracts data from an existing CV to populate your profile.",
            },
            // {
            //   q: "Do you offer refunds?",
            //   a: "We offer a 14-day money-back guarantee if you are not satisfied with our service.",
            // },
          ].map((faq, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium mb-2">{faq.q}</h4>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-16 text-muted-foreground text-sm">
        <p>Prices are in USD. Local taxes may apply.</p>
        <div className="mt-4 flex justify-center gap-4">
          <a href="#" className="hover:text-foreground">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
