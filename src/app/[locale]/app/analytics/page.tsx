"use client";

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Activity, FileText, ArrowUpRight, Loader2, AlertTriangle, CheckCircle2, XCircle, Key } from 'lucide-react';
import { subscriptionService } from '@/services/subscription.service';
import { apiUsageService, type ApiUsageLog, type ApiUsageStats } from '@/services/api-usage.service';
import { useAuth } from '@/hooks/use-auth';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { UserSubscription } from '@/features/plans/types';

// SubscriptionDisplay interface removed as UserSubscription now includes flattened DTO fields


export default function AnalyticsPage() {
  const t = useTranslations('analytics');
  const router = useRouter();
  const { permissions, isLoading: isAuthLoading, hasPermission } = useAuth();
  
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<ApiUsageLog[]>([]);
  const [apiStats, setApiStats] = useState<ApiUsageStats | null>(null);

  // Check permission - user should have CV.CREATE to view their analytics
  const canViewAnalytics = hasPermission('CV.CREATE') || hasPermission('STATS.VIEW');

  useEffect(() => {
    if (isAuthLoading) return;

    if (!canViewAnalytics) {
      setIsLoading(false);
      return;
    }

    loadSubscriptionData();
  }, [isAuthLoading, canViewAnalytics]);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const [subData, logsData, statsData] = await Promise.all([
        subscriptionService.getMyActiveSubscription(),
        apiUsageService.getMyLogs({ size: 10 }).catch(() => ({ content: [] })),
        apiUsageService.getMyStats().catch(() => null),
      ]);
      setSubscription(subData);
      setApiLogs(logsData.content || []);
      setApiStats(statsData);
    } catch (err) {
      setError('Failed to load subscription data');
      console.error('Error loading subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate usage percentages
  const cvUsagePercent = subscription?.cvLimit 
    ? Math.round((subscription.currentCvCount / subscription.cvLimit) * 100)
    : 0;
  const apiUsagePercent = subscription?.apiLimit 
    ? Math.round((subscription.currentApiCount / subscription.apiLimit) * 100)
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
    { name: 'Week 1', generations: Math.round(subscription?.currentCvCount ? subscription.currentCvCount * 0.2 : 5) },
    { name: 'Week 2', generations: Math.round(subscription?.currentCvCount ? subscription.currentCvCount * 0.3 : 8) },
    { name: 'Week 3', generations: Math.round(subscription?.currentCvCount ? subscription.currentCvCount * 0.25 : 6) },
    { name: 'Week 4', generations: Math.round(subscription?.currentCvCount ? subscription.currentCvCount * 0.25 : 7) },
  ];

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

  if (error || !subscription) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Unable to Load Data</h2>
        <p className="text-muted-foreground">
          {error || 'No active subscription found.'}
        </p>
        <Button onClick={loadSubscriptionData}>Try Again</Button>
      </div>
    );
  }

  const daysUntilReset = getDaysUntilReset();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Usage</h1>
        <p className="text-muted-foreground mt-2">
          Track your CV generations and API usage. Usage resets {daysUntilReset !== null ? `in ${daysUntilReset} days` : 'monthly'}.
        </p>
      </div>

      {/* Usage Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CV Generations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription.currentCvCount}</div>
            <p className="text-xs text-muted-foreground">
              {subscription.cvLimit 
                ? `of ${subscription.cvLimit} this month`
                : 'Unlimited'}
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
               {subscription.cvLimit 
                 ? Math.max(0, subscription.cvLimit - subscription.currentCvCount)
                 : '∞'}
             </div>
             <p className="text-xs text-muted-foreground">
               {subscription.cvLimit ? `${cvUsagePercent}% used` : 'Unlimited plan'}
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{subscription.currentApiCount}</div>
             <p className="text-xs text-muted-foreground">
               {subscription.apiLimit 
                 ? `of ${subscription.apiLimit} this month`
                 : 'Unlimited'}
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
             <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{subscription.planName}</div>
             <Button variant="link" className="px-0 h-auto text-xs text-primary" asChild>
               <Link href="/plans">
                 Manage Subscription <ArrowUpRight className="ml-1 h-3 w-3" />
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
                   subscription.status === 'ACTIVE' 
                     ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                     : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                 }`}>
                   {subscription.status}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Start Date</span>
                 <span className="text-sm">{new Date(subscription.startDate).toLocaleDateString()}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">End Date</span>
                 <span className="text-sm">{new Date(subscription.endDate).toLocaleDateString()}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Usage Resets</span>
                 <span className="text-sm">{subscription.usageResetDate ? new Date(subscription.usageResetDate).toLocaleDateString() : 'Monthly'}</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Plan & Limits</CardTitle>
          <CardDescription>You are currently on the {subscription.planName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
             <div className="space-y-4">
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium">CV Generations</span>
                     <span className="text-sm text-muted-foreground">
                       {subscription.currentCvCount} / {subscription.cvLimit || '∞'}
                     </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div 
                       className={`h-full transition-all ${cvUsagePercent > 90 ? 'bg-red-500' : cvUsagePercent > 70 ? 'bg-yellow-500' : 'bg-primary'}`} 
                       style={{ width: `${Math.min(cvUsagePercent, 100)}%` }} 
                     />
                  </div>
               </div>
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium">API Calls</span>
                     <span className="text-sm text-muted-foreground">
                       {subscription.currentApiCount} / {subscription.apiLimit || '∞'}
                     </span>
                  </div>
                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div 
                       className={`h-full transition-all ${apiUsagePercent > 90 ? 'bg-red-500' : apiUsagePercent > 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                       style={{ width: `${Math.min(apiUsagePercent, 100)}%` }}
                     />
                  </div>
               </div>
             </div>
             <div className="flex flex-col items-center justify-center space-y-3 p-6 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-lg">Need more power?</h4>
                <p className="text-center text-sm text-muted-foreground">
                  Upgrade for higher limits and priority support.
                </p>
                <Button className="w-full sm:w-auto" asChild>
                  <Link href="/plans">View Upgrade Options</Link>
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
      {/* API Usage Logs Section */}
      {apiStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Usage
            </CardTitle>
            <CardDescription>
              Your API call history and statistics for this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* API Stats Summary */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <div className="text-2xl font-bold">{apiStats.totalCalls}</div>
                <div className="text-xs text-muted-foreground">Total Calls</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{apiStats.successCount}</div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{apiStats.failureCount}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{apiStats.successRate}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>

            {/* Recent API Logs Table */}
            {apiLogs.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiLogs.slice(0, 10).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{log.endpoint}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{log.method}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No API usage logs yet. API calls made with your API keys will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

