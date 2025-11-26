"use client";

import { useState, useEffect } from "react";
import { GenericList } from "@/components/generic-list/GenericList";
import {
  ColumnDef,
  ActionDef,
  FilterOperation,
} from "@/components/generic-list/types";
import {
  adminService,
  type InputDataModel,
  type FilterCriteria,
  type SortCriteria,
} from "@/lib/api/services/admin.service";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, CheckCircle, XCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Plan type definition
interface Plan {
  id: number;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  active: boolean;
  cvLimit?: number;
  apiLimit?: number;
  watermark?: boolean;
  dashboard?: boolean;
  createdAt: string;
}

export function AdminPlansTab() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const [currentFilters, setCurrentFilters] = useState<FilterCriteria[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const loadPlans = async (filterInput?: InputDataModel) => {
    setLoading(true);
    try {
      const inputData: InputDataModel = filterInput || {
        filters: currentFilters,
        page: pagination.page,
        size: pagination.size,
      };

      const response = await adminService.filterPlans(inputData);

      if (response.success || response.status === 'success') {
        if (response.data) {
          const pagedData = response.data;
          setPlans(pagedData.content);
          setPagination({
            page: pagedData.page,
            size: pagedData.size,
            totalElements: pagedData.totalElements,
            totalPages: pagedData.totalPages,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load plans.",
        });
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load plans.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      monthlyPrice: Number(formData.get("monthlyPrice")),
      annualPrice: Number(formData.get("annualPrice")),
      cvLimit: Number(formData.get("cvLimit")) || null,
      apiLimit: Number(formData.get("apiLimit")) || null,
      watermark: formData.get("watermark") === "on",
      dashboard: formData.get("dashboard") === "on",
      active: formData.get("active") === "on",
    };

    try {
      await adminService.createPlan(data);
      toast({
        title: "Success",
        description: "Plan created successfully",
      });
      setIsCreateModalOpen(false);
      loadPlans();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create plan",
      });
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      monthlyPrice: Number(formData.get("monthlyPrice")),
      annualPrice: Number(formData.get("annualPrice")),
      cvLimit: Number(formData.get("cvLimit")) || null,
      apiLimit: Number(formData.get("apiLimit")) || null,
      watermark: formData.get("watermark") === "on",
      dashboard: formData.get("dashboard") === "on",
      active: formData.get("active") === "on",
    };

    try {
      await adminService.updatePlan(selectedPlan.id, data);
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
      setIsEditModalOpen(false);
      loadPlans();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update plan",
      });
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      if (plan.active) {
        await adminService.deactivatePlan(plan.id);
      } else {
        await adminService.activatePlan(plan.id);
      }
      toast({
        title: "Success",
        description: `Plan ${plan.active ? "deactivated" : "activated"} successfully`,
      });
      loadPlans();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update plan status",
      });
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) return;

    try {
      await adminService.deletePlan(plan.id);
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
      loadPlans();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete plan",
      });
    }
  };

  const columns: ColumnDef<Plan>[] = [
    {
      key: "id",
      label: "ID",
      type: "text",
      sortable: true,
    },
    {
      key: "name",
      label: "Name",
      type: "text",
      sortable: true,
      filterable: true,
      filterType: "text",
      filterOperation: FilterOperation.MATCH,
    },
    {
      key: "monthlyPrice",
      label: "Monthly Price",
      type: "number",
      sortable: true,
      render: (value) => `${value} EGP`,
    },
    {
      key: "annualPrice",
      label: "Annual Price",
      type: "number",
      sortable: true,
      render: (value) => `${value} EGP`,
    },
    {
      key: "active",
      label: "Status",
      type: "status",
      sortable: true,
      filterable: true,
      filterType: "dropdown",
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
      ],
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      type: "date",
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : "-",
    },
  ];

  const actions: ActionDef<Plan>[] = [
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: (item) => {
        setSelectedPlan(item);
        setIsEditModalOpen(true);
      },
    },
    {
      label: "Toggle Status",
      icon: (item: Plan) => item.active ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />,
      onClick: handleToggleStatus,
    },
    {
      label: "Delete",
      icon: <Trash2 />,
      onClick: handleDeletePlan,
      // variant: "destructive",
    },
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    const filterCriteria: FilterCriteria[] = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => {
        const column = columns.find((col) => col.key === key);
        const operation = column?.filterOperation || FilterOperation.MATCH;

        return {
          fieldName: key,
          operation,
          value: value,
        };
      });

    setCurrentFilters(filterCriteria);
    loadPlans({
      filters: filterCriteria,
      page: 0,
      size: pagination.size,
    });
  };

  const handleSortChange = (sort: { field: string; direction: "ASC" | "DESC" }) => {
    let sortCriteria: SortCriteria[] = [];
    if (sort.field) {
      sortCriteria = [{ fieldName: sort.field, direction: sort.direction }];
    }
    loadPlans({
      filters: currentFilters,
      sorts: sortCriteria,
      page: 0,
      size: pagination.size,
    });
  };

  const handlePageChange = (newPage: number) => {
    loadPlans({
      filters: currentFilters,
      page: newPage,
      size: pagination.size,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <GenericList
        data={plans}
        columns={columns}
        actions={actions}
        isLoading={loading}
        emptyMessage="No plans found"
        meta={pagination}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onRefresh={() => loadPlans()}
        defaultSort={{ field: 'id', direction: 'DESC' }}
      />

      {/* Create Plan Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>Add a new subscription plan to the system.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePlan}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="active">Active</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="active" name="active" defaultChecked />
                    <Label htmlFor="active">Enable Plan</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice">Monthly Price (EGP)</Label>
                  <Input id="monthlyPrice" name="monthlyPrice" type="number" min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualPrice">Annual Price (EGP)</Label>
                  <Input id="annualPrice" name="annualPrice" type="number" min="0" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cvLimit">CV Limit</Label>
                  <Input id="cvLimit" name="cvLimit" type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiLimit">API Limit</Label>
                  <Input id="apiLimit" name="apiLimit" type="number" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="watermark" name="watermark" defaultChecked />
                  <Label htmlFor="watermark">Watermark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="dashboard" name="dashboard" />
                  <Label htmlFor="dashboard">Dashboard Access</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit">Create Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>Update existing subscription plan details.</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <form onSubmit={handleUpdatePlan}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input id="edit-name" name="name" defaultValue={selectedPlan.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-active">Active</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="edit-active" name="active" defaultChecked={selectedPlan.active} />
                      <Label htmlFor="edit-active">Enable Plan</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" name="description" defaultValue={selectedPlan.description} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-monthlyPrice">Monthly Price (EGP)</Label>
                    <Input id="edit-monthlyPrice" name="monthlyPrice" type="number" min="0" defaultValue={selectedPlan.monthlyPrice} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-annualPrice">Annual Price (EGP)</Label>
                    <Input id="edit-annualPrice" name="annualPrice" type="number" min="0" defaultValue={selectedPlan.annualPrice} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-cvLimit">CV Limit</Label>
                    <Input id="edit-cvLimit" name="cvLimit" type="number" min="0" defaultValue={selectedPlan.cvLimit} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-apiLimit">API Limit</Label>
                    <Input id="edit-apiLimit" name="apiLimit" type="number" min="0" defaultValue={selectedPlan.apiLimit} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="edit-watermark" name="watermark" defaultChecked={selectedPlan.watermark} />
                    <Label htmlFor="edit-watermark">Watermark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="edit-dashboard" name="dashboard" defaultChecked={selectedPlan.dashboard} />
                    <Label htmlFor="edit-dashboard">Dashboard Access</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">Update Plan</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
