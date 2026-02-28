import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  JobApplicationService,
  JobApplicationRequest,
} from "@/services/job-application.service";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/cookies";

export const useJobApplications = () => {
  return useQuery({
    queryKey: ["job-applications"],
    queryFn: () => JobApplicationService.getAll(),
    enabled: !!getAccessToken(),
  });
};

export const useJobApplication = (id: number) => {
  return useQuery({
    queryKey: ["job-applications", id],
    queryFn: () => JobApplicationService.getById(id),
    enabled: !!id,
  });
};

export const useCreateJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobApplicationRequest) =>
      JobApplicationService.create(data),
    onSuccess: () => {
      toast.success("Job application created successfully");
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create job application");
    },
  });
};

export const useUpdateJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<JobApplicationRequest>;
    }) => JobApplicationService.update(id, data),
    onSuccess: (data) => {
      toast.success("Job application updated successfully");
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({
        queryKey: ["job-applications", data.id],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update job application");
    },
  });
};

export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => JobApplicationService.delete(id),
    onSuccess: () => {
      toast.success("Job application deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete job application");
    },
  });
};
