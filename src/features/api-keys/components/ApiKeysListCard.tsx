"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ApiKeysTable } from "./ApiKeysTable";
import { ApiKeysMobileCard } from "./ApiKeysMobileCard";
import type { ApiKey } from "../types/api-keys.types";

interface ApiKeysListCardProps {
  keys: ApiKey[];
  isLoading: boolean;
  onRevoke: (id: number) => void;
}

export function ApiKeysListCard({
  keys,
  isLoading,
  onRevoke,
}: ApiKeysListCardProps) {
  const t = useTranslations("apiKeys");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("existingKeys")}</CardTitle>
        <CardDescription>{t("existingKeysDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t("noKeys")}</p>
          </div>
        ) : (
          <>
            <ApiKeysMobileCard keys={keys} onRevoke={onRevoke} />
            <ApiKeysTable keys={keys} onRevoke={onRevoke} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
