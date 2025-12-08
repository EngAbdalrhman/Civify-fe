"use client";

import { useTranslations } from 'next-intl';
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
import { Zap, Activity, FileText, ArrowUpRight } from 'lucide-react';

const mockGenerationsData = [
  { name: 'Jan', generations: 12 },
  { name: 'Feb', generations: 18 },
  { name: 'Mar', generations: 25 },
  { name: 'Apr', generations: 32 },
  { name: 'May', generations: 45 },
  { name: 'Jun', generations: 56 },
];

const mockApiUsageData = [
  { name: 'Mon', extract: 120, generate: 85, match: 30 },
  { name: 'Tue', extract: 132, generate: 90, match: 45 },
  { name: 'Wed', extract: 101, generate: 120, match: 55 },
  { name: 'Thu', extract: 134, generate: 110, match: 40 },
  { name: 'Fri', extract: 190, generate: 150, match: 70 },
  { name: 'Sat', extract: 90, generate: 60, match: 20 },
  { name: 'Sun', extract: 70, generate: 40, match: 15 },
];

export default function AnalyticsPage() {
  const t = useTranslations('analytics');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Usage</h1>
        <p className="text-muted-foreground mt-2">
          Track your CV generations and API usage in real-time.
        </p>
      </div>

      {/* Usage Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CV Generations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">188</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Credits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">12</div>
             <p className="text-xs text-muted-foreground">
               of 200 monthly credits
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">2,350</div>
             <p className="text-xs text-muted-foreground">
               +15% from last week
             </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
             <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">Pro Plan</div>
             <Button variant="link" className="px-0 h-auto text-xs text-primary">
               Manage Subscription <ArrowUpRight className="ml-1 h-3 w-3" />
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly CV Generations</CardTitle>
            <CardDescription>
              Overview of CVs generated over the last 6 months.
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
            <CardTitle>API Usage per Endpoint</CardTitle>
            <CardDescription>
              Daily requests breakdown by endpoint type.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={mockApiUsageData}>
                     <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     />
                     <Legend verticalAlign="top" height={36} />
                     <Line type="monotone" dataKey="extract" stroke="#8884d8" strokeWidth={2} dot={false} name="/extract-data" />
                     <Line type="monotone" dataKey="generate" stroke="#82ca9d" strokeWidth={2} dot={false} name="/generate-cv" />
                     <Line type="monotone" dataKey="match" stroke="#ffc658" strokeWidth={2} dot={false} name="/match-score" />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Plan & Limits</CardTitle>
          <CardDescription>You are currently on the Pro Plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
             <div className="space-y-4">
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium">CV Generations</span>
                     <span className="text-sm text-muted-foreground">188 / 200</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[94%]" />
                  </div>
               </div>
               <div>
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium">API Calls</span>
                     <span className="text-sm text-muted-foreground">2.3k / 10k</span>
                  </div>
                   <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[23%]" />
                  </div>
               </div>
             </div>
             <div className="flex flex-col items-center justify-center space-y-3 p-6 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-lg">Need more power?</h4>
                <p className="text-center text-sm text-muted-foreground">
                  Upgrade to Enterprise for unlimited generations and priority support.
                </p>
                <Button className="w-full sm:w-auto">Upgrade to Enterprise</Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
