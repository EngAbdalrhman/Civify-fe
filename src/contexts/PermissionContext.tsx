"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import apiClient from "@/api/client";

/**
 * API response - now only contains the JWT permission token
 */
interface PermissionsResponse {
  permissionToken: string;
}

/**
 * Decoded JWT payload structure
 */
interface PermissionTokenPayload {
  sub: string; // username
  permissions: string[];
  groupName: string;
  type: string;
  iat: number;
  exp: number;
}

interface PermissionContextType {
  permissions: string[];
  permissionToken: string | null;
  groupName: string | null;
  isLoading: boolean;
  error: Error | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  fetchPermissions: () => Promise<void>;
  clearPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

/**
 * Decode a JWT token payload (base64url decoding)
 * Note: This does NOT verify the signature - that was done by the backend
 */
function decodeJwtPayload<T>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode base64url to base64, then to string
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const decoded = atob(payload);
    return JSON.parse(decoded) as T;
  } catch (error) {
    console.error('Failed to decode JWT payload:', error);
    return null;
  }
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionToken, setPermissionToken] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    // Only fetch if we have an auth token
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      setPermissions([]);
      setPermissionToken(null);
      setGroupName(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<PermissionsResponse>("/auth/permissions");
      const data = response.data;
      
      if (data.permissionToken) {
        setPermissionToken(data.permissionToken);
        
        // Decode JWT to extract permissions and groupName
        const payload = decodeJwtPayload<PermissionTokenPayload>(data.permissionToken);
        if (payload) {
          setPermissions(payload.permissions || []);
          setGroupName(payload.groupName || null);
        } else {
          throw new Error("Failed to decode permission token");
        }
      } else {
        setPermissions([]);
        setGroupName(null);
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch permissions"));
      setPermissions([]);
      setPermissionToken(null);
      setGroupName(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearPermissions = useCallback(() => {
    setPermissions([]);
    setPermissionToken(null);
    setGroupName(null);
    setError(null);
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  // Auto-fetch permissions on mount if token exists
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token && permissions.length === 0 && !permissionToken) {
      fetchPermissions();
    }
  }, [fetchPermissions, permissions.length, permissionToken]);

  const value: PermissionContextType = {
    permissions,
    permissionToken,
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

