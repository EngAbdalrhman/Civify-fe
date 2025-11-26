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
import { Edit, Trash2, CheckCircle, XCircle, Plus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Promo Code type definition
interface PromoCode {
  id: number;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minimumPurchase: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  createdAt: string;
}

export function AdminPromoCodesTab() {
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
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
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);

  const loadPromoCodes = async (filterInput?: InputDataModel) => {
    setLoading(true);
    try {
      const inputData: InputDataModel = filterInput || {
        filters: currentFilters,
        page: pagination.page,
        size: pagination.size,
      };

      const response = await adminService.filterPromoCodes(inputData);

      if (response.success || response.status === 'success') {
        if (response.data) {
          const pagedData = response.data;
          setPromoCodes(pagedData.content);
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
          description: response.message || "Failed to load promo codes.",
        });
      }
    } catch (error) {
      console.error("Error loading promo codes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load promo codes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const handleCreatePromo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Format date to ISO string if present
    let expiresAt = formData.get("expiresAt") as string;
    if (expiresAt) {
        expiresAt = new Date(expiresAt).toISOString();
    }

    const data = {
      code: formData.get("code"),
      description: formData.get("description"),
      discountType: formData.get("discountType"),
      discountValue: Number(formData.get("discountValue")),
      minimumPurchase: Number(formData.get("minimumPurchase")) || 0,
      usageLimit: Number(formData.get("usageLimit")) || null,
      expiresAt: expiresAt || null,
      active: formData.get("active") === "on",
    };

    try {
      await adminService.createPromoCode(data);
      toast({
        title: "Success",
        description: "Promo code created successfully",
      });
      setIsCreateModalOpen(false);
      loadPromoCodes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create promo code",
      });
    }
  };

  const handleUpdatePromo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPromo) return;

    const formData = new FormData(e.currentTarget);
    
    // Format date to ISO string if present
    let expiresAt = formData.get("expiresAt") as string;
    if (expiresAt) {
        expiresAt = new Date(expiresAt).toISOString();
    }

    const data = {
      code: formData.get("code"),
      description: formData.get("description"),
      discountType: formData.get("discountType"),
      discountValue: Number(formData.get("discountValue")),
      minimumPurchase: Number(formData.get("minimumPurchase")) || 0,
      usageLimit: Number(formData.get("usageLimit")) || null,
      expiresAt: expiresAt || null,
      active: formData.get("active") === "on",
    };

    try {
      await adminService.updatePromoCode(selectedPromo.id, data);
      toast({
        title: "Success",
        description: "Promo code updated successfully",
      });
      setIsEditModalOpen(false);
      loadPromoCodes();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update promo code",
      });
    }
  };

  const handleDeactivate = async (promo: PromoCode) => {
    try {
      await adminService.deactivatePromoCode(promo.id);
      toast({
        title: "Success",
        description: "Promo code deactivated successfully",
      });
      loadPromoCodes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to deactivate promo code",
      });
    }
  };

  const handleDelete = async (promo: PromoCode) => {
    if (!confirm("Are you sure you want to delete this promo code? This action cannot be undone.")) return;

    try {
      await adminService.deletePromoCode(promo.id);
      toast({
        title: "Success",
        description: "Promo code deleted successfully",
      });
      loadPromoCodes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete promo code",
      });
    }
  };

  const columns: ColumnDef<PromoCode>[] = [
    {
      key: "code",
      label: "Code",
      type: "text",
      sortable: true,
      filterable: true,
      filterType: "text",
      filterOperation: FilterOperation.MATCH,
      render: (value) => (
        <div className="flex items-center font-mono font-bold text-blue-600">
          <Tag className="w-3 h-3 mr-2" />
          {value}
        </div>
      ),
    },
    {
      key: "discountValue",
      label: "Discount",
      type: "number",
      sortable: true,
      render: (value, item) => (
        <Badge variant="outline">
          {item.discountType === "PERCENTAGE" 
            ? `${(value).toFixed(0)}%` 
            : `${value} EGP`}
        </Badge>
      ),
    },
    {
      key: "usedCount",
      label: "Usage",
      type: "number",
      sortable: true,
      render: (value, item) => (
        <div className="text-sm">
          <span className="font-medium">{value}</span>
          <span className="text-gray-500"> / {item.usageLimit || "∞"}</span>
        </div>
      ),
    },
    {
      key: "expiresAt",
      label: "Expires",
      type: "date",
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-gray-500">Never</span>;
        const date = new Date(value);
        const isExpired = date < new Date();
        return (
          <span className={isExpired ? "text-red-500 font-medium" : ""}>
            {date.toLocaleDateString()}
          </span>
        );
      },
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
  ];

  const actions: ActionDef<PromoCode>[] = [
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: (item) => {
        setSelectedPromo(item);
        setIsEditModalOpen(true);
      },
    },
    {
      label: "Deactivate",
      icon: <XCircle className="w-4 h-4 text-orange-500" />,
      onClick: handleDeactivate,
      // Only show if active
      // Note: GenericList doesn't support conditional actions per row yet, 
      // but we can handle it in the click handler or update GenericList later.
      // For now, we show it always but it's harmless if already inactive.
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      onClick: handleDelete,
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
    loadPromoCodes({
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
    loadPromoCodes({
      filters: currentFilters,
      sorts: sortCriteria,
      page: 0,
      size: pagination.size,
    });
  };

  const handlePageChange = (newPage: number) => {
    loadPromoCodes({
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
          Create Promo Code
        </Button>
      </div>

      <GenericList
        data={promoCodes}
        columns={columns}
        actions={actions}
        isLoading={loading}
        emptyMessage="No promo codes found"
        meta={pagination}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onRefresh={() => loadPromoCodes()}
        defaultSort={{ field: 'createdAt', direction: 'DESC' }}
      />

      {/* Create Promo Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
            <DialogDescription>Add a new promotional code.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePromo}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" name="code" placeholder="SUMMER2024" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="active">Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="active" name="active" defaultChecked />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Summer sale discount..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select name="discountType" defaultValue="PERCENTAGE">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount (EGP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Value</Label>
                  <Input 
                    id="discountValue" 
                    name="discountValue" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    required 
                    placeholder="0.20 for 20% or 50 for 50 EGP"
                  />
                  <p className="text-xs text-muted-foreground">
                    For percentage: 0.20 = 20%. For fixed: 50 = 50 EGP.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumPurchase">Min Purchase</Label>
                  <Input id="minimumPurchase" name="minimumPurchase" type="number" min="0" defaultValue="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input id="usageLimit" name="usageLimit" type="number" min="0" placeholder="Unlimited" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At</Label>
                  <Input id="expiresAt" name="expiresAt" type="datetime-local" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit">Create Code</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Promo Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
            <DialogDescription>Update existing promo code details.</DialogDescription>
          </DialogHeader>
          {selectedPromo && (
            <form onSubmit={handleUpdatePromo}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">Code</Label>
                    <Input id="edit-code" name="code" defaultValue={selectedPromo.code} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-active">Status</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch id="edit-active" name="active" defaultChecked={selectedPromo.active} />
                      <Label htmlFor="edit-active">Active</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" name="description" defaultValue={selectedPromo.description} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-discountType">Discount Type</Label>
                    <Select name="discountType" defaultValue={selectedPromo.discountType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount (EGP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-discountValue">Value</Label>
                    <Input 
                      id="edit-discountValue" 
                      name="discountValue" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      defaultValue={selectedPromo.discountValue}
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-minimumPurchase">Min Purchase</Label>
                    <Input id="edit-minimumPurchase" name="minimumPurchase" type="number" min="0" defaultValue={selectedPromo.minimumPurchase} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-usageLimit">Usage Limit</Label>
                    <Input id="edit-usageLimit" name="usageLimit" type="number" min="0" defaultValue={selectedPromo.usageLimit} placeholder="Unlimited" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-expiresAt">Expires At</Label>
                    <Input 
                        id="edit-expiresAt" 
                        name="expiresAt" 
                        type="datetime-local" 
                        defaultValue={selectedPromo.expiresAt ? new Date(selectedPromo.expiresAt).toISOString().slice(0, 16) : ""} 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit">Update Code</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
