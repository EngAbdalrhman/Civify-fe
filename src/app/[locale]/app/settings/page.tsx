"use client";

import { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import apiClient from '@/api/client';
import { Link } from '@/i18n/routing';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  profilePictureUrl: string | null;
}

interface Subscription {
  id: number;
  planName: string;
  planDescription: string;
  status: string;
  startDate: string;
  endDate: string;
  cvLimit: number;
  currentCvCount: number;
  autoRenew?: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);

  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isSubLoading, setIsSubLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get<UserProfile>('/v1/users/me');
        setUser(response.data);
        setProfileForm({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phoneNumber: response.data.phoneNumber || ''
        });
      } catch {
        toast.error('Failed to load profile');
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

  // Save profile
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await apiClient.put<UserProfile>('/v1/users/me', profileForm);
      setUser(response.data);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async (enabled: boolean) => {
    if (!user) return;
    setIsToggling2FA(true);
    try {
      const endpoint = enabled ? '/auth/enable-2fa' : '/auth/disable-2fa';
      await apiClient.post(`${endpoint}?username=${user.username}`);
      setIs2FAEnabled(enabled);
      toast.success(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update 2FA settings');
    } finally {
      setIsToggling2FA(false);
    }
  };

  // Get user initials
  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || user.username?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4 hidden sm:block" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4 hidden sm:block" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4 hidden sm:block" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4 hidden sm:block" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account's profile information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isProfileLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.profilePictureUrl || undefined} />
                      <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={profileForm.firstName} 
                        onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})} 
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={profileForm.lastName} 
                        onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                        placeholder="Doe"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={isSavingProfile || isProfileLoading}>
                {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input 
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input 
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Enable 2FA</div>
                  <div className="text-sm text-muted-foreground">
                    Receive a verification code via email when logging in.
                  </div>
                </div>
                <Switch
                  checked={is2FAEnabled}
                  onCheckedChange={handleToggle2FA}
                  disabled={isToggling2FA || !user}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                {subscription ? (
                  <>You are currently on the <span className="font-semibold text-primary">{subscription.planName}</span> plan.</>
                ) : (
                  'View and manage your subscription.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSubLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : subscription ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-lg">{subscription.planName}</p>
                        <p className="text-sm text-muted-foreground">{subscription.planDescription}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        subscription.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {subscription.status}
                      </span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">CV Usage</p>
                        <p className="font-medium">{subscription.currentCvCount} / {subscription.cvLimit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Auto Renew</p>
                        <p className="font-medium">{subscription.autoRenew !== false ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Started</p>
                        <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Renews</p>
                        <p className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/plans">
                      <Button variant="outline">View Plans</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
                  <Link href="/plans">
                    <Button>View Plans</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure what emails you receive from us.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <div className="font-medium">CV Generation Complete</div>
                  <div className="text-sm text-muted-foreground">Receive an email when your CV is ready.</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <div className="font-medium">API Usage Alerts</div>
                  <div className="text-sm text-muted-foreground">Get notified when you approach your usage limits.</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between pb-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Marketing Emails</div>
                  <div className="text-sm text-muted-foreground">Receive updates about new features and promotions.</div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
