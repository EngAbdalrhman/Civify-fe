"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft, Book } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ApiDocumentation } from '@/components/api-docs/ApiDocumentation';
import { useTranslations } from 'next-intl';

export default function ApiDocumentationPage() {
  const t = useTranslations('nav');
  
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/app/api-keys">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Book className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">{t('apiDocumentation')}</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {t('apiDocSubtitle')}
          </p>
        </div>
      </div>

      {/* Documentation Content */}
      <ApiDocumentation />
    </div>
  );
}
