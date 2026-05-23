"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
import apiClient from "@/api/client";
import { getAccessToken } from "@/utils/cookies";
import {
  clearCachedPermissions,
  readCachedPermissions,
  writeCachedPermissions,
} from "@/utils/permissionsCache";

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
  refetch: () => Promise<unknown>;
  clearPermissions: () => void;
}

function getInitialPermissionsData():
  | { permissions: string[]; groupName: string | null }
  | undefined {
  const token = getAccessToken();
  if (!token) return undefined;
  const cached = readCachedPermissions(token);
  if (!cached) return undefined;
  return cached;
}

export const usePermissions = (): PermissionContextType => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response =
        await apiClient.get<PermissionsResponse>("/auth/permissions");
      const result = {
        permissions: response.data?.permissions || [],
        groupName: response.data?.groupName || null,
      };
      const token = getAccessToken();
      if (token) {
        writeCachedPermissions(token, result);
      }
      return result;
    },
    enabled: !!getAccessToken(),
    retry: false,
    placeholderData: () => getInitialPermissionsData() ?? undefined,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const permissions = data?.permissions || [];
  const groupName = data?.groupName ?? null;

  const clearPermissions = useCallback(() => {
    clearCachedPermissions();
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

export const useHasPermission = (permission: string): boolean => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
};

export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
};
