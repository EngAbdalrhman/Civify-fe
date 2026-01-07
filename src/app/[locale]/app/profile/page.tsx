'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Activity, 
  CreditCard,
  Receipt,
  Loader2,
  ExternalLink,
  Coins,
  FileText,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Link } from '@/i18n/routing';
import apiClient from '@/api/client';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string;
  profilePictureUrl?: string;
  permissions?: string[];
  cvCount?: number;
  apiUsageCount?: number;
  extraTokens?: number;
  createdAt?: string;
  emailVerified?: boolean;
}

interface Subscription {
  id: number;
  planName: string;
  planDescription: string;
  status: string;
  startDate: string;
  endDate: string;
  cvLimit: number | null;
  tokenLimit: number | null;
  currentCvCount: number;
  currentTokenUsage: number;
  autoRenew?: boolean;
  currentCycleCount?: number;
}

interface Invoice {
  id: number;
  uuid: string;
  planName: string;
  finalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  billingType: string;
  createdAt: string;
  paidAt: string | null;
}

export default function ProfilePage() {
  const t = useTranslations('common');
  const { groupName } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSubLoading, setIsSubLoading] = useState(true);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get<UserProfile>('/v1/users/me');
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await apiClient.get<Subscription>('/v1/subscriptions/my-subscription');
        setSubscription(response.data);
      } catch {
        // User might not have a subscription
      } finally {
        setIsSubLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await apiClient.get<Invoice[]>('/v1/billing/invoices');
        setInvoices(response.data);
      } catch {
        // User might not have invoices
      } finally {
        setIsInvoicesLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded-md">
          {error || 'Profile not found'}
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username;
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const cvUsagePercent = subscription?.cvLimit 
    ? Math.min((subscription.currentCvCount / subscription.cvLimit) * 100, 100)
    : 0;
  
  const tokenUsagePercent = subscription?.tokenLimit 
    ? Math.min((subscription.currentTokenUsage / subscription.tokenLimit) * 100, 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PAID': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'EXPIRED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-purple-500/10 border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
              <AvatarImage src={profile.profilePictureUrl || undefined} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  {groupName || 'User'}
                </Badge>
                {profile.emailVerified && (
                  <Badge variant="outline" className="px-3 py-1 border-green-500 text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {subscription?.planName && subscription.planName.toLowerCase() !== 'free' && (
                  <Badge className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    {subscription.planName}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/app/settings">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </Link>
              {subscription?.planName?.toLowerCase() === 'free' && (
                <Link href="/plans">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <User className="h-4 w-4 hidden sm:block" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="h-4 w-4 hidden sm:block" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <Receipt className="h-4 w-4 hidden sm:block" />
            Billing History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phoneNumber || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {profile.createdAt 
                        ? format(new Date(profile.createdAt), 'MMMM yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CVs Created</span>
                    <span className="font-medium">
                      {subscription?.currentCvCount || 0} / {subscription?.cvLimit ?? '∞'}
                    </span>
                  </div>
                  {subscription?.cvLimit && (
                    <Progress value={cvUsagePercent} className="h-2" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tokens Used</span>
                    <span className="font-medium">
                      {subscription?.currentTokenUsage || 0} / {subscription?.tokenLimit ?? '∞'}
                    </span>
                  </div>
                  {subscription?.tokenLimit && (
                    <Progress value={tokenUsagePercent} className="h-2" />
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">Token Wallet</span>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3">
                    {profile.extraTokens || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Subscription</CardTitle>
              <CardDescription>
                {subscription ? (
                  <>You are on the <span className="font-semibold text-primary">{subscription.planName}</span> plan.</>
                ) : (
                  'View and manage your subscription.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : subscription ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 p-6 rounded-xl border">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{subscription.planName}</h3>
                        <p className="text-muted-foreground">{subscription.planDescription}</p>
                      </div>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">CV Limit</p>
                        <p className="font-semibold">{subscription.cvLimit ?? 'Unlimited'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Token Limit</p>
                        <p className="font-semibold">{subscription.tokenLimit ?? 'Unlimited'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Started</p>
                        <p className="font-semibold">{format(new Date(subscription.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{subscription.autoRenew !== false ? 'Renews' : 'Expires'}</p>
                        <p className="font-semibold">{format(new Date(subscription.endDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href="/plans">
                      <Button variant="outline">View All Plans</Button>
                    </Link>
                    <Link href="/app/tokens">
                      <Button variant="outline">
                        <Coins className="w-4 h-4 mr-2" />
                        Buy Tokens
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
                  <Link href="/plans">
                    <Button className="bg-gradient-to-r from-primary to-purple-600">
                      View Plans
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing History Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoice History
              </CardTitle>
              <CardDescription>
                View your past invoices and payment history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isInvoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{invoice.planName}</p>
                          <Badge className={getStatusColor(invoice.status)} variant="secondary">
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.billingType} • {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{invoice.finalAmount.toFixed(2)} {invoice.currency}</p>
                        {invoice.status === 'PENDING' && (
                          <Link href={`/checkout?invoice=${invoice.uuid}`}>
                            <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                              Pay Now <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                        {invoice.status === 'PAID' && invoice.paidAt && (
                          <p className="text-xs text-muted-foreground">
                            Paid {format(new Date(invoice.paidAt), 'MMM dd')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invoices found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
