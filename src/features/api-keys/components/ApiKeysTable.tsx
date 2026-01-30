"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiKey } from "../types/api-keys.types";

interface ApiKeysTableProps {
  keys: ApiKey[];
  onRevoke: (id: number) => void;
}

export function ApiKeysTable({ keys, onRevoke }: ApiKeysTableProps) {
  const t = useTranslations("apiKeys");

  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("maskedKey")}</TableHead>
            <TableHead>{t("created")}</TableHead>
            <TableHead>{t("lastUsed")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id}>
              <TableCell className="font-mono text-xs">
                {key.keyPreview}
              </TableCell>
              <TableCell>
                {new Date(key.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {key.lastUsedAt
                  ? new Date(key.lastUsedAt).toLocaleDateString()
                  : t("never")}
              </TableCell>
              <TableCell>
                <Badge
                  variant={key.isActive ? "default" : "destructive"}
                  className={
                    key.isActive ? "bg-green-600 hover:bg-green-700" : ""
                  }
                >
                  {key.isActive ? t("active") : t("revoked")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {key.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRevoke(key.id)}
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    {t("revoke")}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
