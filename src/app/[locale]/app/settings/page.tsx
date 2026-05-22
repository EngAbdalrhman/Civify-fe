"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  Globe,
  Palette,
  Camera,
  Trash2,
  AlertTriangle,
  CreditCard,
  XCircle,
  CheckCircle,
  Calendar,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { Link, useRouter } from "@/i18n/routing";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import {
  useMyActiveSubscription,
  useCancelSubscription,
} from "@/features/plans/hooks/useSubscription";
import { Progress } from "@/components/ui/progress";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPreferences, useUpdateUserPreferences, UserPreferences } from "@/hooks/useUserPreferences";
import { WatermarkBrandingSection } from "@/features/settings/components/WatermarkBrandingSection";
import { usePermissions } from "@/hooks/use-permissions";

export default function SettingsPage() {
  const { hasPermission } = usePermissions();
  const canViewBranding = hasPermission("CV.CUSTOM_WATERMARK");
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const {
    data: user,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useUserProfile();
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  // Security state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);

  // Preferences state
  const { data: fetchedPreferences, isLoading: isPrefsLoading } = useUserPreferences();
  const updatePreferencesMutation = useUpdateUserPreferences();
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredLanguage: "EN",
    preferredTheme: "LIGHT",
    autoSaveEnabled: true,
  });
  
  // Sync fetched preferences to local state
  useEffect(() => {
    if (fetchedPreferences) {
      setPreferences(fetchedPreferences);
    }
  }, [fetchedPreferences]);

  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Delete account state
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const isOAuthUser = Boolean(user?.oauthProvider);
  const oauthProviderLabel = user?.oauthProvider
    ? user.oauthProvider.charAt(0).toUpperCase() +
      user.oauthProvider.slice(1).toLowerCase()
    : null;

  // Subscription state
  const { data: subscription, isLoading: isSubscriptionLoading } =
    useMyActiveSubscription();
  const cancelMutation = useCancelSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);



  // Save profile
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await apiClient.put("/v1/users/me", profileForm);
      await refetchProfile();
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async (enabled: boolean) => {
    if (!user) return;
    setIsToggling2FA(true);
    try {
      const endpoint = enabled ? "/auth/enable-2fa" : "/auth/disable-2fa";
      await apiClient.post(`${endpoint}?username=${user.username}`);
      setIs2FAEnabled(enabled);
      toast.success(
        `Two-factor authentication ${enabled ? "enabled" : "disabled"}`,
      );
    } catch {
      toast.error("Failed to update 2FA settings");
    } finally {
      setIsToggling2FA(false);
    }
  };

  // Save preferences
  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    try {
      const updated = await updatePreferencesMutation.mutateAsync(preferences);
      setPreferences(updated);
      toast.success("Preferences updated successfully");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Get user initials
  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.charAt(0) || user.username?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  // Avatar file input ref
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Handle avatar upload
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        try {
          await apiClient.put("/v1/users/me/profile-picture", {
            image: base64Image,
          });
          await refetchProfile();
          toast.success("Profile picture updated!");
        } catch {
          toast.error("Failed to upload profile picture");
        } finally {
          setIsUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to process image");
      setIsUploadingAvatar(false);
    }
    // Reset input
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (!isOAuthUser && !deleteAccountPassword) {
      toast.error("Please enter your password");
      return;
    }

    setIsDeletingAccount(true);
    try {
      await apiClient.delete(
        "/v1/users/me",
        isOAuthUser
          ? undefined
          : {
              data: { password: deleteAccountPassword },
            },
      );
      setShowDeleteDialog(false);
      // Clear local storage and redirect
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
      setDeleteAccountPassword("");
    }
  };

  return (
    <PermissionGuard requireAuth={true} permissions={[]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs
          defaultValue="profile"
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4 hidden sm:block" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="h-4 w-4 hidden sm:block" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="h-4 w-4 hidden sm:block" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4 hidden sm:block" />
              Security
            </TabsTrigger>
            {canViewBranding && (
              <TabsTrigger value="branding" className="gap-2">
                <Camera className="h-4 w-4 hidden sm:block" />
                Branding
              </TabsTrigger>
            )}
            {/* <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />
              Notifications
            </TabsTrigger> */}
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
                      <div className="relative group">
                        <Avatar className="h-20 w-20">
                          <AvatarImage
                            src={user?.profilePictureUrl || undefined}
                          />
                          <AvatarFallback className="text-lg">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                          ) : (
                            <Camera className="h-6 w-6 text-white" />
                          )}
                        </button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1"></p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              firstName: e.target.value,
                            })
                          }
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              lastName: e.target.value,
                            })
                          }
                          placeholder="Doe"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileForm.phoneNumber}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phoneNumber: e.target.value,
                            })
                          }
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || isProfileLoading}
                >
                  {isSavingProfile && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isSubscriptionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : subscription ? (
                  <>
                    {/* Plan Info */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Current Plan
                          </p>
                          <p className="text-2xl font-bold">
                            {subscription.planName}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            subscription.status === "ACTIVE"
                              ? subscription.autoRenew === false
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {subscription.status === "ACTIVE" &&
                          subscription.autoRenew === false
                            ? "Cancelling"
                            : subscription.status}
                        </div>
                      </div>

                      {/* Billing Period */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Billing Period Ends</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {new Date(subscription.endDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg border">
                          <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            {subscription.autoRenew !== false ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="text-sm">Auto-Renewal</span>
                          </div>
                          <p className="text-lg font-semibold">
                            {subscription.autoRenew !== false
                              ? "Enabled"
                              : "Disabled"}
                          </p>
                        </div>
                      </div>

                      {/* Usage Stats */}
                      {subscription.cvLimit !== null && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              CV Generations Used
                            </span>
                            <span className="font-medium">
                              {subscription.currentCvCount} /{" "}
                              {subscription.cvLimit}
                            </span>
                          </div>
                          <Progress
                            value={
                              (subscription.currentCvCount /
                                subscription.cvLimit) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      )}

                      {/* Cancellation Notice */}
                      {subscription.autoRenew === false && (
                        <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/50">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-orange-700 dark:text-orange-400">
                                Subscription Scheduled for Cancellation
                              </p>
                              <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
                                Your subscription will remain active until{" "}
                                {new Date(
                                  subscription.endDate,
                                ).toLocaleDateString()}
                                . After that, you'll be automatically moved to
                                the Free plan.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active subscription found.
                  </div>
                )}
              </CardContent>

              {/* Cancel Button - Only show for paid plans with auto-renew enabled */}
              {subscription &&
                subscription.planName?.toLowerCase() !== "free" &&
                subscription.autoRenew !== false && (
                  <CardFooter className="border-t pt-6">
                    <div className="w-full space-y-4">
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-destructive">
                            Cancel Subscription
                          </p>
                          <p className="text-sm text-muted-foreground">
                            You'll continue to have access until the end of your
                            billing period.
                          </p>
                        </div>
                        <AlertDialog
                          open={showCancelDialog}
                          onOpenChange={setShowCancelDialog}
                        >
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="gap-2">
                              <XCircle className="h-4 w-4" />
                              Cancel Subscription
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancel your subscription?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>
                                  Are you sure you want to cancel your{" "}
                                  <strong>{subscription.planName}</strong>{" "}
                                  subscription?
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                                  <li>
                                    Your subscription will remain active until{" "}
                                    <strong>
                                      {new Date(
                                        subscription.endDate,
                                      ).toLocaleDateString()}
                                    </strong>
                                  </li>
                                  <li>
                                    You won't be charged on the next billing
                                    cycle
                                  </li>
                                  <li>
                                    After expiration, you'll be moved to the
                                    Free plan
                                  </li>
                                  <li>You can re-subscribe at any time</li>
                                </ul>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Keep Subscription
                              </AlertDialogCancel>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  cancelMutation.mutate();
                                  setShowCancelDialog(false);
                                }}
                                disabled={cancelMutation.isPending}
                              >
                                {cancelMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Yes, Cancel Subscription
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardFooter>
                )}
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Language & Theme Preferences</CardTitle>
                <CardDescription>
                  Customize your experience with language and email theme
                  settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isPrefsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Language Preference */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <Label className="text-base font-medium">
                          Preferred Language
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred language for the application and
                        emails.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant={
                            preferences.preferredLanguage === "EN"
                              ? "default"
                              : "outline"
                          }
                          className="flex-1"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              preferredLanguage: "EN",
                            })
                          }
                        >
                          English
                        </Button>
                        <Button
                          variant={
                            preferences.preferredLanguage === "AR"
                              ? "default"
                              : "outline"
                          }
                          className="flex-1"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              preferredLanguage: "AR",
                            })
                          }
                        >
                          العربية
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Email Theme Preference */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                        <Label className="text-base font-medium">
                          Email Theme
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Choose the theme for emails you receive from Civify.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant={
                            preferences.preferredTheme === "LIGHT"
                              ? "default"
                              : "outline"
                          }
                          className="flex-1"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              preferredTheme: "LIGHT",
                            })
                          }
                        >
                          ☀️ Light
                        </Button>
                        <Button
                          variant={
                            preferences.preferredTheme === "DARK"
                              ? "default"
                              : "outline"
                          }
                          className="flex-1"
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              preferredTheme: "DARK",
                            })
                          }
                        >
                          🌙 Dark
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Auto Save Preference */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Save className="h-5 w-5 text-muted-foreground" />
                        <Label className="text-base font-medium">
                          Resume Builder
                        </Label>
                      </div>
                      <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/50">
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto Save</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically save your resume edits every few seconds.
                            When disabled, you must manually click Save or Save as New.
                          </p>
                        </div>
                        <Switch
                          checked={preferences.autoSaveEnabled}
                          onCheckedChange={(checked) =>
                            setPreferences({
                              ...preferences,
                              autoSaveEnabled: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSavePreferences}
                  disabled={isSavingPrefs || isPrefsLoading}
                >
                  {isSavingPrefs && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </CardFooter>
            </Card>

            {/*<Card>*/}
            {/*  <CardHeader>*/}
            {/*    <CardTitle>Two-Factor Authentication</CardTitle>*/}
            {/*    <CardDescription>*/}
            {/*      Add an extra layer of security to your account.*/}
            {/*    </CardDescription>*/}
            {/*  </CardHeader>*/}
            {/*  <CardContent>*/}
            {/*    <div className="flex items-center justify-between">*/}
            {/*      <div className="space-y-0.5">*/}
            {/*        <div className="font-medium">Enable 2FA</div>*/}
            {/*        <div className="text-sm text-muted-foreground">*/}
            {/*          Receive a verification code via email when logging in.*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*      <Switch*/}
            {/*        checked={is2FAEnabled}*/}
            {/*        onCheckedChange={handleToggle2FA}*/}
            {/*        disabled={isToggling2FA || !user}*/}
            {/*      />*/}
            {/*    </div>*/}
            {/*  </CardContent>*/}
            {/*</Card>*/}

            {/* Delete Account Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Delete Account</div>
                    <div className="text-sm text-muted-foreground">
                      Once deleted, your account cannot be recovered. You can
                      create a new account with the same email later.
                    </div>
                  </div>
                  <AlertDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account. Your data will remain in our
                          system but will no longer be accessible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        {isOAuthUser ? (
                          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-muted-foreground">
                            {`You're signed in with ${oauthProviderLabel || "OAuth"}. No password is required to delete this account.`}
                          </div>
                        ) : (
                          <>
                            <Label htmlFor="delete-password">
                              Enter your password to confirm
                            </Label>
                            <div className="relative mt-2">
                              <Input
                                id="delete-password"
                                type="password"
                                value={deleteAccountPassword}
                                onChange={(e) =>
                                  setDeleteAccountPassword(e.target.value)
                                }
                                placeholder="Your password"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setDeleteAccountPassword("")}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={
                            isDeletingAccount ||
                            (!isOAuthUser && !deleteAccountPassword)
                          }
                        >
                          {isDeletingAccount && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Delete Account
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          {/* <TabsContent value="notifications" className="space-y-4">
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
          </TabsContent> */}

          {canViewBranding && (
            <TabsContent value="branding" className="space-y-4">
              <WatermarkBrandingSection />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
