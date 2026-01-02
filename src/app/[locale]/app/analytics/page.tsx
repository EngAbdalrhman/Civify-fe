"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Activity, FileText, ArrowUpRight, Loader2, AlertTriangle } from 'lucide-react';
import { subscriptionService } from '@/services/subscription.service';
import { apiUsageService, type ApiUsageLog, type ApiUsageStats } from '@/services/api-usage.service';
import { useAuth } from '@/hooks/use-auth';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenericList, buildInputDataModel } from '@/components/generic-list/GenericList';
import { ColumnDef, FilterOperation } from '@/components/generic-list/types';

import type { UserSubscription } from '@/features/plans/types';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const router = useRouter();
  const { permissions, isLoading: isAuthLoading, hasPermission } = useAuth();
  
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<ApiUsageLog[]>([]);
  const [apiStats, setApiStats] = useState<ApiUsageStats | null>(null);

  // Pagination for logs
  const [logsPagination, setLogsPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  // Check permission - user should have CV.CREATE to view their analytics
  const canViewAnalytics = hasPermission('STATS.VIEW');
  const canViewApiLogs = hasPermission('API.ACCESS');

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
        console.warn('No active subscription or error fetching it:', err);
      }

      // Fetch other stats
      const [logsData, statsData] = await Promise.all([
        // Only fetch logs if user has permission
        canViewApiLogs 
          ? apiUsageService.getMyLogs({ page: 0, size: 10 }).catch(() => ({ content: [], totalElements: 0, totalPages: 0, size: 10, page: 0 }))
          : Promise.resolve({ content: [], totalElements: 0, totalPages: 0, size: 10, page: 0 }),
        apiUsageService.getMyStats().catch(() => null),
      ]);
      
      setApiLogs(logsData.content || []);
      setLogsPagination({
        page: logsData.page || 0,
        size: logsData.size || 10,
        totalElements: logsData.totalElements || 0,
        totalPages: logsData.totalPages || 0
      });

      setApiStats(statsData);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
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
    { name: 'Week 1', generations: Math.round(subscription?.currentCvCount ? subscription.currentCvCount * 0.2 : 0) },
    { name: 'Week 2', generations: Math.round(subscription?.currentCvCount ? subscription.currentCvCount * 0.3 : 0) },
    { name: 'Week 3', generations: Math.round(subscription?.currentCvCount ? subscription.currentCvCount * 0.25 : 0) },
    { name: 'Week 4', generations: Math.round(subscription?.currentCvCount ? subscription.currentCvCount * 0.25 : 0) },
  ];

  // Logs Columns Definition
  const logsColumns: ColumnDef<ApiUsageLog>[] = useMemo(() => [
    {
        key: 'endpoint',
        label: 'Endpoint',
        sortable: true,
        filterable: true,
        filterType: 'text',
        filterOperation: FilterOperation.MATCH
    },
    // Method column removed as requested
    {
        key: 'statusCode',
        label: 'Status',
        render: (_, item) => (
           <Badge variant={item.statusCode >= 200 && item.statusCode < 300 ? 'default' : 'destructive'}>
               {item.statusCode}
           </Badge>
        ),
        sortable: true,
        filterable: true,
        filterType: 'number',
        filterOperation: FilterOperation.EQUAL
    },
    {
        key: 'errorMessage',
        label: 'Error',
        render: (_, item) => (
          <span className="text-red-500 text-xs" title={item.errorMessage || ''}>
            {item.errorMessage || '-'}
          </span>
        ),
        filterable: true,
        filterType: 'text',
        filterOperation: FilterOperation.MATCH
    },
    {
        key: 'timestamp',
        label: 'Time',
        render: (_, item) => <span>{new Date(item.timestamp).toLocaleString()}</span>,
        sortable: true
    }
  ], []);

  const handleLogsPageChange = async (newPage: number) => {
      try {
        const logsData = await apiUsageService.getMyLogs({ page: newPage, size: logsPagination.size });
        setApiLogs(logsData.content || []);
        setLogsPagination(prev => ({
            ...prev,
            page: logsData.page || 0,
            totalElements: logsData.totalElements || 0,
            totalPages: logsData.totalPages || 0
        }));
      } catch (e) {
          console.error("Failed to load page", e);
      }
  }


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
          You don't have permission to view analytics.<br />
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
        <p className="text-muted-foreground">
          {error}
        </p>
        <Button onClick={loadSubscriptionData}>Try Again</Button>
      </div>
    );
  }

  const daysUntilReset = getDaysUntilReset();

  return (
    <PermissionGuard permissions={['STATS.VIEW', 'API_USAGE.VIEW']}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Usage</h1>
          <p className="text-muted-foreground mt-2">
            Track your CV generations and API usage. Usage resets {daysUntilReset !== null ? `in ${daysUntilReset} days` : 'monthly'}.
          </p>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList>
            <TabsTrigger value="stats">General Statistics</TabsTrigger>
            {canViewApiLogs && <TabsTrigger value="logs">API Logs</TabsTrigger>}
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            {/* Usage Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CV Generations</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscription?.currentCvCount ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {subscription?.cvLimit 
                      ? `of ${subscription.cvLimit} this month`
                      : subscription ? 'Unlimited' : 'No active plan'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remaining CVs</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription?.cvLimit 
                      ? Math.max(0, subscription.cvLimit - (subscription.currentCvCount ?? 0))
                      : '∞'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscription?.cvLimit ? `${cvUsagePercent}% used` : 'Unlimited plan'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscription?.currentTokenUsage ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {subscription ? 'Tokens used this month' : 'No active plan'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscription?.planName ?? 'None'}</div>
                  <Button variant="link" className="px-0 h-auto text-xs text-primary" asChild>
                    <Link href="/plans">
                      {subscription ? 'Manage Subscription' : 'Subscribe Now'} <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>This Month's Usage</CardTitle>
                  <CardDescription>
                    Weekly breakdown of CVs generated this month.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[350px]">
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
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="generations" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Subscription Status</CardTitle>
                  <CardDescription>
                    Your current plan details and status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subscription?.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {subscription?.status ?? 'INACTIVE'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Start Date</span>
                      <span className="text-sm">{subscription ? new Date(subscription.startDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">End Date</span>
                      <span className="text-sm">{subscription ? new Date(subscription.endDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Usage Resets</span>
                      <span className="text-sm">{subscription?.usageResetDate ? new Date(subscription.usageResetDate).toLocaleDateString() : 'Monthly'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {canViewApiLogs && (
            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>API Usage Logs</CardTitle>
                  <CardDescription>Detailed logs of your API activity.</CardDescription>
                </CardHeader>
                <CardContent>
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
