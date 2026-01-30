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
import type {
  ColumnDef,
  FilterOperation,
} from "@/components/generic-list/types";
import type { ApiUsageLog } from "@/services/api-usage.service";
import type { PaginationState } from "../types/analytics.types";

interface ApiLogsTableProps {
  apiLogs: ApiUsageLog[];
  pagination: PaginationState;
  isLoading: boolean;
  onPageChange: (page: number) => Promise<void>;
}

export function ApiLogsTable({
  apiLogs,
  pagination,
  isLoading,
  onPageChange,
}: ApiLogsTableProps) {
  const columns: ColumnDef<ApiUsageLog>[] = useMemo(
    () => [
      {
        key: "endpoint",
        label: "Endpoint",
        sortable: true,
        filterable: true,
        filterType: "text",
        filterOperation: "MATCH" as FilterOperation,
        render: (_, item) => (
          <span
            className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[200px] block"
            title={item.endpoint}
          >
            {item.endpoint}
          </span>
        ),
      },
      {
        key: "statusCode",
        label: "Status",
        render: (_, item) => (
          <Badge
            variant={
              item.statusCode >= 200 && item.statusCode < 300
                ? "default"
                : "destructive"
            }
            className="text-xs"
          >
            {item.statusCode}
          </Badge>
        ),
        sortable: true,
        filterable: true,
        filterType: "number",
        filterOperation: "EQUAL" as FilterOperation,
      },
      {
        key: "errorMessage",
        label: "Error",
        className: "hidden sm:table-cell",
        render: (_, item) => (
          <span
            className="text-red-500 text-xs truncate max-w-[80px] block"
            title={item.errorMessage || ""}
          >
            {item.errorMessage
              ? item.errorMessage.length > 15
                ? `${item.errorMessage.substring(0, 15)}...`
                : item.errorMessage
              : "-"}
          </span>
        ),
        filterable: true,
        filterType: "text",
        filterOperation: "MATCH" as FilterOperation,
      },
      {
        key: "timestamp",
        label: "Date",
        render: (_, item) => (
          <span className="text-xs whitespace-nowrap">
            {new Date(item.timestamp).toLocaleDateString()}
            <span className="hidden sm:inline ml-1">
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </span>
        ),
        sortable: true,
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg">API Usage Logs</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Detailed logs of your API activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <GenericList
          data={apiLogs}
          columns={columns}
          meta={pagination}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
