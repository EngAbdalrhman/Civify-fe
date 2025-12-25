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
    filterUsers,
    refresh,
    fetchUsers
  } = useAdminUsers({ pageSize: 10 });

  const [metrics, setMetrics] = useState({
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0
  });

  // Fetch stats on mount only
  useEffect(() => {
      const loadStats = async () => {
          try {
              const stats = await adminService.getStats('MONTHLY');
              setMetrics({
                  totalUsers: stats.totalUsers,
                  activeUsers: stats.subscribedUsers,
                  newUsers: 0
              });
          } catch (error) {
              console.error("Failed to load stats", error);
          }
      };
      loadStats();
  }, []); // Empty dependency array = run once on mount


  const handleCreateUser = () => {
    setDialogMode('create');
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setDialogMode('edit');
    setSelectedUser({
         id: String(user.id),
         name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
         email: user.email,
         role: 'user', // Default since not in AdminUser
         plan: user.currentPlan || 'free',
         credits: user.customApiLimit || 0
    });
    setDialogOpen(true);
  };

  const handleToggleBan = async (user: AdminUser) => {
    console.log('Toggle ban for user:', user.id);
    await refresh();
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
      filterType: 'text',
      filterOperation: FilterOperation.MATCH
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
  ], [t]);

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

  const handleSortChange = (sort: any) => {
      console.log("Sort changed", sort);
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
