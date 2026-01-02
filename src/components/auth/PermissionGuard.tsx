"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions?: string[]; // Array of permission strings, one of which is required
  requireAll?: boolean; // If true, all permissions are required
  fallbackPath?: string; // Path to redirect if permission denied
  requireAuth?: boolean; // If true, authentication is required
}

export function PermissionGuard({
  children,
  permissions = [],
  requireAll = false,
  fallbackPath = '/app',
  requireAuth = true
}: PermissionGuardProps) {
  const { hasPermission, isLoading, permissions: userPermissions } = useAuth();
  const router = useRouter();

  // Derive isAuthenticated from having any permissions
  const isAuthenticated = useMemo(() => userPermissions.length > 0, [userPermissions]);

  // Helper function to check if user has any of the specified permissions
  const hasAnyPermission = (perms: string[]) => perms.some(p => hasPermission(p));

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
        router.push('/login');
        return;
    }

    let hasAccess = true;

    if (permissions.length > 0) {
      if (requireAll) {
        hasAccess = permissions.every(p => hasPermission(p));
      } else {
        hasAccess = hasAnyPermission(permissions);
      }
    }

    if (!hasAccess) {
      router.push(fallbackPath);
    }
  }, [isLoading, permissions, requireAll, hasPermission, hasAnyPermission, router, fallbackPath, requireAuth, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) return null;

  // Double check render logic to avoid flash of content
  let hasAccess = true;
  if (permissions.length > 0) {
    if (requireAll) {
      hasAccess = permissions.every(p => hasPermission(p));
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  }

  if (!hasAccess) return null;

  return <>{children}</>;
}
