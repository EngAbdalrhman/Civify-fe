import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiKeyService } from "@/services/api-key.service";
import { toast } from "sonner";

export const useApiKeys = () => {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: () => apiKeyService.getUserApiKeys(),
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => apiKeyService.createApiKey(name),
    onSuccess: () => {
      toast.success("API key created successfully");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create API key");
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiKeyService.revokeApiKey(id),
    onSuccess: () => {
      toast.success("API key revoked successfully");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to revoke API key");
    },
  });
};
