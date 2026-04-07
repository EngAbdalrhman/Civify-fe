import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  subscriptionService,
  SubscriptionService,
} from "@/services/subscription.service";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/cookies";

export const usePlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => subscriptionService.getAllPlans(),
  });
};

export const usePlan = (id: number) => {
  return useQuery({
    queryKey: ["plans", id],
    queryFn: () => subscriptionService.getPlanById(id),
    enabled: !!id,
  });
};

export const useMyActiveSubscription = () => {
  const hasAccessToken = !!getAccessToken();

  return useQuery({
    queryKey: ["subscription", "active", hasAccessToken ? "auth" : "guest"],
    queryFn: () => subscriptionService.getMyActiveSubscription(),
    enabled: hasAccessToken,
    staleTime: 0,
    refetchOnMount: "always",
  });
};

export const useMySubscriptions = () => {
  return useQuery({
    queryKey: ["subscription", "history"],
    queryFn: () => subscriptionService.getMySubscriptions(),
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionService.cancelSubscription(),
    onSuccess: (data) => {
      toast.success(data.message || "Subscription cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel subscription");
    },
  });
};
