"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenericList } from "@/components/generic-list/GenericList";
import type { ColumnDef } from "@/components/generic-list/types";
import type { TokenUsageLog } from "@/services/token-usage.service";
import type { PaginationState } from "../types/analytics.types";
import { format } from "date-fns";

interface TokenUsageTableProps {
  tokenUsage: TokenUsageLog[];
  pagination: PaginationState;
  isLoading: boolean;
  onPageChange: (page: number) => Promise<void>;
}

export function TokenUsageTable({
  tokenUsage,
  pagination,
  isLoading,
  onPageChange,
}: TokenUsageTableProps) {
  const columns: ColumnDef<TokenUsageLog>[] = useMemo(
    () => [
      {
        key: "usageType",
        label: "Type",
        render: (_, item) => {
          const type = item.usageType.replace("_", " ");
          return (
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {type}
            </Badge>
          );
        },
      },
      {
        key: "source",
        label: "Source",
        className: "hidden md:table-cell",
        render: (_, item) => {
          const variants: Record<string, "default" | "secondary" | "outline"> =
            {
              SUBSCRIPTION: "default",
              WALLET: "secondary",
              MIXED: "outline",
            };
          return (
            <Badge
              variant={variants[item.source] || "outline"}
              className="text-xs"
            >
              {item.source}
            </Badge>
          );
        },
      },
      {
        key: "tokensUsed",
        label: "Tokens",
        render: (_, item) => (
          <span className="text-sm font-medium">{item.tokensUsed}</span>
        ),
      },
      {
        key: "fromSubscription",
        label: "Plan",
        className: "hidden lg:table-cell",
      },
      {
        key: "fromWallet",
        label: "Wallet",
        className: "hidden lg:table-cell",
      },
      {
        key: "description",
        label: "Desc",
        className: "hidden sm:table-cell",
        render: (_, item) => {
          const desc = item.description;
          if (!desc) return "-";
          return (
            <span
              className="text-xs text-muted-foreground truncate max-w-[120px] block"
              title={desc}
            >
              {desc.length > 20 ? `${desc.substring(0, 20)}...` : desc}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        label: "Date",
        render: (_, item) => (
          <span className="text-xs whitespace-nowrap">
            {format(new Date(item.createdAt), "MMM dd")}
            <span className="hidden sm:inline ml-1">
              {format(new Date(item.createdAt), "HH:mm")}
            </span>
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg">
          Token Usage History
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Detailed log of your token consumption for CV parsing and other AI
          features.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <GenericList
          data={tokenUsage}
          columns={columns}
          meta={pagination}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
