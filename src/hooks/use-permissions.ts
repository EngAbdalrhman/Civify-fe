"use client";

import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
import apiClient from "@/api/client";
import { getAccessToken } from "@/utils/cookies";
interface PermissionsResponse {
  permissions: string[];
  encryptedPermissions: string;
  groupName: string;
}

interface PermissionContextType {
  permissions: string[];
  groupName: string | null;
  isLoading: boolean;
  error: Error | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refetch: () => Promise<any>;
  clearPermissions: () => void;
}

export const usePermissions = (): PermissionContextType => {
  // Re-fetch permissions when token is refreshed
  useEffect(() => {
    const handleAuthChange = () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    };
    window.addEventListener("auth-state-changed", handleAuthChange);
    return () =>
      window.removeEventListener("auth-state-changed", handleAuthChange);
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response =
        await apiClient.get<PermissionsResponse>("/auth/permissions");
      return response.data;
    },
    enabled: !!getAccessToken(),
    retry: false, // Don't retry on auth failures — let the refresh flow handle it
    select: (data) => ({
      permissions: data?.permissions || [],
      groupName: data?.groupName || null,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const permissions = data?.permissions || [];
  const groupName = data?.groupName || null;

  const clearPermissions = useCallback(() => {
    queryClient.setQueryData(["permissions"], {
      permissions: [],
      groupName: null,
    });
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission);
    },
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.some((p) => permissions.includes(p));
    },
    [permissions],
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.every((p) => permissions.includes(p));
    },
    [permissions],
  );

  return {
    permissions,
    groupName,
    isLoading,
    error: error instanceof Error ? error : null,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch,
    clearPermissions,
  };
};

// Shorthand hook for single permission check
export const useHasPermission = (permission: string): boolean => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
};

// Shorthand hook for any permission check
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
};
