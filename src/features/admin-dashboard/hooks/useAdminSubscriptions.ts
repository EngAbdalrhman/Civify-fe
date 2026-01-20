import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, InputDataModel } from "@/services/admin.service";
import { toast } from "sonner";

export const useAdminSubscriptions = (
  status?: string,
  page = 0,
  size = 100
) => {
  return useQuery({
    queryKey: ["admin", "subscriptions", status, page, size],
    queryFn: () => adminService.getAllSubscriptions(status, page, size),
  });
};

export const useFilterAdminSubscriptions = (data: InputDataModel) => {
  return useQuery({
    queryKey: ["admin", "subscriptions", "filter", data],
    queryFn: () => adminService.filterSubscriptions(data),
  });
};
