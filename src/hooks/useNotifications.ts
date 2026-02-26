import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { getAccessToken } from "@/utils/cookies";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  read?: boolean;
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      const response = await apiClient.get<{ count: number }>(
        "/v1/notifications/unread-count",
      );
      return response.data.count;
    },
    enabled: !!getAccessToken(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useNotificationsList() {
  return useQuery({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      const response = await apiClient.get<{ content: any[] }>(
        "/v1/notifications?size=20",
      );
      if (response.data && Array.isArray(response.data.content)) {
        return response.data.content.map((n: any) => ({
          ...n,
          timestamp: n.createdAt || n.timestamp,
          read: n.read ?? false,
        })) as Notification[];
      }
      return [];
    },
    enabled: !!getAccessToken(),
    staleTime: 60 * 1000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.put(`/v1/notifications/${id}/read`);
      return id;
    },
    onSuccess: (id) => {
      // Optimistically update the list
      queryClient.setQueryData<Notification[]>(
        ["notifications", "list"],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((n) => (n.id === id ? { ...n, read: true } : n));
        },
      );

      // Optimistically update the unread count
      queryClient.setQueryData<number>(
        ["notifications", "unreadCount"],
        (oldCount) => {
          return Math.max(0, (oldCount || 0) - 1);
        },
      );

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.put("/v1/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(
        ["notifications", "list"],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((n) => ({ ...n, read: true }));
        },
      );

      queryClient.setQueryData<number>(
        ["notifications", "unreadCount"],
        () => 0,
      );

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
