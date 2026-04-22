import { useQuery, useMutation } from "@tanstack/react-query";
import { adminService, InputDataModel } from "@/services/admin.service";

export const useAuditLogs = (data: InputDataModel) => {
  return useQuery({
    queryKey: ["admin", "audit", data],
    queryFn: () => adminService.getAllAuditLogs(data),
  });
};

export const useCvLogs = (data: InputDataModel) => {
  return useQuery({
    queryKey: ["admin", "audit", "cv", data],
    queryFn: () => adminService.getCvLogs(data),
  });
};

export const useSubscriptionAuditLogs = (data: InputDataModel) => {
  return useQuery({
    queryKey: ["admin", "audit", "subscription", data],
    queryFn: () => adminService.filterSubscriptionAuditLogs(data),
  });
};

export const useBillingAuditLogs = (data: InputDataModel) => {
  return useQuery({
    queryKey: ["admin", "audit", "billing", data],
    queryFn: () => adminService.filterBillingAuditLogs(data),
  });
};

export const useTokenUsageLogs = (data: InputDataModel) => {
  return useQuery({
    queryKey: ["admin", "audit", "token-usage", data],
    queryFn: () => adminService.filterTokenUsageLogs(data),
  });
};

export const useBillingTransactions = (data: InputDataModel) => {
  return useQuery({
    queryKey: ["admin", "audit", "billing-transactions", data],
    queryFn: () => adminService.filterBillingTransactions(data),
  });
};
