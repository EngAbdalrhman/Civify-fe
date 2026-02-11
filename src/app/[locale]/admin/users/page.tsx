"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { UserPlus, Ban, Eye, Users, UserCheck, MoreHorizontal, Shield, Coins, FileText } from 'lucide-react';
import { UserDialog } from '@/features/admin-dashboard/users';
import { adminService } from '@/services/admin.service';
import { useAdminUsers } from '@/features/admin-dashboard/users/hooks/useAdminUsers';
import { GenericList, buildInputDataModel } from '@/components/generic-list/GenericList';
import { ColumnDef, ActionDef, FilterOperation } from '@/components/generic-list/types';
import type { AdminUser } from '@/services/admin.service';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGroups } from '@/features/admin-dashboard/groups';
import { usePermissions } from '@/contexts/PermissionContext';
import { ADMIN_ACTION_PERMISSIONS } from '@/config/adminMenuConfig';

export default function UsersPage() {
  const t = useTranslations('admin.users');
  const tc = useTranslations('admin.common');
  const common = useTranslations('common');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  // Action dialogs
  const [actionDialog, setActionDialog] = useState<{
    type: 'group' | 'limits' | 'tokens' | null;
    user: AdminUser | null;
    value: string;
  }>({ type: null, user: null, value: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasPermission } = usePermissions();

  const canModifyGroup = hasPermission(ADMIN_ACTION_PERMISSIONS.USER_MODIFY_GROUP);
  const { data: groups = [] } = useGroups({ enabled: canModifyGroup });

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
              const shouldFetchStats = hasPermission(ADMIN_ACTION_PERMISSIONS.ADMIN_STATS_VIEW);
              const shouldFetchPlans = hasPermission(ADMIN_ACTION_PERMISSIONS.PLAN_VIEW);

              const [stats, plans] = await Promise.all([
                shouldFetchStats ? adminService.getStats('MONTHLY').catch(() => null) : Promise.resolve(null),
                shouldFetchPlans ? adminService.getPlanLookup().catch(() => []) : Promise.resolve([])
              ]) as [any, any[]];
              
              if (stats) {
                  setMetrics({
                      totalUsers: stats.totalUsers || 0,
                      activeUsers: stats.subscribedUsers || 0,
                      newUsers: 0
                  });
              }
              
              if (plans && Array.isArray(plans)) {
                  setPlanOptions(plans.map((p: any) => ({ label: p.name, value: p.name })));
              }
          } catch (error) {
              console.error("Failed to load initial data", error);
          }
      };
      loadInitialData();
  }, []);


  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleToggleBan = async (user: AdminUser) => {
    try {
      await adminService.toggleUserLock(user.id);
      toast.success(user.status === 'DISABLED' ? t('enableSuccess') : t('disableSuccess'));
      await refresh();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error(t('toggleError'));
    }
  };

  const openActionDialog = (type: 'group' | 'limits' | 'tokens', user: AdminUser) => {
    let initialValue = '';
    if (type === 'group') {
      initialValue = user.groupId?.toString() || '';
    } else if (type === 'limits') {
      initialValue = user.cvLimit?.toString() || '';
    } else if (type === 'tokens') {
      initialValue = user.extraTokens?.toString() || '0';
    }
    setActionDialog({ type, user, value: initialValue });
  };

  const handleActionSubmit = async () => {
    if (!actionDialog.user || !actionDialog.type) return;
    
    setIsSubmitting(true);
    try {
      if (actionDialog.type === 'group') {
        const groupId = parseInt(actionDialog.value);
        if (!isNaN(groupId)) {
          await adminService.updateUserGroup(actionDialog.user.id, groupId);
          toast.success('User group updated');
        }
      } else if (actionDialog.type === 'limits') {
        const cvLimit = actionDialog.value ? parseInt(actionDialog.value) : undefined;
        await adminService.updateUserLimits(actionDialog.user.id, cvLimit);
        toast.success('User limits updated');
      } else if (actionDialog.type === 'tokens') {
        const tokens = parseInt(actionDialog.value) || 0;
        await adminService.updateUserTokens(actionDialog.user.id, tokens);
        toast.success('User tokens updated');
      }
      await refresh();
      setActionDialog({ type: null, user: null, value: '' });
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
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
      key: 'oauthProvider',
      label: 'Source',
      render: (_: unknown, item: AdminUser) => (
        <Badge variant="outline" className={!item.oauthProvider || item.oauthProvider === 'EMAIL' ? 'border-zinc-500' : 'border-blue-500 text-blue-500'}>
          {item.oauthProvider || 'EMAIL'}
        </Badge>
      ),
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: 'Email', value: 'EMAIL' },
        { label: 'Google', value: 'GOOGLE' },
        { label: 'LinkedIn', value: 'LINKEDIN' }
      ]
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
      key: 'status', 
      label: t('columns.status'),
      render: (_: unknown, item: AdminUser) => (
        <Badge variant={item.status === 'ACTIVE' ? 'default' : 'destructive'}>
          {item.status === 'ACTIVE' ? tc('active') : tc('disabled')}
        </Badge>
      ),
      filterable: true,
      filterType: 'select',
      filterOperation: FilterOperation.EQUAL,
      filterOptions: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Disabled', value: 'DISABLED' }
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
    },
    {
        key: 'actions',
        label: tc('actions'),
        render: (_: unknown, item: AdminUser) => {
          const canModifyGroup = hasPermission(ADMIN_ACTION_PERMISSIONS.USER_MODIFY_GROUP);
          const canModifyLimits = hasPermission(ADMIN_ACTION_PERMISSIONS.USER_MODIFY_LIMITS);
          const canModifyTokens = hasPermission(ADMIN_ACTION_PERMISSIONS.USER_MODIFY_TOKENS);
          const canModify = hasPermission(ADMIN_ACTION_PERMISSIONS.USER_EDIT);
          const showDropdown = canModifyGroup || canModifyLimits || canModifyTokens;
          
          return (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleViewUser(item)}>
                <Eye className="h-4 w-4" />
              </Button>
              {canModify && (
                <Button variant="ghost" size="sm" onClick={() => handleToggleBan(item)}>
                  <Ban className="h-4 w-4" />
                </Button>
              )}
              {showDropdown && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {canModifyGroup && (
                      <DropdownMenuItem onClick={() => openActionDialog('group', item)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Change Group
                      </DropdownMenuItem>
                    )}
                    {canModifyLimits && (
                      <DropdownMenuItem onClick={() => openActionDialog('limits', item)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Update CV Limit
                      </DropdownMenuItem>
                    )}
                    {canModifyTokens && (
                      <DropdownMenuItem onClick={() => openActionDialog('tokens', item)}>
                        <Coins className="h-4 w-4 mr-2" />
                        Update Tokens
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        }
    }
  ], [t, tc, planOptions, handleViewUser, handleToggleBan, openActionDialog, hasPermission]);

  // Define Actions with dropdown
  const actions: ActionDef<AdminUser>[] = [
    {
      label: common('view'),
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewUser,
      variant: 'ghost'
    },
    {
      label: tc('banUnban'),
      icon: <Ban className="h-4 w-4" />,
      onClick: handleToggleBan,
      variant: 'ghost'
    }
  ];

  // Custom render for actions column with dropdown
  const renderActionsCell = (item: AdminUser) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => handleViewUser(item)}>
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => handleToggleBan(item)}>
        <Ban className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openActionDialog('group', item)}>
            <Shield className="h-4 w-4 mr-2" />
            Change Group
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openActionDialog('limits', item)}>
            <FileText className="h-4 w-4 mr-2" />
            Update CV Limit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openActionDialog('tokens', item)}>
            <Coins className="h-4 w-4 mr-2" />
            Update Tokens
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

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
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

        <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{t('totalUsers')}</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                  {metrics.totalUsers || pagination?.totalElements || 0}
              </div>
            </div>
            {
              hasPermission(ADMIN_ACTION_PERMISSIONS.ADMIN_STATS_VIEW) && (
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{tc('subscribedUsers')}</h3>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.activeUsers}
                  </div>
                </div>
              )
            }
          </div>
    
      <div className="bg-card rounded-lg border shadow-sm">
         <GenericList
            data={users}
            columns={columns as any}
            meta={pagination}
            isLoading={isLoading}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onRefresh={refresh}
         />
      </div>

      {/* View User Dialog */}
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
      />

      {/* Action Dialog */}
      <Dialog open={!!actionDialog.type} onOpenChange={() => setActionDialog({ type: null, user: null, value: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'group' && 'Change Permission Group'}
              {actionDialog.type === 'limits' && 'Update CV Limit'}
              {actionDialog.type === 'tokens' && 'Update Extra Tokens'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.user && `Updating: ${actionDialog.user.email}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {actionDialog.type === 'group' && (
              <div className="space-y-2">
                <Label>Permission Group</Label>
                <Select
                  value={actionDialog.value || 'none'}
                  onValueChange={(value) => setActionDialog(prev => ({ ...prev, value: value === 'none' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {groups.map((group: any) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {actionDialog.type === 'limits' && (
              <div className="space-y-2">
                <Label>CV Limit Override</Label>
                <Input
                  type="number"
                  min="0"
                  value={actionDialog.value}
                  onChange={(e) => setActionDialog(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Leave empty for plan default"
                />
              </div>
            )}
            
            {actionDialog.type === 'tokens' && (
              <div className="space-y-2">
                <Label>Extra Tokens (Wallet)</Label>
                <Input
                  type="number"
                  min="0"
                  value={actionDialog.value}
                  onChange={(e) => setActionDialog(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="0"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ type: null, user: null, value: '' })}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleActionSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
