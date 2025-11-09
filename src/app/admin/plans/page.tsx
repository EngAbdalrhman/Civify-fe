"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { adminPlanService } from "@/lib/api/services/admin-plan.service";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/app/Loader";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import type { SubscriptionPlan, CreatePlanRequest } from "@/lib/api/types";

export default function AdminPlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [formData, setFormData] = useState<CreatePlanRequest>({
    name: "",
    description: "",
    details: "",
    cvLimit: null,
    apiLimit: null,
    watermark: true,
    dashboard: false,
    monthlyPrice: "0",
    annualPrice: "0",
    active: true,
  });

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
        await loadPlans();
      } else {
        // Check database for admin flag
        const { AppwriteDatabaseService } = await import(
          "@/lib/services/appwrite-database"
        );
        const db = new AppwriteDatabaseService(user.uid);
        const profile = await db.getUserProfile();

        if (profile?.isAdmin) {
          setIsAdmin(true);
          await loadPlans();
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

  const loadPlans = async () => {
    try {
      const plansData = await adminPlanService.getAllPlansAdmin();
      setPlans(plansData);
    } catch (error: any) {
      console.error("Error loading plans:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load plans.",
      });
    }
  };

  const handleCreatePlan = async () => {
    try {
      const response = await adminPlanService.createPlan(formData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Plan created successfully.",
        });
        setShowCreateDialog(false);
        resetForm();
        await loadPlans();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to create plan.",
        });
      }
    } catch (error: any) {
      console.error("Error creating plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create plan.",
      });
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;

    try {
      const response = await adminPlanService.updatePlan(
        selectedPlan.id,
        formData
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Plan updated successfully.",
        });
        setShowEditDialog(false);
        setSelectedPlan(null);
        resetForm();
        await loadPlans();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to update plan.",
        });
      }
    } catch (error: any) {
      console.error("Error updating plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update plan.",
      });
    }
  };

  const handleActivatePlan = async (planId: number) => {
    try {
      const response = await adminPlanService.activatePlan(planId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Plan activated successfully.",
        });
        await loadPlans();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to activate plan.",
        });
      }
    } catch (error: any) {
      console.error("Error activating plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to activate plan.",
      });
    }
  };

  const handleDeactivatePlan = async (planId: number) => {
    try {
      const response = await adminPlanService.deactivatePlan(planId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Plan deactivated successfully.",
        });
        await loadPlans();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to deactivate plan.",
        });
      }
    } catch (error: any) {
      console.error("Error deactivating plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to deactivate plan.",
      });
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const response = await adminPlanService.deletePlan(planId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Plan deleted successfully.",
        });
        await loadPlans();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to delete plan.",
        });
      }
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete plan.",
      });
    }
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      details: plan.details,
      cvLimit: plan.cvLimit,
      apiLimit: plan.apiLimit,
      watermark: plan.watermark,
      dashboard: plan.dashboard,
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      details: "",
      cvLimit: null,
      apiLimit: null,
      watermark: true,
      dashboard: false,
      monthlyPrice: "0",
      annualPrice: "0",
      active: true,
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Plan Management</h1>
            <p className="text-muted-foreground">
              Manage subscription plans and pricing
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            All subscription plans including inactive ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>CV Limit</TableHead>
                <TableHead>API Limit</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Annual Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {plan.description}
                    </TableCell>
                    <TableCell>
                      {plan.cvLimit === null ? "Unlimited" : plan.cvLimit}
                    </TableCell>
                    <TableCell>
                      {plan.apiLimit === null ? "Unlimited" : plan.apiLimit}
                    </TableCell>
                    <TableCell>${plan.monthlyPrice}</TableCell>
                    <TableCell>${plan.annualPrice}</TableCell>
                    <TableCell>
                      {plan.active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {plan.active ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeactivatePlan(plan.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleActivatePlan(plan.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>
              Create a new subscription plan with pricing and features
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Premium"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Short description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                placeholder="Detailed plan features"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cvLimit">CV Limit</Label>
                <Input
                  id="cvLimit"
                  type="number"
                  value={formData.cvLimit ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cvLimit: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apiLimit">API Limit</Label>
                <Input
                  id="apiLimit"
                  type="number"
                  value={formData.apiLimit ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apiLimit: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  value={formData.monthlyPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyPrice: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="annualPrice">Annual Price ($)</Label>
                <Input
                  id="annualPrice"
                  type="number"
                  step="0.01"
                  value={formData.annualPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, annualPrice: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="watermark">Watermark</Label>
              <Switch
                id="watermark"
                checked={formData.watermark}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, watermark: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dashboard">Dashboard Access</Label>
              <Switch
                id="dashboard"
                checked={formData.dashboard}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, dashboard: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePlan}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update plan details. Changes may be restricted if there are active
              subscriptions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Plan Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-details">Details</Label>
              <Textarea
                id="edit-details"
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-cvLimit">CV Limit</Label>
                <Input
                  id="edit-cvLimit"
                  type="number"
                  value={formData.cvLimit ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cvLimit: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-apiLimit">API Limit</Label>
                <Input
                  id="edit-apiLimit"
                  type="number"
                  value={formData.apiLimit ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apiLimit: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-monthlyPrice">Monthly Price ($)</Label>
                <Input
                  id="edit-monthlyPrice"
                  type="number"
                  step="0.01"
                  value={formData.monthlyPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyPrice: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-annualPrice">Annual Price ($)</Label>
                <Input
                  id="edit-annualPrice"
                  type="number"
                  step="0.01"
                  value={formData.annualPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, annualPrice: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-watermark">Watermark</Label>
              <Switch
                id="edit-watermark"
                checked={formData.watermark}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, watermark: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-dashboard">Dashboard Access</Label>
              <Switch
                id="edit-dashboard"
                checked={formData.dashboard}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, dashboard: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedPlan(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
