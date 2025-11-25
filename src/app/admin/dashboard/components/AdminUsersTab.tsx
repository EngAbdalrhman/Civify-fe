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
import { Eye, Edit, CreditCard, KeyRound, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Extended user type for table display
interface UserTableRow extends UserProfile {
  id?: string;
  userId?: string;
  createdAt?: string;
  lastLogin?: string;
  role?: string;
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
      key: "email",
      label: "Email",
      type: "text",
      sortable: true,
      filterable: true,
      filterType: "text",
      filterOperation: FilterOperation.MATCH,
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
      key: "plan",
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
          description: `Viewing details for ${item.email}`,
        });
      },
    },
    {
      label: "Edit User",
      icon: <Edit className="w-4 h-4" />,
      onClick: (item) => {
        toast({
          title: "Edit User",
          description: `Editing ${item.email}`,
        });
      },
      showInMenu: true,
    },
    {
      label: "Set CV Limit",
      icon: <CreditCard className="w-4 h-4" />,
      onClick: (item) => {
        toast({
          title: "Set CV Limit",
          description: `Setting CV limit for ${item.email}`,
        });
      },
      showInMenu: true,
    },
    {
      label: "Set API Limit",
      icon: <KeyRound className="w-4 h-4" />,
      onClick: (item) => {
        toast({
          title: "Set API Limit",
          description: `Setting API limit for ${item.email}`,
        });
      },
      showInMenu: true,
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
    const sortCriteria: SortCriteria[] = [
      {
        fieldName: sort.field,
        direction: sort.direction,
      },
    ];

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
      />
    </div>
  );
}
