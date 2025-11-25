'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { GenericList } from '@/components/generic-list/GenericList';
import { ColumnDef, ActionDef, FilterOperation } from '@/components/generic-list/types';
import {
  adminService,
  type InputDataModel,
  type FilterCriteria,
  type SortCriteria,
  type PagedResponse,
} from '@/lib/api/services/admin.service';
import type { UserProfile, ApiResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/app/Loader';
import { Eye, Edit, CreditCard, KeyRound, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Extended user type for table display
interface UserTableRow extends UserProfile {
  id?: string;
  userId?: string;
  createdAt?: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'amabdo30@gmail.com';
      
      if (user.email === adminEmail || user.isAdmin) {
        setIsAdmin(true);
        await loadUsers();
      } else {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
        });
        router.push('/');
      }
    };

    checkAdminStatus();
  }, [user, router, toast]);

  const loadUsers = async (filterInput?: InputDataModel) => {
    setLoading(true);
    try {
      // Default filter request
      const inputData: InputDataModel = filterInput || {
        filters: [],
        page: 0,
        size: 10,
      };

      const response = await adminService.filterUsers(inputData);
      
      if (response.success && response.data) {
        const pagedData = response.data;
        setUsers(pagedData.content);
        setPagination({
          page: pagedData.page,
          size: pagedData.size,
          totalElements: pagedData.totalElements,
          totalPages: pagedData.totalPages,
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Column definitions
  const columns: ColumnDef<UserTableRow>[] = [
    {
      key: 'email',
      label: 'Email',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.MATCH,
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.MATCH,
    },
    {
      key: 'plan',
      label: 'Plan',
      type: 'text',
      filterable: true,
      filterType: 'dropdown',
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: 'Free', value: 'free' },
        { label: 'Premium', value: 'premium' },
        { label: 'Enterprise', value: 'enterprise' },
        { label: 'Lifetime', value: 'lifetime' },
      ],
      render: (value) => (
        <Badge className={value === 'free' ? 'bg-gray-500' : 'bg-green-500'}>
          {value || 'free'}
        </Badge>
      ),
    },
    {
      key: 'cvCount',
      label: 'CVs',
      type: 'text',
      render: (value, item) => (
        <span className={(item.cvCount || 0) >= (item.cvLimit || 3) ? 'text-red-600 font-semibold' : ''}>
          {item.cvCount || 0}/{item.cvLimit || 3}
        </span>
      ),
    },
    {
      key: 'apiUsageCount',
      label: 'API Usage',
      type: 'text',
      render: (value, item) => (
        <span
          className={
            (item.apiUsageCount || 0) >= (item.apiRateLimit || 500)
              ? 'text-red-600 font-semibold'
              : ''
          }
        >
          {item.apiUsageCount || 0}/{item.apiRateLimit || 500}
        </span>
      ),
    },
    {
      key: 'isAdmin',
      label: 'Role',
      type: 'text',
      filterable: true,
      filterType: 'dropdown',
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: 'Admin', value: 'true' },
        { label: 'User', value: 'false' },
      ],
      render: (value) => (
        value ? (
          <Badge className="bg-blue-500">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        ) : (
          <Badge variant="secondary">User</Badge>
        )
      ),
    },
  ];

  // Action definitions
  const actions: ActionDef<UserTableRow>[] = [
    {
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: (item) => {
        toast({
          title: 'View Details',
          description: `Viewing details for ${item.email}`,
        });
        // TODO: Navigate to user details page
      },
    },
    {
      label: 'Edit User',
      icon: <Edit className="w-4 h-4" />,
      onClick: (item) => {
        toast({
          title: 'Edit User',
          description: `Editing ${item.email}`,
        });
        // TODO: Open edit modal or navigate to edit page
      },
      showInMenu: true,
    },
    {
      label: 'Set CV Limit',
      icon: <CreditCard className="w-4 h-4" />,
      onClick: (item) => {
        toast({
          title: 'Set CV Limit',
          description: `Setting CV limit for ${item.email}`,
        });
        // TODO: Open CV limit modal
      },
      showInMenu: true,
    },
    {
      label: 'Set API Limit',
      icon: <KeyRound className="w-4 h-4" />,
      onClick: (item) => {
        toast({
          title: 'Set API Limit',
          description: `Setting API limit for ${item.email}`,
        });
        // TODO: Open API limit modal
      },
      showInMenu: true,
    },
  ];

  // Handle filter changes from GenericList
  const handleFilterChange = (filters: Record<string, any>) => {
    const filterCriteria: FilterCriteria[] = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        // Find the column to get its filter operation
        const column = columns.find((col) => col.key === key);
        const operation = column?.filterOperation || FilterOperation.MATCH;

        // Handle boolean values for isAdmin
        let processedValue = value;
        if (key === 'isAdmin') {
          processedValue = value === 'true';
        }

        return {
          fieldName: key,
          operation,
          value: processedValue,
        };
      });

    loadUsers({
      filters: filterCriteria,
      page: 0,
      size: pagination.size,
    });
  };

  // Handle sort changes from GenericList
  const handleSortChange = (sort: { field: string; direction: 'ASC' | 'DESC' }) => {
    const sortCriteria: SortCriteria[] = [
      {
        fieldName: sort.field,
        direction: sort.direction,
      },
    ];

    loadUsers({
      filters: [], // TODO: Preserve existing filters
      sorts: sortCriteria,
      page: 0,
      size: pagination.size,
    });
  };

  // Handle page changes from GenericList
  const handlePageChange = (newPage: number) => {
    loadUsers({
      filters: [], // TODO: Preserve existing filters
      page: newPage,
      size: pagination.size,
    });
  };

  if (loading && users.length === 0) {
    return <Loader message="Loading users..." />;
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
              <div className="flex items-center gap-4 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin/dashboard')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <Shield className="h-10 w-10 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage users with advanced filtering and search capabilities
              </p>
            </div>
          </div>
        </div>

        {/* Users List */}
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
    </div>
  );
}
