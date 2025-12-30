"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Shield, Plus, Users, Edit, Trash2, Check, X, Power } from 'lucide-react';
import { 
  useGroups, 
  usePermissions,
  useCreateGroup, 
  useUpdateGroup, 
  useDeleteGroup,
  useToggleGroupActive,
  Group,
  Permission,
} from '@/features/admin-dashboard/groups';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PermissionGate } from "@/components/PermissionGate";
import { ADMIN_ACTION_PERMISSIONS } from "@/config/adminMenuConfig";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function GroupsPage() {
  const t = useTranslations('admin');
  const common = useTranslations('common');
  const nav = useTranslations('nav');
  
  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [groupName, setGroupName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  
  // Queries
  const { data: groups = [], isLoading } = useGroups();
  const { data: allPermissions = [] } = usePermissions();
  
  // Mutations
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const toggleActive = useToggleGroupActive();

  // Handlers
  const handleToggleActive = (group: Group) => {
    toggleActive.mutate(group.id);
  };
  const handleCreate = () => {
    setDialogMode('create');
    setSelectedGroup(null);
    setGroupName('');
    setSelectedPermissions([]);
    setDialogOpen(true);
  };

  const handleView = (group: Group) => {
    setDialogMode('view');
    setSelectedGroup(group);
    setGroupName(group.name);
    setSelectedPermissions(group.permissions?.map(p => p.id) || []);
    setDialogOpen(true);
  };

  const handleEdit = (group: Group) => {
    setDialogMode('edit');
    setSelectedGroup(group);
    setGroupName(group.name);
    setSelectedPermissions(group.permissions?.map(p => p.id) || []);
    setDialogOpen(true);
  };

  const handleDeleteClick = (group: Group) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedGroup) {
      await deleteGroup.mutateAsync(selectedGroup.id);
      setDeleteDialogOpen(false);
      setSelectedGroup(null);
    }
  };

  const handleSave = async () => {
    if (!groupName.trim()) return;

    if (dialogMode === 'create') {
      await createGroup.mutateAsync({
        name: groupName,
        permissionIds: selectedPermissions,
      });
    } else if (dialogMode === 'edit' && selectedGroup) {
      await updateGroup.mutateAsync({
        id: selectedGroup.id,
        data: {
          name: groupName,
          permissionIds: selectedPermissions,
        },
      });
    }
    setDialogOpen(false);
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Group permissions by category for display
  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    const category = perm.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const isReadOnly = dialogMode === 'view';
  const isSaving = createGroup.isPending || updateGroup.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{nav('groups')}</h1>
          <p className="text-muted-foreground">Manage user groups and their permissions</p>
        </div>
        <PermissionGate permission={ADMIN_ACTION_PERMISSIONS.GROUP_CREATE}>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {common('create')}
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Groups</h3>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{groups.length}</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">System Groups</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{groups.filter(g => g.isSystemGroup).length}</div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Permissions</h3>
            <Check className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{allPermissions.length}</div>
        </div>
      </div>

      {/* Groups Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No groups found
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {group.name}
                      {group.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {group.isSystemGroup ? (
                      <Badge variant="destructive" className="text-xs">System</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {group.isActive ? (
                        <Badge variant="default" className="text-xs bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                      <PermissionGate permission={ADMIN_ACTION_PERMISSIONS.GROUP_EDIT}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(group)}
                          disabled={group.isSystemGroup || toggleActive.isPending}
                          title={group.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {group.permissions?.length || 0} permissions
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(group)}>
                        View
                      </Button>
                      <PermissionGate permission={ADMIN_ACTION_PERMISSIONS.GROUP_EDIT}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(group)}
                          disabled={group.isSystemGroup}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                      <PermissionGate permission={ADMIN_ACTION_PERMISSIONS.GROUP_DELETE}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteClick(group)}
                          disabled={group.isSystemGroup || group.isDefault}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit/View Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' && 'Create Group'}
              {dialogMode === 'edit' && 'Edit Group'}
              {dialogMode === 'view' && 'View Group'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' && 'Create a new group and assign permissions'}
              {dialogMode === 'edit' && 'Modify group name and permissions'}
              {dialogMode === 'view' && 'View group details and assigned permissions'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <TooltipProvider delayDuration={200}>
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="space-y-3 pb-4 border-b last:border-b-0">
                    <h4 className="text-sm font-semibold text-primary">{category}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {perms.map((perm) => (
                        <Tooltip key={perm.id}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                              <Checkbox
                                id={`perm-${perm.id}`}
                                checked={selectedPermissions.includes(perm.id)}
                                onCheckedChange={() => !isReadOnly && togglePermission(perm.id)}
                                disabled={isReadOnly}
                              />
                              <label
                                htmlFor={`perm-${perm.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {perm.name}
                              </label>
                            </div>
                          </TooltipTrigger>
                          {perm.description && (
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs">{perm.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                ))}
              </TooltipProvider>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button onClick={handleSave} disabled={isSaving || !groupName.trim()}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
            {dialogMode === 'view' && !selectedGroup?.isSystemGroup && (
              <Button onClick={() => setDialogMode('edit')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedGroup?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteGroup.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
