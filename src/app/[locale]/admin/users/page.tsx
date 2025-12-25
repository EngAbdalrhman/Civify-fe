"use client";

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { UserPlus, Ban, Edit } from 'lucide-react';
import { UserDialog } from '@/features/admin-dashboard/users';
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
      label: 'ID',
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.MATCH
    },
    {
      key: 'email',
      label: t('email'),
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperation: FilterOperation.MATCH
    },
    {
      key: 'name',
      label: t('name'),
      render: (_: unknown, item: AdminUser) => (
        <span>{item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown'}</span>
      )
    },
    {
      key: 'currentPlan',
      label: t('plan'),
        render: (_: unknown, item: AdminUser) => (
            <Badge variant="outline">{item.currentPlan || 'Free'}</Badge>
        )
    },
    {
      key: 'active',
      label: t('status'),
      render: (_: unknown, item: AdminUser) => (
        <Badge variant={!item.accountLocked ? 'default' : 'destructive'}>
          {!item.accountLocked ? 'Active' : 'Banned'}
        </Badge>
      )
    },
    {
        key: 'createdAt',
        label: common('date'),
        sortable: true,
        render: (_: unknown, item: AdminUser) => <span>{new Date(item.createdAt).toLocaleDateString()}</span>
    }
  ], [t, common]);

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

      <div className="bg-card rounded-lg border shadow-sm">
         <GenericList
            data={users}
            columns={columns as any} // Cast to satisfy loose types if needed
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
