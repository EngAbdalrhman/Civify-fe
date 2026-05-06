import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription.service";
import { getAccessToken } from "@/utils/cookies";

export const useActiveSubscription = () => {
  return useQuery({
    queryKey: ["subscription", "active"],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) return null;
      return subscriptionService.getMyActiveSubscription();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
