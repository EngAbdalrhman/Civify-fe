"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ApiKey } from "../types/api-keys.types";

interface ApiKeysMobileCardProps {
  keys: ApiKey[];
  onRevoke: (id: number) => void;
}

export function ApiKeysMobileCard({ keys, onRevoke }: ApiKeysMobileCardProps) {
  const t = useTranslations("apiKeys");

  return (
    <div className="md:hidden space-y-2">
      {keys.map((key) => (
        <div key={key.id} className="border rounded-md p-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1 overflow-hidden">
              {key.name && (
                <span className="font-medium text-sm truncate">{key.name}</span>
              )}
              <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded truncate">
                {key.keyPreview}
              </code>
            </div>
            <Badge
              variant={key.isActive ? "default" : "destructive"}
              className={`text-xs shrink-0 ${key.isActive ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              {key.isActive ? t("active") : t("revoked")}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">{t("created")}: </span>
              <span className="font-medium">
                {new Date(key.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("lastUsed")}: </span>
              <span className="font-medium">
                {key.lastUsedAt
                  ? new Date(key.lastUsedAt).toLocaleDateString()
                  : t("never")}
              </span>
            </div>
          </div>
          {key.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRevoke(key.id)}
              className="w-full h-7 text-xs text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              {t("revoke")}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
