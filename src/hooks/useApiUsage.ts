import { useQuery } from "@tanstack/react-query";
import { apiUsageService } from "@/services/api-usage.service";
import { getAccessToken } from "@/utils/cookies";

export const useMyApiLogs = (
  params: { page?: number; size?: number; endpoint?: string } = {},
) => {
  return useQuery({
    queryKey: ["api-usage", "my-logs", params],
    queryFn: () => apiUsageService.getMyLogs(params),
    enabled: !!getAccessToken(),
  });
};

export const useMyApiStats = () => {
  return useQuery({
    queryKey: ["api-usage", "my-stats"],
    queryFn: () => apiUsageService.getMyStats(),
    enabled: !!getAccessToken(),
  });
};

export const useAdminApiLogs = (
  params: {
    page?: number;
    size?: number;
    endpoint?: string;
    email?: string;
    method?: string;
    statusCode?: number;
  } = {},
) => {
  return useQuery({
    queryKey: ["api-usage", "admin-logs", params],
    queryFn: () => apiUsageService.getAdminLogs(params),
    enabled: !!getAccessToken(),
  });
};
