import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { toast } from "sonner";
import { Group, Permission, GroupCreateRequest } from "../types";

const GROUPS_QUERY_KEY = "admin-groups";
const PERMISSIONS_QUERY_KEY = "admin-permissions";

// Fetch all groups
export const useGroups = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [GROUPS_QUERY_KEY],
    queryFn: async (): Promise<Group[]> => {
      const response = await apiClient.get<{ data?: Group[] }>(
        "/v1/admin/groups",
      );
      return response.data.data || [];
    },
    enabled: options?.enabled !== false, // Default to true if not specified
  });
};

// Fetch all permissions (for assignment)
export const usePermissions = () => {
  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY],
    queryFn: async (): Promise<Permission[]> => {
      const response = await apiClient.get<{ data?: Permission[] }>(
        "/v1/admin/groups/permissions",
      );
      return response.data.data || [];
    },
  });
};

// Fetch single group by ID
export const useGroup = (groupId: number | null) => {
  return useQuery({
    queryKey: [GROUPS_QUERY_KEY, groupId],
    queryFn: async (): Promise<Group> => {
      const response = await apiClient.get<{ data: Group }>(
        `/v1/admin/groups/${groupId}`,
      );
      return response.data.data;
    },
    enabled: !!groupId,
  });
};

// Create group
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GroupCreateRequest): Promise<Group> => {
      const response = await apiClient.post<{ data: Group }>(
        "/v1/admin/groups",
        data as unknown as object,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
      toast.success("Group created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to create group");
    },
  });
};

// Update group
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: GroupCreateRequest;
    }): Promise<Group> => {
      const response = await apiClient.put<{ data: Group }>(
        `/v1/admin/groups/${id}`,
        data as unknown as object,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
      toast.success("Group updated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update group");
    },
  });
};

// Delete group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiClient.delete(`/v1/admin/groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
      toast.success("Group deleted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to delete group");
    },
  });
};

// Toggle group active status
export const useToggleGroupActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Group> => {
      const response = await apiClient.patch<{ data: Group }>(
        `/v1/admin/groups/${id}/toggle-active`,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
      toast.success(data.isActive ? "Group activated" : "Group deactivated");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to toggle group status");
    },
  });
};
