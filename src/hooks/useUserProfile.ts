import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { getAccessToken } from "@/utils/cookies";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  permissions?: string[];
  cvCount?: number;
  apiUsageCount?: number;
  extraTokens?: number;
  createdAt?: string;
  emailVerified?: boolean;
  onboardingCompleted?: boolean;
  completedTours?: string;
  primaryIntent?: string;
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await apiClient.get<UserProfile>("/v1/users/me");
      return response.data;
    },
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
