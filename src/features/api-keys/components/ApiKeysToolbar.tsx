"use client";

import { useTranslations } from "next-intl";
import { Plus, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface ApiKeysToolbarProps {
  onGenerateClick: () => void;
}

export function ApiKeysToolbar({ onGenerateClick }: ApiKeysToolbarProps) {
  const t = useTranslations("apiKeys");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg md:text-xl font-semibold">{t("yourKeys")}</h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {t("manageKeys")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild size="sm" className="md:size-default">
          <Link href="/app/api-documentation">
            <Book className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            <span className="hidden xs:inline">{t("viewDocs")}</span>
            <span className="xs:hidden">Docs</span>
          </Link>
        </Button>
        <Button onClick={onGenerateClick}>
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {t("generateNew")}
        </Button>
      </div>
    </div>
  );
}
