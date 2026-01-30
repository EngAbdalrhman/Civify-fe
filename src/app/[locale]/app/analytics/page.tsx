"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

import { useAnalyticsData } from "@/features/analytics/hooks/useAnalyticsData";
import {
  getDaysUntilReset,
  generateMockGenerationsData,
} from "@/features/analytics/utils/analytics.utils";
import { AnalyticsHeader } from "@/features/analytics/components/AnalyticsHeader";
import { StatsCards } from "@/features/analytics/components/StatsCards";
import { UsageChart } from "@/features/analytics/components/UsageChart";
import { SubscriptionStatus } from "@/features/analytics/components/SubscriptionStatus";
import { TokenSummaryCards } from "@/features/analytics/components/TokenSummaryCards";
import { TokenUsageTable } from "@/features/analytics/components/TokenUsageTable";
import { ApiLogsTable } from "@/features/analytics/components/ApiLogsTable";

export default function AnalyticsPage() {
  const {
    subscription,
    apiLogs,
    tokenUsage,
    tokenUsageSummary,
    logsPagination,
    tokenPagination,
    isLoading,
    error,
    canViewAnalytics,
    canViewApiLogs,
    handleLogsPageChange,
    handleTokenPageChange,
    loadSubscriptionData,
  } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!canViewAnalytics) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-center">
          You don't have permission to view analytics.
          <br />
          Please subscribe to a plan to access this feature.
        </p>
        <Button asChild>
          <Link href="/plans">View Plans</Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Unable to Load Data</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadSubscriptionData}>Try Again</Button>
      </div>
    );
  }

  const daysUntilReset = getDaysUntilReset(subscription?.usageResetDate);
  const chartData = generateMockGenerationsData(subscription?.currentCvCount);

  return (
    <PermissionGuard permissions={["STATS.VIEW", "API_USAGE.VIEW"]}>
      <div className="space-y-6 sm:space-y-8">
        <AnalyticsHeader daysUntilReset={daysUntilReset} />

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 sm:w-fit sm:h-9 sm:gap-0">
            <TabsTrigger value="stats" className="text-xs sm:text-sm">
              General Statistics
            </TabsTrigger>
            <TabsTrigger value="token-usage" className="text-xs sm:text-sm">
              <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              Token History
            </TabsTrigger>
            {canViewApiLogs && (
              <TabsTrigger value="logs" className="text-xs sm:text-sm">
                API Logs
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <StatsCards subscription={subscription} />
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
              <UsageChart data={chartData} />
              <SubscriptionStatus subscription={subscription} />
            </div>
          </TabsContent>

          <TabsContent value="token-usage" className="space-y-6">
            <TokenSummaryCards tokenUsageSummary={tokenUsageSummary} />
            <TokenUsageTable
              tokenUsage={tokenUsage}
              pagination={tokenPagination}
              isLoading={isLoading}
              onPageChange={handleTokenPageChange}
            />
          </TabsContent>

          {canViewApiLogs && (
            <TabsContent value="logs">
              <ApiLogsTable
                apiLogs={apiLogs}
                pagination={logsPagination}
                isLoading={isLoading}
                onPageChange={handleLogsPageChange}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
