"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
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
  fetchPermissions: () => Promise<string[]>;
  clearPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined,
);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
}) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    // Only fetch if we have an access token cookie
    const token = getAccessToken();
    if (!token) {
      setPermissions([]);
      setGroupName(null);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response =
        await apiClient.get<PermissionsResponse>("/auth/permissions");
      const data = response.data;
      const newPermissions = data.permissions || [];
      setPermissions(newPermissions);
      setGroupName(data.groupName || null);
      return newPermissions;
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch permissions"),
      );
      setPermissions([]);
      setGroupName(null);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPermissions = useCallback(() => {
    setPermissions([]);
    setGroupName(null);
    setError(null);
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

  // Auto-fetch permissions on mount if token exists
  useEffect(() => {
    const token = getAccessToken();
    if (token && permissions.length === 0) {
      fetchPermissions();
    }
  }, [fetchPermissions, permissions.length]);

  const value: PermissionContextType = {
    permissions,
    groupName,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    fetchPermissions,
    clearPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
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

export default PermissionContext;
