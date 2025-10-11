"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/app/Loader";
import {
  ArrowLeft,
  Key,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { isValidLicenseKeyFormat } from "@/lib/utils/license";

export default function LicensePage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const database = useDatabase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isLicensed, setIsLicensed] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [activating, setActivating] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState<{
    key: string;
    activatedAt: string;
  } | null>(null);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
      return;
    }

    if (database) {
      checkLicenseStatus();
    }
  }, [user, isHydrated, database, router]);

  const checkLicenseStatus = async () => {
    if (!database) return;

    try {
      setLoading(true);
      const profile = await database.getUserProfile();

      if (profile?.isLicensed) {
        setIsLicensed(true);
        setLicenseInfo({
          key: profile.licenseKey || "",
          activatedAt: profile.licenseActivatedAt || "",
        });
      }
    } catch (error) {
      console.error("Error checking license status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateLicense = async () => {
    if (!database) return;

    // Validate format
    if (!isValidLicenseKeyFormat(licenseKey.trim())) {
      toast({
        variant: "destructive",
        title: "Invalid License Key Format",
        description:
          "License key must be in format: HICV-XXXX-XXXX-XXXX (e.g., HICV-A2B3-C4D5-E6F7)",
      });
      return;
    }

    setActivating(true);
    try {
      await database.activateLicense(licenseKey.trim());

      toast({
        title: "License Activated Successfully! 🎉",
        description:
          "Your account has been upgraded. You can now generate API keys and access premium features.",
      });

      // Refresh license status
      await checkLicenseStatus();
      setLicenseKey("");
    } catch (error) {
      console.error("Error activating license:", error);

      // Provide user-friendly error messages
      let errorTitle = "Activation Failed";
      let errorDescription = "Failed to activate license. Please try again.";

      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();

        if (errorMsg.includes("invalid license key")) {
          errorTitle = "Invalid License Key";
          errorDescription =
            "This license key does not exist. Please check the key and try again, or contact your administrator for a valid license key.";
        } else if (errorMsg.includes("already been activated")) {
          errorTitle = "License Already Used";
          errorDescription =
            "This license key has already been activated by another user. Each license can only be used once. Please contact your administrator for a new license key.";
        } else if (
          errorMsg.includes("deactivated") ||
          errorMsg.includes("revoked")
        ) {
          errorTitle = "License Revoked";
          errorDescription =
            "This license key has been deactivated or revoked. Please contact your administrator for a new license key.";
        } else if (errorMsg.includes("permission denied")) {
          errorTitle = "Permission Error";
          errorDescription =
            "Unable to activate license due to permission issues. Please make sure you're logged in and try again. If the problem persists, contact your administrator.";
        } else {
          errorDescription = error.message;
        }
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription,
      });
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return <Loader message="Loading license information..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Key className="h-10 w-10 text-blue-600" />
            License Management
          </h1>
          <p className="text-gray-600 mt-2">
            Activate your license to unlock premium features and API access
          </p>
        </div>

        {/* License Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isLicensed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  License Active
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  No Active License
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isLicensed
                ? "Your account is licensed and has access to premium features"
                : "Activate a license key to unlock premium features"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLicensed ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      License Key
                    </p>
                    <p className="text-lg font-mono text-green-700">
                      {licenseInfo?.key}
                    </p>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    Activated On
                  </p>
                  <p className="text-gray-600">
                    {licenseInfo?.activatedAt
                      ? new Date(licenseInfo.activatedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Premium Features Unlocked
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Generate and manage API keys
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      500 API calls per month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Access to masked CV generation API
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Access to AI-tailored CV generation API
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => router.push("/dashboard/api-keys")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Manage API Keys
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="licenseKey">Enter License Key</Label>
                  <Input
                    id="licenseKey"
                    placeholder="HICV-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) =>
                      setLicenseKey(e.target.value.toUpperCase())
                    }
                    className="font-mono text-lg"
                    maxLength={19}
                  />
                  <p className="text-xs text-gray-500">
                    Format: HICV-XXXX-XXXX-XXXX (e.g., HICV-A2B3-C4D5-E6F7)
                  </p>
                </div>

                <Button
                  onClick={handleActivateLicense}
                  disabled={activating || !licenseKey.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {activating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Activate License
                    </>
                  )}
                </Button>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    How to Get a License Key?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Contact the administrator to obtain a license key. Once you
                    have a key, enter it above to activate premium features on
                    your account.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
