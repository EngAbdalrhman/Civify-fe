"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AdminDatabaseService } from "@/lib/services/admin-database";
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
  const [adminService] = useState(() => new AdminDatabaseService());

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
        const { DatabaseService } = await import("@/lib/services/database");
        const db = new DatabaseService(user.uid);
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
        id: "",
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
      await adminService.grantLicense(userId);
      toast({
        title: "License Granted",
        description: "User has been granted a license.",
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
            <TabsTrigger value="migration">Migration</TabsTrigger>
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

          {/* Migration Tab */}
          <TabsContent value="migration">
            <MigrationTab adminService={adminService} toast={toast} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Migration Tab Component
function MigrationTab({
  adminService,
  toast,
}: {
  adminService: AdminDatabaseService;
  toast: any;
}) {
  const [loading, setLoading] = useState(false);
  const [oldCVsInfo, setOldCVsInfo] = useState<{
    totalOldCVs: number;
    usersWithOldCVs: number;
    details: { userId: string; email: string; oldCVCount: number }[];
  } | null>(null);
  const [migrationResult, setMigrationResult] = useState<{
    totalDeleted: number;
    usersAffected: number;
    details: { userId: string; email: string; deletedCount: number }[];
  } | null>(null);

  const handleCheckOldCVs = async () => {
    setLoading(true);
    try {
      const result = await adminService.getOldCVsCount();
      setOldCVsInfo(result);
      toast({
        title: "Scan Complete",
        description: `Found ${result.totalOldCVs} old CVs across ${result.usersWithOldCVs} users.`,
      });
    } catch (error) {
      console.error("Error checking old CVs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to scan for old CVs.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTruncateOldCVs = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all old CVs? This action cannot be undone!"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await adminService.truncateOldCVs();
      setMigrationResult(result);
      setOldCVsInfo(null);
      toast({
        title: "Migration Complete! 🎉",
        description: `Deleted ${result.totalDeleted} old CVs from ${result.usersAffected} users.`,
      });
    } catch (error) {
      console.error("Error truncating old CVs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to truncate old CVs.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CV Migration Utility</CardTitle>
        <CardDescription>
          Manage migration from old CV storage format to Appwrite Storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            About This Tool
          </h3>
          <p className="text-sm text-blue-800">
            This utility helps you migrate from the old CV storage format
            (storing CV text directly in Firebase) to the new Appwrite Storage
            format. Old CVs without a{" "}
            <code className="bg-blue-100 px-1 rounded">fileId</code> will be
            identified and can be deleted.
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleCheckOldCVs}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            {loading ? "Scanning..." : "Scan for Old CVs"}
          </Button>
          <Button
            onClick={handleTruncateOldCVs}
            disabled={loading || !oldCVsInfo || oldCVsInfo.totalOldCVs === 0}
            variant="destructive"
            className="flex-1"
          >
            {loading ? "Deleting..." : "Delete All Old CVs"}
          </Button>
        </div>

        {oldCVsInfo && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">
              Scan Results
            </h3>
            <p className="text-sm text-yellow-800 mb-4">
              Found <strong>{oldCVsInfo.totalOldCVs}</strong> old CVs across{" "}
              <strong>{oldCVsInfo.usersWithOldCVs}</strong> users.
            </p>
            {oldCVsInfo.details.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Old CVs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oldCVsInfo.details.map((detail) => (
                      <TableRow key={detail.userId}>
                        <TableCell>{detail.email}</TableCell>
                        <TableCell>{detail.oldCVCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {migrationResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              Migration Complete! ✅
            </h3>
            <p className="text-sm text-green-800 mb-4">
              Successfully deleted{" "}
              <strong>{migrationResult.totalDeleted}</strong> old CVs from{" "}
              <strong>{migrationResult.usersAffected}</strong> users.
            </p>
            {migrationResult.details.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Deleted CVs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {migrationResult.details.map((detail) => (
                      <TableRow key={detail.userId}>
                        <TableCell>{detail.email}</TableCell>
                        <TableCell>{detail.deletedCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
