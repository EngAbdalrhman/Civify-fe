"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { UserDialog, UsersTable } from '@/features/admin-dashboard/users';
import { useAdminUsers } from '@/features/admin-dashboard/users/hooks/useAdminUsers';
import type { AdminUser } from '@/services/admin.service';

// Map AdminUser to the User type expected by UsersTable
function mapToUserTableFormat(user: AdminUser) {
  return {
    id: String(user.id),
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
    email: user.email,
    isActive: !user.accountLocked,
    plan: user.currentPlan || 'free',
    role: 'user', // TODO: Map from backend groups
    credits: user.customApiLimit || 0,
    createdAt: user.createdAt,
  };
}

export default function UsersPage() {
  const t = useTranslations('admin.users');
  const common = useTranslations('common');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<ReturnType<typeof mapToUserTableFormat> | undefined>(undefined);
  
  const {
    users: apiUsers,
    isLoading,
    error,
    pagination,
    fetchUsers,
    refresh,
  } = useAdminUsers({ pageSize: 10 });

  // Map API users to table format
  const users = apiUsers.map(mapToUserTableFormat);

  const handleCreateUser = () => {
    setDialogMode('create');
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  const handleEditUser = (user: ReturnType<typeof mapToUserTableFormat>) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleToggleBan = async (userId: string) => {
    // TODO: Implement ban/unban via API
    console.log('Toggle ban for user:', userId);
    await refresh();
  };

  const activeUsersCount = users.filter(u => u.isActive).length;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={() => fetchUsers(0)}>Retry</Button>
      </div>
    );
  }

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
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : pagination.totalElements}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('activeUsers')}</h3>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeUsersCount}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('newUsers')}</h3>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">+{pagination.totalElements > 0 ? Math.floor(pagination.totalElements * 0.1) : 0}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <UsersTable 
          users={users}
          onEdit={handleEditUser}
          onToggleBan={handleToggleBan}
        />
      )}

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={selectedUser}
      />
    </div>
  );
}
