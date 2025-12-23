"use client";

import React, { ReactNode } from "react";
import { usePermissions } from "@/contexts/PermissionContext";

interface PermissionGateProps {
  /** Single permission required */
  permission?: string;
  /** Multiple permissions - user must have ANY of these */
  anyOf?: string[];
  /** Multiple permissions - user must have ALL of these */
  allOf?: string[];
  /** Content to render if user has permission */
  children: ReactNode;
  /** Optional fallback to show when permission is denied */
  fallback?: ReactNode;
  /** If true, show loading state while permissions are loading */
  showLoading?: boolean;
}

/**
 * PermissionGate - Conditional rendering based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="user.admin.view">
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * @example
 * // Any of these permissions
 * <PermissionGate anyOf={["user.edit", "user.admin.manage"]}>
 *   <EditButton />
 * </PermissionGate>
 * 
 * @example
 * // All permissions required
 * <PermissionGate allOf={["payment.view", "payment.process"]} fallback={<UpgradePrompt />}>
 *   <PaymentDashboard />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
  showLoading = false,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  // Show loading state if requested
  if (isLoading && showLoading) {
    return <div className="animate-pulse bg-muted h-8 rounded" />;
  }

  // Don't render anything while loading (prevents flash)
  if (isLoading) {
    return null;
  }

  let allowed = false;

  if (permission) {
    allowed = hasPermission(permission);
  } else if (anyOf && anyOf.length > 0) {
    allowed = hasAnyPermission(anyOf);
  } else if (allOf && allOf.length > 0) {
    allowed = hasAllPermissions(allOf);
  } else {
    // No permission specified - allow by default
    allowed = true;
  }

  if (allowed) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGate;
