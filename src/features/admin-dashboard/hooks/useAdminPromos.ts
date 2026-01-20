import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminService,
  InputDataModel,
  PromoCode,
} from "@/services/admin.service";
import { toast } from "sonner";

export const useAllAdminPromoCodes = () => {
  return useQuery({
    queryKey: ["admin", "promocodes", "all"],
    queryFn: () => adminService.getAllPromoCodes(),
  });
};

export const useFilterAdminPromoCodes = (data: InputDataModel) => {
  return useQuery({
    queryKey: ["admin", "promocodes", "filter", data],
    queryFn: () => adminService.filterPromoCodes(data),
  });
};

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<PromoCode>) =>
      adminService.createPromoCode(data),
    onSuccess: () => {
      toast.success("Promo code created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "promocodes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create promo code");
    },
  });
};

export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PromoCode> }) =>
      adminService.updatePromoCode(id, data),
    onSuccess: () => {
      toast.success("Promo code updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "promocodes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update promo code");
    },
  });
};

export const useDeactivatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deactivatePromoCode(id),
    onSuccess: () => {
      toast.success("Promo code deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin", "promocodes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to deactivate promo code");
    },
  });
};

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deletePromoCode(id),
    onSuccess: () => {
      toast.success("Promo code deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "promocodes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete promo code");
    },
  });
};
