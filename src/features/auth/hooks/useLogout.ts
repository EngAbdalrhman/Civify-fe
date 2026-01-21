import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import apiClient from "@/api/client";
import { toast } from "sonner";
import { usePermissions } from "@/contexts/PermissionContext";

export const useLogout = () => {
  const router = useRouter();
  const { clearPermissions } = usePermissions();

  const {
    mutate: logout,
    isPending: isLoggingOut,
  } = useMutation({
    mutationFn: async () => {
      const accessToken = typeof window !== "undefined" 
        ? localStorage.getItem("auth_token") 
        : null;
      const refreshToken = typeof window !== "undefined" 
        ? localStorage.getItem("refresh_token") 
        : null;

      if (accessToken || refreshToken) {
        try {
          await apiClient.post("/auth/logout", null, {
            params: { refreshToken },
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          });
        } catch (error) {
          // Ignore logout API errors - we'll clear tokens anyway
          console.warn("Logout API call failed:", error);
        }
      }

      // Always clear tokens and permissions regardless of API result
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      }
      clearPermissions();
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: () => {
      // Even on error, we've already cleared local state
      // so just redirect to login
      router.push("/login");
    },
  });

  const handleLogout = () => {
    logout();
  };

  return {
    logout: handleLogout,
    isLoggingOut,
  };
};
