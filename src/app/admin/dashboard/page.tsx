"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AppwriteAdminDatabaseService } from "@/lib/services/appwrite-admin-database";
import { generateLicenseKey } from "@/lib/utils/license";
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
import {
  Users,
  Key,
  BarChart3,
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
} from "lucide-react";
import type { LicenseKey, UserProfile, AdminStats } from "@/lib/types";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [licenses, setLicenses] = useState<LicenseKey[]>([]);
  const [users, setUsers] = useState<Array<UserProfile & { userId: string }>>(
    []
  );
  const [adminService] = useState(() => new AppwriteAdminDatabaseService());

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
        // Check database for admin flag
        const { AppwriteDatabaseService } = await import(
          "@/lib/services/appwrite-database"
        );
        const db = new AppwriteDatabaseService(user.uid);
        const profile = await db.getUserProfile();

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
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, [user, router, toast]);

  const loadAdminData = async () => {
    try {
      const [statsData, licensesData, usersData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllLicenses(),
        adminService.getAllUsers(),
      ]);

      setStats(statsData);
      setLicenses(licensesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin data.",
      });
    }
  };

  const handleGenerateLicense = async () => {
    try {
      const key = generateLicenseKey();
      const licenseId = await adminService.createLicenseKey({
        key,
        createdAt: new Date().toISOString(),
        createdBy: user!.uid,
        isActive: true,
      });

      toast({
        title: "License Key Generated",
        description: `New license key: ${key}`,
      });

      await loadAdminData();
    } catch (error) {
      console.error("Error generating license:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate license key.",
      });
    }
  };

  const handleCopyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "License key copied to clipboard.",
    });
  };

  const handleRevokeLicense = async (licenseId: string) => {
    try {
      await adminService.revokeLicense(licenseId);
      toast({
        title: "License Revoked",
        description: "License key has been deactivated.",
      });
      await loadAdminData();
    } catch (error) {
      console.error("Error revoking license:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke license.",
      });
    }
  };

  const handleDeleteLicense = async (licenseId: string) => {
    try {
      await adminService.deleteLicense(licenseId);
      toast({
        title: "License Deleted",
        description: "License key has been permanently deleted.",
      });
      await loadAdminData();
    } catch (error) {
      console.error("Error deleting license:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete license.",
      });
    }
  };

  const handleGrantLicense = async (userId: string) => {
    try {
      // Generate a new license key
      const licenseKey = generateLicenseKey();

      // Create the license in the database
      await adminService.createLicenseKey({
        key: licenseKey,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || "",
        isActive: true,
      });

      // Grant it to the user
      await adminService.grantLicense(userId, licenseKey);

      toast({
        title: "License Granted",
        description: `User has been granted license: ${licenseKey}`,
      });
      await loadAdminData();
    } catch (error) {
      console.error("Error granting license:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to grant license.",
      });
    }
  };

  const handleRevokeLicenseFromUser = async (userId: string) => {
    try {
      await adminService.revokeLicenseFromUser(userId);
      toast({
        title: "License Revoked",
        description: "User license has been revoked.",
      });
      await loadAdminData();
    } catch (error) {
      console.error("Error revoking user license:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke user license.",
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
                Manage users, licenses, and system statistics
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
                  {stats.licensedUsers} licensed
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
                <Key className="h-4 w-4 text-muted-foreground" />
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
                  License Keys
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeLicenses}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.unusedLicenses} unused
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="licenses">License Keys</TabsTrigger>
            <TabsTrigger value="cv-limits">CV Limits</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and license status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>License Status</TableHead>
                      <TableHead>CVs Saved</TableHead>
                      <TableHead>Actions</TableHead>
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
                          {user.isLicensed ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Licensed
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unlicensed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.cvCount || 0}/3</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.isLicensed ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleRevokeLicenseFromUser(user.userId)
                                }
                              >
                                Revoke License
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleGrantLicense(user.userId)}
                              >
                                Grant License
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Keys Tab */}
          <TabsContent value="licenses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>License Key Management</CardTitle>
                    <CardDescription>
                      Generate and manage license keys
                    </CardDescription>
                  </div>
                  <Button onClick={handleGenerateLicense}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>License Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Activated By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => (
                      <TableRow key={license.id}>
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-2">
                            {license.key}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyLicense(license.key)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {license.activatedBy ? (
                            <Badge className="bg-blue-500">Activated</Badge>
                          ) : license.isActive ? (
                            <Badge className="bg-green-500">Available</Badge>
                          ) : (
                            <Badge variant="destructive">Revoked</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(license.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {license.activatedBy || "Not activated"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!license.activatedBy && license.isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRevokeLicense(license.id)}
                              >
                                Revoke
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteLicense(license.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
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
  adminService: AppwriteAdminDatabaseService;
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
