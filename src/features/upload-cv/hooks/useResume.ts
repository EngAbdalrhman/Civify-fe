import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ResumeService, ResumeSummary } from "@/services/resume.service";
import { ResumeData } from "@/features/upload-cv/types";
import { toast } from "sonner";
import { getAccessToken } from "@/utils/cookies";

export const useResumes = () => {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: () => ResumeService.getAll(),
    enabled: !!getAccessToken(),
  });
};

export const useResume = (id: string) => {
  return useQuery({
    queryKey: ["resumes", id],
    queryFn: () => ResumeService.getById(id),
    enabled: !!id && !!getAccessToken(),
  });
};

export const useCreateResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, data }: { title: string; data: ResumeData }) =>
      ResumeService.create(title, data),
    onSuccess: () => {
      toast.success("Resume created successfully");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create resume");
    },
  });
};

export const useUpdateResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      title,
      data,
    }: {
      id: string;
      title: string;
      data: ResumeData;
    }) => ResumeService.update(id, title, data),
    onSuccess: (data) => {
      toast.success("Resume updated successfully");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resumes", data.id] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update resume");
    },
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResumeService.delete(id),
    onSuccess: () => {
      toast.success("Resume deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete resume");
    },
  });
};
