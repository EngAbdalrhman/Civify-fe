"use client";

import { useTranslations } from "next-intl";
import { McpDocumentation } from "@/components/mcp-docs/McpDocumentation";

export default function McpDocsContent() {
  const t = useTranslations("mcp-docs");
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <McpDocumentation />
      </div>
    </div>
  );
}
