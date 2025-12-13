"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserPlus } from 'lucide-react';
import { UserDialog, UsersTable, MOCK_USERS, User } from '@/features/admin-dashboard/users';

export default function UsersPage() {
  const t = useTranslations('admin.users');
  const common = useTranslations('common');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [users, setUsers] = useState(MOCK_USERS);

  const handleCreateUser = () => {
    setDialogMode('create');
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleToggleBan = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, isActive: !user.isActive }
          : user
      )
    );
  };

  const activeUsersCount = users.filter(u => u.isActive).length;
  const newUsersThisMonth = users.filter(u => {
    const userDate = new Date(u.createdAt);
    const now = new Date();
    return userDate.getMonth() === now.getMonth() && 
           userDate.getFullYear() === now.getFullYear();
  }).length;

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
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('activeUsers')}</h3>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{activeUsersCount}</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{t('newUsers')}</h3>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">+{newUsersThisMonth}</div>
        </div>
      </div>

      <UsersTable 
        users={users}
        onEdit={handleEditUser}
        onToggleBan={handleToggleBan}
      />

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={selectedUser}
      />
    </div>
  );
}
