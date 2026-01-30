"use client";

import { useTranslations } from "next-intl";

export function ApiKeysHeader() {
  const t = useTranslations("apiKeys");

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        {t("title")}
      </h1>
      <p className="text-sm md:text-base text-muted-foreground mt-2">
        {t("subtitle")}
      </p>
    </div>
  );
}
