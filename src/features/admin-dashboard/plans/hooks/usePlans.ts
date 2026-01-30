import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminService,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "@/services/admin.service";
import { toast } from "sonner";

export const useAdminPlans = () => {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: () => adminService.getAllPlans(),
  });
};

export const useAdminPlan = (id: number) => {
  return useQuery({
    queryKey: ["admin", "plans", id],
    queryFn: () => adminService.getPlanById(id),
    enabled: !!id,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanRequest) => adminService.createPlan(data),
    onSuccess: () => {
      toast.success("Plan created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create plan");
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanRequest }) =>
      adminService.updatePlan(id, data),
    onSuccess: (data) => {
      toast.success("Plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
      // Invalidate specific plan query as well
      // Note: id is not directly available in data response usually depending on API,
      // but if data has id we use it, otherwise we might invalidate all.
      // Assuming we can invalidate by key prefix.
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update plan");
    },
  });
};

export const useActivatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.activatePlan(id),
    onSuccess: () => {
      toast.success("Plan activated");
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
};

export const useDeactivatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deactivatePlan(id),
    onSuccess: () => {
      toast.success("Plan deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminService.deletePlan(id),
    onSuccess: () => {
      toast.success("Plan deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete plan");
    },
  });
};
