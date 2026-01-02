"use client";

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { UserPlus, Ban, Edit, Users, UserCheck } from 'lucide-react';
import { UserDialog } from '@/features/admin-dashboard/users';
import { adminService } from '@/services/admin.service';
import { useAdminUsers } from '@/features/admin-dashboard/users/hooks/useAdminUsers';
import { GenericList, buildInputDataModel } from '@/components/generic-list/GenericList';
import { ColumnDef, ActionDef, FilterOperation } from '@/components/generic-list/types';
import type { AdminUser } from '@/services/admin.service';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function UsersPage() {
  const t = useTranslations('admin.users');
  const common = useTranslations('common');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(undefined);

  const {
    users,
    isLoading,
    pagination,
    currentSort,
    filterUsers,
    setSortState,
    refresh,
    fetchUsers
  } = useAdminUsers({ pageSize: 10 });

  const [metrics, setMetrics] = useState({
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0
  });

  const [planOptions, setPlanOptions] = useState<{ label: string; value: string }[]>([]);

  // Fetch stats and plan lookup on mount only
  useEffect(() => {
      const loadInitialData = async () => {
          try {
              const [stats, plans] = await Promise.all([
                  adminService.getStats('MONTHLY'),
                  adminService.getPlanLookup().catch(() => [])
              ]);
              setMetrics({
                  totalUsers: stats.totalUsers,
                  activeUsers: stats.subscribedUsers,
                  newUsers: 0
              });
              setPlanOptions(plans.map(p => ({ label: p.name, value: p.name })));
          } catch (error) {
              console.error("Failed to load initial data", error);
          }
      };
      loadInitialData();
  }, []); // Empty dependency array = run once on mount


  const handleCreateUser = () => {
    setDialogMode('create');
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setDialogMode('edit');
    setSelectedUser({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      groupId: user.groupId?.toString() || '',
      cvLimit: user.cvLimit?.toString() || '',
      extraTokens: user.extraTokens?.toString() || '0',
      accountLocked: user.accountLocked || false,
    });
    setDialogOpen(true);
  };

  const handleToggleBan = async (user: AdminUser) => {
    try {
      await adminService.toggleUserLock(user.id);
      toast.success(user.accountLocked ? 'User unbanned successfully' : 'User banned successfully');
      await refresh();
    } catch (error) {
      console.error('Failed to toggle ban:', error);
      toast.error('Failed to toggle user ban status');
    }
  };

  // Define Columns
  const columns: ColumnDef<AdminUser>[] = useMemo(() => [
    {
      key: 'id',
      label: t('columns.id'), 
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.EQUAL
    },
    {
      key: 'email',
      label: t('columns.email'),
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.MATCH
    },
    {
      key: 'name',
      label: t('columns.name'),
      render: (_: unknown, item: AdminUser) => (
        <span>{item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown'}</span>
      ),
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.MATCH
    },
    {
      key: 'currentPlan',
      label: t('columns.plan'),
        render: (_: unknown, item: AdminUser) => (
            <Badge variant="outline">{item.currentPlan || 'Free'}</Badge>
        ),
      sortable: true,
      filterable: true,
      filterType: 'dropdown',
      filterOperation: FilterOperation.MATCH,
      filterOptions: planOptions.length > 0 ? planOptions : [{ label: 'Free', value: 'Free' }]
    },
    {
      key: 'accountLocked', 
      label: t('columns.status'),
      render: (_: unknown, item: AdminUser) => (
        <Badge variant={!item.accountLocked ? 'default' : 'destructive'}>
          {!item.accountLocked ? 'Active' : 'Banned'}
        </Badge>
      ),
      filterable: true,
      filterType: 'select',
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: 'Active', value: 'false' },
        { label: 'Banned', value: 'true' }
      ]
    },
    {
        key: 'createdAt',
        label: t('columns.date'),
        sortable: true,
        render: (_: unknown, item: AdminUser) => <span>{new Date(item.createdAt).toLocaleDateString()}</span>,
        filterable: true,
        filterType: 'date',
        filterOperation: FilterOperation.DATE_BETWEEN 
    }
  ], [t, planOptions]);

  // Define Actions
  const actions: ActionDef<AdminUser>[] = [
    {
      label: common('edit'),
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditUser,
      variant: 'ghost'
    },
    {
      label: 'Ban/Unban',
      icon: <Ban className="h-4 w-4" />,
      onClick: handleToggleBan,
      variant: 'ghost'
    }
  ];

  const handleFilterChange = (filters: any) => {
      const model = buildInputDataModel(filters, columns as any[], null, 0, 10);
      filterUsers(model.filters || []); // Ensure we pass array
  };

  const handleSortChange = (sort: { field: string; direction: 'ASC' | 'DESC' }) => {
    if (sort.field) {
      setSortState({ fieldName: sort.field, direction: sort.direction });
    }
  };

  const handlePageChange = (page: number) => {
    if (fetchUsers) {
      fetchUsers(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">Manage platform users and roles</p>
        </div>
        <Button onClick={handleCreateUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          {common('create')}
        </Button>
      </div>

       <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('totalUsers')}</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {metrics.totalUsers}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Subscribed Users</h3>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {metrics.activeUsers}
          </div>
        </div>
        {/* Removed New Users card until backend supports it specifically, or use pagination count as proxy? */}
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
         <GenericList
            data={users}
            columns={columns as any}
            meta={pagination}
            isLoading={isLoading}
            actions={actions as any}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onRefresh={refresh}
         />
      </div>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={selectedUser}
      />
    </div>
  );
}
