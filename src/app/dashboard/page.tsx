"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useDatabase } from "@/hooks/use-database";
import { CVData, JobApplication, UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  ArrowLeft,
  User,
  LogOut,
  Shield,
  Key,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AppLogo } from "@/components/app/AppLogo";

export default function DashboardPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const database = useDatabase();
  const { toast } = useToast();

  const [cvs, setCvs] = useState<CVData[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
      const [cvsData, jobAppsData, profile] = await Promise.all([
        database.getAllCVs(),
        database.getAllJobApplications(),
        database.getUserProfile(),
      ]);
      setCvs(cvsData);
      setJobApplications(jobAppsData);
      setUserProfile(profile);

      // Check if user is admin
      const adminEmail =
        process.env.NEXT_PUBLIC_ADMIN_EMAIL || "amabdo30@gmail.com";
      const isUserAdmin =
        user?.email === adminEmail || profile?.isAdmin === true;
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!database) return;

    try {
      await database.deleteCVData(cvId);
      setCvs(cvs.filter((cv) => cv.id !== cvId));
      toast({
        title: "CV Deleted",
        description: "Your CV has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete CV.",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isHydrated || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <AppLogo className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600">Manage your CVs and applications</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to CV Builder
            </Button>

            {/* License/API Key Button for Licensed Users */}
            {userProfile?.isLicensed && (
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/api-keys")}
                className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                <Key className="h-4 w-4" />
                API Keys
              </Button>
            )}

            {/* License Activation Button for Non-Licensed Users */}
            {!userProfile?.isLicensed && (
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/license")}
                className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <Key className="h-4 w-4" />
                Activate License
              </Button>
            )}

            {/* Admin Dashboard Button */}
            {isAdmin && (
              <Button
                onClick={() => router.push("/admin/dashboard")}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Button>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cvs.length}/3</div>
              <p className="text-xs text-muted-foreground mt-1">
                {cvs.length >= 3 ? (
                  <span className="text-red-500">Limit reached</span>
                ) : (
                  <span className="text-green-500">
                    {3 - cvs.length} slots available
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Job Applications
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobApplications.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Applications
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  jobApplications.filter(
                    (app) =>
                      app.applicationStatus === "applied" ||
                      app.applicationStatus === "interview"
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CVs Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your CVs</CardTitle>
                <CardDescription>
                  Manage and organize your CV documents
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push("/")}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New CV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {cvs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No CVs found</p>
                <Button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First CV
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cvs.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell className="font-medium">
                        {cv.fileName}
                      </TableCell>
                      <TableCell>{formatDate(cv.createdAt)}</TableCell>
                      <TableCell>{formatDate(cv.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/cv/${cv.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCV(cv.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Job Applications Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Applications</CardTitle>
            <CardDescription>
              Track your job application progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobApplications.length === 0 ? (
              <div className="text-center py-8">
                <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No job applications yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobApplications.slice(0, 5).map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.jobTitle}
                      </TableCell>
                      <TableCell>{app.company}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            app.applicationStatus === "applied"
                              ? "default"
                              : app.applicationStatus === "interview"
                              ? "secondary"
                              : app.applicationStatus === "accepted"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {app.applicationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(app.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
