"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Activity,
  FileText,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
  Coins,
} from "lucide-react";
import { subscriptionService } from "@/services/subscription.service";
import {
  apiUsageService,
  type ApiUsageLog,
  type ApiUsageStats,
} from "@/services/api-usage.service";
import {
  tokenUsageService,
  type TokenUsageLog,
  type TokenUsageSummary,
} from "@/services/token-usage.service";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GenericList,
  buildInputDataModel,
} from "@/components/generic-list/GenericList";
import { ColumnDef, FilterOperation } from "@/components/generic-list/types";
import { format } from "date-fns";

import type { UserSubscription } from "@/features/plans/types";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const router = useRouter();
  const { permissions, isLoading: isAuthLoading, hasPermission } = useAuth();

  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<ApiUsageLog[]>([]);
  const [apiStats, setApiStats] = useState<ApiUsageStats | null>(null);

  // Token usage state
  const [tokenUsage, setTokenUsage] = useState<TokenUsageLog[]>([]);
  const [tokenUsageSummary, setTokenUsageSummary] =
    useState<TokenUsageSummary | null>(null);
  const [tokenPagination, setTokenPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Pagination for logs
  const [logsPagination, setLogsPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Check permission - user should have CV.CREATE to view their analytics
  const canViewAnalytics = hasPermission("STATS.VIEW");
  const canViewApiLogs = hasPermission("API.ACCESS");

  useEffect(() => {
    if (isAuthLoading) return;

    if (!canViewAnalytics) {
      setIsLoading(false);
      return;
    }

    loadSubscriptionData();
  }, [isAuthLoading, canViewAnalytics]);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      // Fetch subscription independently so it doesn't block other data
      try {
        const subData = await subscriptionService.getMyActiveSubscription();
        setSubscription(subData);
      } catch (err) {
        console.warn("No active subscription or error fetching it:", err);
      }

      // Fetch other stats
      const [logsData, statsData, tokenData, tokenSummaryData] =
        await Promise.all([
          // Only fetch logs if user has permission
          canViewApiLogs
            ? apiUsageService.getMyLogs({ page: 0, size: 10 }).catch(() => ({
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: 10,
                page: 0,
                number: 0,
              }))
            : Promise.resolve({
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: 10,
                page: 0,
                number: 0,
              }),
          apiUsageService.getMyStats().catch(() => null),
          tokenUsageService.getMyUsageHistory(0, 10).catch(() => ({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: 10,
            number: 0,
          })),
          tokenUsageService.getMySummary().catch(() => null),
        ]);

      setApiLogs(logsData.content || []);
      setLogsPagination({
        page: logsData.page || 0,
        size: logsData.size || 10,
        totalElements: logsData.totalElements || 0,
        totalPages: logsData.totalPages || 0,
      });

      setApiStats(statsData);

      // Set token usage data
      setTokenUsage(tokenData.content || []);
      setTokenPagination({
        page: tokenData.number || 0,
        size: tokenData.size || 10,
        totalElements: tokenData.totalElements || 0,
        totalPages: tokenData.totalPages || 0,
      });
      setTokenUsageSummary(tokenSummaryData);
    } catch (err) {
      console.error("Error loading analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate usage percentages
  const cvUsagePercent = subscription?.cvLimit
    ? Math.round((subscription.currentCvCount / subscription.cvLimit) * 100)
    : 0;

  // Format remaining days until reset
  const getDaysUntilReset = () => {
    if (!subscription?.usageResetDate) return null;
    const resetDate = new Date(subscription.usageResetDate);
    const today = new Date();
    const diffTime = resetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Mock data for charts (would come from API in production)
  const mockGenerationsData = [
    {
      name: "Week 1",
      generations: Math.round(
        subscription?.currentCvCount ? subscription.currentCvCount * 0.2 : 0,
      ),
    },
    {
      name: "Week 2",
      generations: Math.round(
        subscription?.currentCvCount ? subscription.currentCvCount * 0.3 : 0,
      ),
    },
    {
      name: "Week 3",
      generations: Math.round(
        subscription?.currentCvCount ? subscription.currentCvCount * 0.25 : 0,
      ),
    },
    {
      name: "Week 4",
      generations: Math.round(
        subscription?.currentCvCount ? subscription.currentCvCount * 0.25 : 0,
      ),
    },
  ];

  // Logs Columns Definition
  const logsColumns: ColumnDef<ApiUsageLog>[] = useMemo(
    () => [
      {
        key: "endpoint",
        label: "Endpoint",
        sortable: true,
        filterable: true,
        filterType: "text",
        filterOperation: FilterOperation.MATCH,
        render: (_, item) => (
          <span
            className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[200px] block"
            title={item.endpoint}
          >
            {item.endpoint}
          </span>
        ),
      },
      // Method column removed as requested
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
        filterOperation: FilterOperation.EQUAL,
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
        filterOperation: FilterOperation.MATCH,
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

  const handleLogsPageChange = async (newPage: number) => {
    try {
      const logsData = await apiUsageService.getMyLogs({
        page: newPage,
        size: logsPagination.size,
      });
      setApiLogs(logsData.content || []);
      setLogsPagination((prev) => ({
        ...prev,
        page: logsData.page || 0,
        totalElements: logsData.totalElements || 0,
        totalPages: logsData.totalPages || 0,
      }));
    } catch (e) {
      console.error("Failed to load page", e);
    }
  };

  // Token Usage Columns
  const tokenUsageColumns: ColumnDef<TokenUsageLog>[] = useMemo(
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

  const handleTokenPageChange = async (newPage: number) => {
    try {
      const tokenData = await tokenUsageService.getMyUsageHistory(
        newPage,
        tokenPagination.size,
      );
      setTokenUsage(tokenData.content || []);
      setTokenPagination((prev) => ({
        ...prev,
        page: tokenData.number || newPage,
        totalElements: tokenData.totalElements || 0,
        totalPages: tokenData.totalPages || 0,
      }));
    } catch (e) {
      console.error("Failed to load token usage page", e);
    }
  };

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

  const daysUntilReset = getDaysUntilReset();

  return (
    <PermissionGuard permissions={["STATS.VIEW", "API_USAGE.VIEW"]}>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Analytics & Usage
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Track your CV generations and API usage. Usage resets{" "}
            {daysUntilReset !== null ? `in ${daysUntilReset} days` : "monthly"}.
          </p>
        </div>

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
            {/* Usage Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    CV Generations
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription?.currentCvCount ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscription?.cvLimit
                      ? `of ${subscription.cvLimit} this month`
                      : subscription
                        ? "Unlimited"
                        : "No active plan"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Remaining CVs
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription?.cvLimit
                      ? Math.max(
                          0,
                          subscription.cvLimit -
                            (subscription.currentCvCount ?? 0),
                        )
                      : "∞"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscription?.cvLimit
                      ? `${cvUsagePercent}% used`
                      : "Unlimited plan"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Token Usage
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription?.currentTokenUsage ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscription ? "Tokens used this month" : "No active plan"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Plan
                  </CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription?.planName ?? "None"}
                  </div>
                  <Button
                    variant="link"
                    className="px-0 h-auto text-xs text-primary"
                    asChild
                  >
                    <Link href="/plans">
                      {subscription ? "Manage Subscription" : "Subscribe Now"}{" "}
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>This Month's Usage</CardTitle>
                  <CardDescription>
                    Weekly breakdown of CVs generated this month.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[250px] sm:h-[300px] lg:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockGenerationsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                          cursor={{ fill: "transparent" }}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="generations"
                          fill="currentColor"
                          radius={[4, 4, 0, 0]}
                          className="fill-primary"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Subscription Status</CardTitle>
                  <CardDescription>
                    Your current plan details and status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subscription?.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {subscription?.status ?? "INACTIVE"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Start Date
                      </span>
                      <span className="text-sm">
                        {subscription
                          ? new Date(
                              subscription.startDate,
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        End Date
                      </span>
                      <span className="text-sm">
                        {subscription
                          ? new Date(subscription.endDate).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Usage Resets
                      </span>
                      <span className="text-sm">
                        {subscription?.usageResetDate
                          ? new Date(
                              subscription.usageResetDate,
                            ).toLocaleDateString()
                          : "Monthly"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Token Usage History Tab */}
          <TabsContent value="token-usage" className="space-y-6">
            {/* Token Summary Cards */}
            {tokenUsageSummary && (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Tokens Used
                    </CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {tokenUsageSummary.totalTokensUsed}
                    </div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      From Subscription
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {tokenUsageSummary.fromSubscription}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tokens from plan
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      From Wallet
                    </CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {tokenUsageSummary.fromWallet}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Extra tokens used
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Token Usage Log Table */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">
                  Token Usage History
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Detailed log of your token consumption for CV parsing and
                  other AI features.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <GenericList
                  data={tokenUsage}
                  columns={tokenUsageColumns}
                  meta={tokenPagination}
                  isLoading={isLoading}
                  onPageChange={handleTokenPageChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {canViewApiLogs && (
            <TabsContent value="logs">
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-base sm:text-lg">
                    API Usage Logs
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Detailed logs of your API activity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                  <GenericList
                    data={apiLogs}
                    columns={logsColumns}
                    meta={logsPagination}
                    isLoading={isLoading}
                    onPageChange={handleLogsPageChange}
                    // Filter not fully implemented on backend user endpoint yet,
                    // but if it were, we would use onFilterChange
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
