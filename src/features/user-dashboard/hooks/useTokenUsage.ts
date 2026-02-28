import { useQuery } from "@tanstack/react-query";
import { tokenUsageService } from "@/services/token-usage.service";
import { getAccessToken } from "@/utils/cookies";

export const useMyTokenUsageHistory = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ["token-usage", "history", page, size],
    queryFn: () => tokenUsageService.getMyUsageHistory(page, size),
    enabled: !!getAccessToken(),
  });
};

export const useMyTokenUsageSummary = () => {
  return useQuery({
    queryKey: ["token-usage", "summary"],
    queryFn: () => tokenUsageService.getMySummary(),
    enabled: !!getAccessToken(),
  });
};
