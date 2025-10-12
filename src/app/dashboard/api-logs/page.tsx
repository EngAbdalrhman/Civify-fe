"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import { ApiUsageLog, UserProfile } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function ApiLogsPage() {
  const { user } = useAuth();
  const databaseService = useDatabase();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<ApiUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    if (databaseService) {
      loadData();
    }
  }, [databaseService]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userProfile = await databaseService!.getUserProfile(user);
      setProfile(userProfile);

      // Check if user is licensed
      if (!userProfile.isLicensed) {
        toast({
          title: "Access Denied",
          description: "API logs are only available for licensed users",
          variant: "destructive",
        });
        return;
      }

      // Get current month
      const month = new Date().toISOString().substring(0, 7);
      setCurrentMonth(month);

      // Get API logs for current month
      const apiLogs = await databaseService!.getApiUsageLogs();

      // Filter logs for current month
      const monthLogs = apiLogs.filter((log) => {
        const logMonth = log.timestamp.substring(0, 7);
        return logMonth === month;
      });

      setLogs(monthLogs);
    } catch (error) {
      console.error("Error loading API logs:", error);
      toast({
        title: "Error",
        description: "Failed to load API logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile?.isLicensed) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <CardTitle className="text-yellow-900">
                API Access Required
              </CardTitle>
            </div>
            <CardDescription className="text-yellow-700">
              API logs are only available for licensed users. Please activate a
              license to access API features.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const successfulCalls = logs.filter((log) => log.success).length;
  const failedCalls = logs.filter((log) => !log.success).length;
  const usagePercentage =
    ((profile.apiUsageCount || 0) / (profile.apiRateLimit || 500)) * 100;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Usage Logs</h1>
          <p className="text-gray-600 mt-2">
            Track your API usage for{" "}
            {format(new Date(currentMonth + "-01"), "MMMM yyyy")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{logs.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {successfulCalls}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold text-red-600">
                  {failedCalls}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {profile.apiUsageCount || 0} / {profile.apiRateLimit || 500}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      usagePercentage >= 90
                        ? "bg-red-600"
                        : usagePercentage >= 70
                        ? "bg-yellow-600"
                        : "bg-green-600"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>API Call History</CardTitle>
            <CardDescription>
              Detailed log of all API calls made this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No API calls recorded this month</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Timestamp
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Endpoint
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {format(
                            new Date(log.timestamp),
                            "MMM dd, yyyy HH:mm:ss"
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-800">
                          {log.endpoint}
                        </td>
                        <td className="py-3 px-4">
                          {log.success ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Success
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {log.errorMessage || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
