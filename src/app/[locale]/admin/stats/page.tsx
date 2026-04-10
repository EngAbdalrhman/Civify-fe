'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Activity,
  TrendingUp,
  Loader2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService, type AdminStats } from '@/services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type StatsPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'OVERALL';

interface ExtendedAdminStats extends AdminStats {
  period?: string;
  periodStart?: string;
  periodEnd?: string;
}

export default function StatsPage() {
  const t = useTranslations('admin.stats');

  const [stats, setStats] = useState<ExtendedAdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>('MONTHLY');

  const lastFetchRef = useRef<{ period: StatsPeriod; time: number } | null>(null);

  const fetchStats = useCallback(async (selectedPeriod: StatsPeriod) => {
    // Prevent duplicate fetches within 1 second for same period to avoid loops
    if (lastFetchRef.current && 
        lastFetchRef.current.period === selectedPeriod && 
        Date.now() - lastFetchRef.current.time < 1000) {
      return;
    }
    
    lastFetchRef.current = { period: selectedPeriod, time: Date.now() };

    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getStats(selectedPeriod);
      setStats(data as ExtendedAdminStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
      // Only toast on manual interactions or non-loop causing errors
      if (Date.now() - (lastFetchRef.current?.time || 0) > 2000) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(period);
  }, [fetchStats, period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod as StatsPeriod);
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'MONTHLY': return 'This Month';
      case 'QUARTERLY': return 'This Quarter';
      case 'YEARLY': return 'This Year';
      case 'OVERALL': return 'All Time';
      default: return 'This Month';
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={() => fetchStats(period)}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        
        {/* Period Selector */}
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="MONTHLY" className="text-xs sm:text-sm">
              <Calendar className="h-3 w-3 mr-1 hidden sm:inline" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="QUARTERLY" className="text-xs sm:text-sm">
              Quarterly
            </TabsTrigger>
            <TabsTrigger value="YEARLY" className="text-xs sm:text-sm">
              Yearly
            </TabsTrigger>
            <TabsTrigger value="OVERALL" className="text-xs sm:text-sm">
              Overall
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Period indicator */}
      {stats?.periodStart && (
        <p className="text-sm text-muted-foreground">
          {t('period')}: <span className="font-medium">{getPeriodLabel()}</span>
          {stats.periodStart && stats.periodEnd && (
            <span className="ltr:ml-2 rtl:mr-2 text-xs">
              ({new Date(stats.periodStart).toLocaleDateString()} - {new Date(stats.periodEnd).toLocaleDateString()})
            </span>
          )}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('totalUsers') || 'Total Users'}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.subscribedUsers || 0} subscribed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Subscriptions
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.activeSubscriptions || 0}</div>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {stats?.totalUsers ? Math.round((stats.subscribedUsers / stats.totalUsers) * 100) : 0}% conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CVs Uploaded ({getPeriodLabel()})
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalCVs || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {period === 'OVERALL' ? 'All-time uploads' : 'Period uploads'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* API Usage Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  API Calls ({getPeriodLabel()})
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalApiCalls || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {period === 'OVERALL' ? 'All-time API usage' : 'Period API usage'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  API Calls This Month
                </CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.apiCallsThisMonth || 0}</div>
                <p className="text-xs text-green-600 mt-1">
                  Current billing period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Placeholders */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue Chart
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: getPeriodLabel(), value: stats?.periodRevenue || 0 },
                      { name: 'This Month', value: stats?.revenueThisMonth || 0 },
                      { name: 'All Time', value: stats?.totalRevenue || 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="h-[300px]">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  User and CV Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Users', value: stats?.totalUsers || 0 },
                      { name: 'Subscribed', value: stats?.subscribedUsers || 0 },
                      { name: 'CVs', value: stats?.totalCVs || 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

