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
import type { UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Settings, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Extended user type for table display
interface UserTableRow extends UserProfile {
  id?: string;
  userId?: string;
  createdAt?: string;
  lastLogin?: string;
  role?: string;
  cvLimit?: number;
  apiRateLimit?: number;
}

export function AdminUsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const [currentFilters, setCurrentFilters] = useState<FilterCriteria[]>([]);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserTableRow | null>(null);

  const loadUsers = async (filterInput?: InputDataModel) => {
    setLoading(true);
    try {
      // Default filter request
      const inputData: InputDataModel = filterInput || {
        filters: currentFilters,
        page: pagination.page,
        size: pagination.size,
      };

      const response = await adminService.filterUsers(inputData);

      // Check for success (boolean) or status string
      if (response.success || response.status === 'success') {
        if (response.data) {
          const pagedData = response.data;
          setUsers(pagedData.content);
          setPagination({
            page: pagedData.page,
            size: pagedData.size,
            totalElements: pagedData.totalElements,
            totalPages: pagedData.totalPages,
          });
        }
      } else {
        console.error("Failed to load users:", response);
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load users.",
        });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateLimits = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser || !selectedUser.userId) return;

    const formData = new FormData(e.currentTarget);
    const cvLimit = formData.get("cvLimit") ? Number(formData.get("cvLimit")) : undefined;
    const apiLimit = formData.get("apiLimit") ? Number(formData.get("apiLimit")) : undefined;

    try {
      await adminService.updateUserLimits(selectedUser.userId, cvLimit, apiLimit);
      toast({
        title: "Success",
        description: "User limits updated successfully",
      });
      setIsLimitModalOpen(false);
      loadUsers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user limits",
      });
    }
  };

  // Column definitions
  const columns: ColumnDef<UserTableRow>[] = [
    {
      key: "id",
      label: "ID",
      type: "text",
      sortable: true,
      filterable: true,
      filterType: "text",
      filterOperation: FilterOperation.EQUAL,
    },
     {
      key: "username", // Changed from name to username as per API response
      label: "Username",
      type: "text",
      sortable: true,
      filterable: true,
      filterType: "text",
      filterOperation: FilterOperation.MATCH,
    },
    {
      key: "email",
      label: "Email",
      type: "text",
      sortable: true,
      filterable: true,
      filterType: "text",
      filterOperation: FilterOperation.MATCH,
    },
    {
      key: "subscriptions.plan.name",
      label: "Plan",
      type: "text",
      filterable: true,
      filterType: "dropdown",
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: "Free", value: "free" },
        { label: "Premium", value: "premium" },
        { label: "Enterprise", value: "enterprise" },
        { label: "Lifetime", value: "lifetime" },
      ],
      render: (value) => (
        <Badge className={value === "free" || !value ? "bg-gray-500" : "bg-green-500"}>
          {value || "free"}
        </Badge>
      ),
    },
    {
      key: "role", // Changed from isAdmin to role
      label: "Role",
      type: "text",
      filterable: true,
      filterType: "dropdown",
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: "Admin", value: "ROLE_ADMIN" },
        { label: "User", value: "ROLE_USER" },
      ],
      render: (value) =>
        value === "ROLE_ADMIN" ? (
          <Badge className="bg-blue-500">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        ) : (
          <Badge variant="secondary">User</Badge>
        ),
    },
    {
      key: "createdAt",
      label: "Joined",
      type: "date",
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : "-",
    },
  ];

  // Action definitions
  const actions: ActionDef<UserTableRow>[] = [
    {
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      onClick: (item) => {
        toast({
          title: "View Details",
          description: `Viewing details for ${item.username}`,
        });
      },
    },
    {
      label: "Set Limits",
      icon: <Settings className="w-4 h-4" />,
      onClick: (item) => {
        setSelectedUser(item);
        setIsLimitModalOpen(true);
      },
    },
    
  ];

  // Handle filter changes from GenericList
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

    console.log("Sending filter criteria:", filterCriteria);
    setCurrentFilters(filterCriteria);
    loadUsers({
      filters: filterCriteria,
      page: 0,
      size: pagination.size,
    });
  };

  // Handle sort changes from GenericList
  const handleSortChange = (sort: {
    field: string;
    direction: "ASC" | "DESC";
  }) => {
    let sortCriteria: SortCriteria[] = [];
    
    if (sort.field) {
      sortCriteria = [
        {
          fieldName: sort.field,
          direction: sort.direction,
        },
      ];
    }

    loadUsers({
      filters: currentFilters,
      sorts: sortCriteria,
      page: 0,
      size: pagination.size,
    });
  };

  // Handle page changes from GenericList
  const handlePageChange = (newPage: number) => {
    loadUsers({
      filters: currentFilters,
      page: newPage,
      size: pagination.size,
    });
  };

  return (
    <div className="space-y-4">
      <GenericList
        data={users}
        columns={columns}
        actions={actions}
        isLoading={loading}
        emptyMessage="No users found"
        meta={pagination}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onRefresh={() => loadUsers()}
        defaultSort={{ field: 'id', direction: 'DESC' }}
      />

      {/* Set Limits Modal */}
      <Dialog open={isLimitModalOpen} onOpenChange={setIsLimitModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set User Limits</DialogTitle>
            <DialogDescription>
              Configure custom limits for {selectedUser?.email}. Leave blank to use plan defaults.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleUpdateLimits}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cvLimit">CV Limit</Label>
                  <Input 
                    id="cvLimit" 
                    name="cvLimit" 
                    type="number" 
                    min="0" 
                    placeholder="Plan Default" 
                    defaultValue={selectedUser.cvLimit} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of CVs the user can create.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiLimit">API Rate Limit</Label>
                  <Input 
                    id="apiLimit" 
                    name="apiLimit" 
                    type="number" 
                    min="0" 
                    placeholder="Plan Default" 
                    defaultValue={selectedUser.apiRateLimit} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum API calls per month.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsLimitModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Limits</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
