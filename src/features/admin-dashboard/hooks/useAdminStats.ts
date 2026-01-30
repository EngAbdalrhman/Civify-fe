import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export const useAdminStats = (
  period: "MONTHLY" | "QUARTERLY" | "YEARLY" | "OVERALL" = "MONTHLY"
) => {
  return useQuery({
    queryKey: ["admin", "stats", period],
    queryFn: () => adminService.getStats(period),
  });
};
