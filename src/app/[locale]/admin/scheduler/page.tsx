'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { getAccessToken } from '@/utils/cookies';

export default function SchedulerPage() {
  const [loadingJob, setLoadingJob] = useState<string | null>(null);
  
  const triggerJob = async (endpoint: string, jobName: string) => {
    setLoadingJob(jobName);
    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/scheduler/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to trigger job');
      }

      toast.success(`${data.message} (${data.durationMs}ms)`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoadingJob(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Scheduler</h1>
        <p className="text-muted-foreground">
          Manually trigger system maintenance jobs and scheduled tasks.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Full Subscription Job */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-500" />
              Full Subscription Job
            </CardTitle>
            <CardDescription>
              Runs the complete daily subscription lifecycle process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
              <li>Creates renewal invoices (3 days before expiry)</li>
              <li>Sends payment & renewal reminders</li>
              <li>Expires overdue subscriptions</li>
              <li>Downgrades expired users to free plan</li>
              <li>Resets monthly usage limits</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => triggerJob('subscription-job', 'subscription')}
              disabled={!!loadingJob}
            >
              {loadingJob === 'subscription' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Job Now
            </Button>
          </CardContent>
        </Card>

        {/* Invoice Processing Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Invoice & Reminders Only
            </CardTitle>
            <CardDescription>
              Safe mode: only generates invoices and sends emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
              <li>Creates renewal invoices</li>
              <li>Sends reminder emails</li>
              <li><strong>Does NOT</strong> expire subscriptions</li>
              <li><strong>Does NOT</strong> downgrade users</li>
            </ul>
            <Button 
              variant="secondary"
              className="w-full" 
              onClick={() => triggerJob('invoice-reminders', 'invoice')}
              disabled={!!loadingJob}
            >
              {loadingJob === 'invoice' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Invoicing Only
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
