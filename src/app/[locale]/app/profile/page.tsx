'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { Loader2, User, Mail, Phone, Calendar, Shield, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  permissions?: string[];
  cvCount?: number;
  apiUsageCount?: number;
}

export default function ProfilePage() {
  const t = useTranslations('common'); // or a specific profile namespace
  const { groupName } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get<UserProfile>('/v1/users/me');
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
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

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          View your personal information and account status.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Profile Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profilePictureUrl} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              
              <div className="space-y-4 flex-1 text-center md:text-left">
                <div>
                  <h2 className="text-2xl font-bold">{fullName}</h2>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Shield className="w-3 h-3 mr-1" />
                    {groupName || 'User'}
                  </Badge>
                  {/* Additional badges could go here */}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{profile.phoneNumber || 'Not set'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">CVs Created</span>
              <Badge variant="outline" className="text-lg">
                {profile.cvCount || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">API Calls (This Month)</span>
              <Badge variant="outline" className="text-lg">
                {profile.apiUsageCount || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
