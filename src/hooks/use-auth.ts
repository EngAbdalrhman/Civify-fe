"use client";

import { usePermissions } from '@/contexts/PermissionContext';
import { ADMIN_ACTION_PERMISSIONS } from '@/config/adminMenuConfig';

/**
 * Auth hook that integrates with the permission system
 * Provides user info and admin access checks
 */
export function useAuth() {
  const { permissions, groupName, isLoading, hasPermission } = usePermissions();

  // Check if user has admin dashboard access
  const isAdmin = hasPermission(ADMIN_ACTION_PERMISSIONS.ADMIN_DASHBOARD_VIEW);

  // Mock user data - in production, this would come from a user context
  const user = {
    id: "1",
    name: groupName || "User",
    email: "",
    role: isAdmin ? "admin" : "user",
    avatar: null
  };

  return {
    user,
    isAdmin,
    isLoading,
    permissions,
    groupName,
    hasPermission,
  };
}
