import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { getAccessToken } from "@/utils/cookies";

export interface UserPreferences {
  preferredLanguage: "EN" | "AR";
  preferredTheme: "LIGHT" | "DARK";
  autoSaveEnabled: boolean;
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      const response = await apiClient.get<UserPreferences>("/v1/users/me/preferences");
      // ensure we return a boolean default if backend hasn't populated it
      if (response.data.autoSaveEnabled === undefined) {
          response.data.autoSaveEnabled = true;
      }
      return response.data;
    },
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      const response = await apiClient.put<UserPreferences>("/v1/users/me/preferences", preferences);
      if (response.data.autoSaveEnabled === undefined) {
          response.data.autoSaveEnabled = true;
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["userPreferences"], data);
    },
  });
}
