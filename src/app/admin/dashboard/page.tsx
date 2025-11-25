"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { userService } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/app/Loader";
import { Users, BarChart3, Shield, CreditCard } from "lucide-react";
import type { UserProfile, AdminStats } from "@/lib/types";
import { adminService, AdminService } from "@/lib/api/services/admin.service";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<Array<UserProfile & { userId: string }>>(
    []
  );

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user email is admin email or has isAdmin flag
      const adminEmail =
        process.env.NEXT_PUBLIC_ADMIN_EMAIL || "amabdo30@gmail.com";

      if (user.email === adminEmail) {
        setIsAdmin(true);
        await loadAdminData();
      } else {
        try {
          const profile = await userService.getProfile();
          if (profile?.isAdmin) {
            setIsAdmin(true);
            await loadAdminData();
          } else {
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "You do not have admin privileges.",
            });
            router.push("/");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          router.push("/");
        }
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, [user, router, toast]);

  const loadAdminData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
      ]);

      setStats(statsData);
      // Ensure usersData has userId property (backend might return id or userId)
      const mappedUsers = usersData.map((u: any) => ({
        ...u,
        userId: u.userId || u.id,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin data.",
      });
    }
  };

  if (loading) {
    return <Loader message="Loading admin dashboard..." />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Shield className="h-10 w-10 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage users, subscriptions, and system statistics
              </p>
            </div>
            <Button onClick={() => router.push("/")}>Back to App</Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.subscribedUsers} subscribed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCVs}</div>
                <p className="text-xs text-muted-foreground">
                  Stored in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.apiCallsThisMonth}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month ({stats.totalApiCalls} total)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Subscriptions
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.activeSubscriptions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active subscriptions
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cv-limits">CV Limits</TabsTrigger>
            <TabsTrigger value="api-limits">API Rate Limits</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and subscription status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>CVs Saved</TableHead>
                      <TableHead>Admin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">
                          {user.email}
                        </TableCell>
                        <TableCell>{user.name || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.plan === "free"
                                ? "bg-gray-500"
                                : "bg-green-500"
                            }
                          >
                            {user.plan || "free"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.cvCount || 0}/{user.cvLimit || 3}
                        </TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge className="bg-blue-500">Admin</Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CV Limits Tab */}
          <TabsContent value="cv-limits">
            <CVLimitsTab
              adminService={adminService}
              users={users}
              toast={toast}
              onUpdate={loadAdminData}
            />
          </TabsContent>

          {/* API Rate Limits Tab */}
          <TabsContent value="api-limits">
            <ApiRateLimitsTab
              adminService={adminService}
              users={users}
              toast={toast}
              onUpdate={loadAdminData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// CV Limits Tab Component
function CVLimitsTab({
  adminService,
  users,
  toast,
  onUpdate,
}: {
  adminService: AdminService;
  users: Array<UserProfile & { userId: string }>;
  toast: any;
  onUpdate: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<number>(3);

  const handleSetLimit = async (userId: string, limit: number) => {
    setLoading(true);
    try {
      await adminService.setUserCVLimit(userId, limit);
      toast({
        title: "CV Limit Updated",
        description: `User CV limit has been set to ${limit}.`,
      });
      await onUpdate();
      setSelectedUser(null);
      setNewLimit(3);
    } catch (error) {
      console.error("Error setting CV limit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update CV limit.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CV Limits Management</CardTitle>
        <CardDescription>
          Set custom CV storage limits for individual users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            About CV Limits
          </h3>
          <p className="text-sm text-blue-800">
            By default, users can save up to 3 CVs. You can set custom limits
            for specific users to allow them to save more CVs. This is useful
            for premium users or special cases.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Current Limit</TableHead>
              <TableHead>CVs Saved</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.cvLimit || 3} CVs</Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      (user.cvCount || 0) >= (user.cvLimit || 3)
                        ? "text-red-600 font-semibold"
                        : "text-gray-600"
                    }
                  >
                    {user.cvCount || 0}/{user.cvLimit || 3}
                  </span>
                </TableCell>
                <TableCell>
                  {selectedUser === user.userId ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newLimit}
                        onChange={(e) =>
                          setNewLimit(parseInt(e.target.value) || 3)
                        }
                        className="w-20 px-2 py-1 border rounded"
                        disabled={loading}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSetLimit(user.userId, newLimit)}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(null);
                          setNewLimit(3);
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user.userId);
                        setNewLimit(user.cvLimit || 3);
                      }}
                    >
                      Set Limit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// API Rate Limits Tab Component
function ApiRateLimitsTab({
  adminService,
  users,
  toast,
  onUpdate,
}: {
  adminService: AdminService;
  users: Array<UserProfile & { userId: string }>;
  toast: any;
  onUpdate: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<number>(500);

  const handleSetLimit = async (userId: string, limit: number) => {
    setLoading(true);
    try {
      await adminService.setUserApiLimit(userId, limit);
      toast({
        title: "API Rate Limit Updated",
        description: `User API rate limit has been set to ${limit} calls/month.`,
      });
      await onUpdate();
      setSelectedUser(null);
      setNewLimit(500);
    } catch (error) {
      console.error("Error setting API rate limit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update API rate limit.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Rate Limits Management</CardTitle>
        <CardDescription>
          Set custom API rate limits for licensed users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            About API Rate Limits
          </h3>
          <p className="text-sm text-blue-800">
            By default, licensed users can make up to 500 API calls per month.
            You can set custom limits for specific users to allow them more or
            fewer API calls. This is useful for premium users or testing
            purposes.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              {/* <TableHead>License Status</TableHead> */}
              <TableHead>Current Limit</TableHead>
              <TableHead>Usage This Month</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {user.apiRateLimit || 500} calls/month
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      (user.apiUsageCount || 0) >= (user.apiRateLimit || 500)
                        ? "text-red-600 font-semibold"
                        : "text-gray-600"
                    }
                  >
                    {user.apiUsageCount || 0}/{user.apiRateLimit || 500}
                  </span>
                </TableCell>
                <TableCell>
                  {selectedUser === user.userId ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10000"
                        step="100"
                        value={newLimit}
                        onChange={(e) =>
                          setNewLimit(parseInt(e.target.value) || 500)
                        }
                        className="w-24 px-2 py-1 border rounded"
                        disabled={loading}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSetLimit(user.userId, newLimit)}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(null);
                          setNewLimit(500);
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user.userId);
                        setNewLimit(user.apiRateLimit || 500);
                      }}
                      // disabled={!user?.isLicensed}
                    >
                      Set Limit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
