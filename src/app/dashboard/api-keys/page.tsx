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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/app/Loader";
import {
  ArrowLeft,
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { generateApiKey, hashApiKey, maskApiKey } from "@/lib/utils/license";
import { ApiKey } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ApiKeysPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const database = useDatabase();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isLicensed, setIsLicensed] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [generating, setGenerating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [apiUsage, setApiUsage] = useState(0);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push("/login");
      return;
    }

    if (database) {
      loadData();
    }
  }, [user, isHydrated, database, router]);

  const loadData = async () => {
    if (!database) return;

    try {
      setLoading(true);
      const [profile, keys, usage] = await Promise.all([
        database.getUserProfile(),
        database.getApiKeys(),
        database.getApiUsageThisMonth(),
      ]);

      if (!profile?.isLicensed) {
        toast({
          variant: "destructive",
          title: "License Required",
          description: "You need an active license to manage API keys.",
        });
        router.push("/dashboard/license");
        return;
      }

      setIsLicensed(true);
      setApiKeys(keys);
      setApiUsage(usage);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load API keys.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!database) return;

    setGenerating(true);
    try {
      const apiKey = generateApiKey();
      const keyHash = await hashApiKey(apiKey);

      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        userId: user!.uid,
        key: apiKey,
        keyHash: keyHash,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      await database.saveApiKey(newKey);
      setNewApiKey(apiKey);
      setShowNewKey(true);

      toast({
        title: "API Key Generated Successfully! 🎉",
        description:
          "Make sure to copy your API key now. You won't be able to see it again!",
      });

      await loadData();
    } catch (error) {
      console.error("Error generating API key:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate API key. Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard.",
    });
  };

  const handleRevokeApiKey = async (keyId: string) => {
    if (!database) return;

    try {
      await database.deactivateApiKey(keyId);
      toast({
        title: "API Key Revoked",
        description:
          "The API key has been deactivated and can no longer be used.",
      });
      await loadData();
    } catch (error) {
      console.error("Error revoking API key:", error);
      toast({
        variant: "destructive",
        title: "Revocation Failed",
        description: "Failed to revoke API key. Please try again.",
      });
    } finally {
      setKeyToDelete(null);
    }
  };

  const handleCloseNewKeyDialog = () => {
    setShowNewKey(false);
    setNewApiKey(null);
  };

  if (loading) {
    return <Loader message="Loading API keys..." />;
  }

  if (!isLicensed) {
    return null;
  }

  const activeKeys = apiKeys.filter((k) => k.isActive);
  const usagePercentage = (apiUsage / 500) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Key className="h-10 w-10 text-blue-600" />
                API Key Management
              </h1>
              <p className="text-gray-600 mt-2">
                Generate and manage your API keys for programmatic access
              </p>
            </div>

            <Button
              onClick={() => router.push("/dashboard/api-docs")}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              View API Documentation
            </Button>
          </div>
        </div>

        {/* API Usage Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              API Usage This Month
            </CardTitle>
            <CardDescription>
              Track your API usage and remaining quota
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{apiUsage} / 500</span>
                <Badge
                  className={
                    usagePercentage >= 90
                      ? "bg-red-500"
                      : usagePercentage >= 70
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }
                >
                  {usagePercentage.toFixed(1)}% Used
                </Badge>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    usagePercentage >= 90
                      ? "bg-red-500"
                      : usagePercentage >= 70
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>

              <p className="text-sm text-gray-600">
                {500 - apiUsage} API calls remaining this month
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for accessing HICv API endpoints
                </CardDescription>
              </div>

              <Button
                onClick={handleGenerateApiKey}
                disabled={generating}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {generating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate New Key
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeKeys.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No API Keys Yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Generate your first API key to start using the HICv API
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-mono text-sm text-gray-700">
                          {maskApiKey(key.key)}
                        </p>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(key.createdAt).toLocaleDateString()}
                        {key.lastUsedAt && (
                          <>
                            {" "}
                            • Last used:{" "}
                            {new Date(key.lastUsedAt).toLocaleDateString()}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setKeyToDelete(key.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New API Key Dialog */}
        <AlertDialog open={showNewKey} onOpenChange={setShowNewKey}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                API Key Generated Successfully!
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Important: Save this key now!
                  </p>
                  <p className="text-sm text-yellow-800">
                    This is the only time you'll be able to see this API key.
                    Make sure to copy it and store it securely.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <Label className="text-xs text-gray-600 mb-2 block">
                    Your API Key
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white border border-gray-300 rounded text-sm font-mono break-all">
                      {newApiKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => newApiKey && handleCopyApiKey(newApiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCloseNewKeyDialog}>
                I've Saved My Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!keyToDelete}
          onOpenChange={() => setKeyToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently deactivate this API key. Any applications
                using this key will no longer be able to access the API. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => keyToDelete && handleRevokeApiKey(keyToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Revoke Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
