"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useEffect } from "react";
import { clearCachedPermissions } from "@/utils/permissionsCache";
import { CIVIFY_SESSION_UPDATED } from "@/utils/session-events";

interface QueryProviderProps {
  children: ReactNode;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    const handleSessionUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
    };

    const handleAuthCleared = () => {
      clearCachedPermissions();
      queryClient.removeQueries({ queryKey: ["permissions"] });
      queryClient.removeQueries({ queryKey: ["subscription"] });
      queryClient.removeQueries({ queryKey: ["userProfile"] });
      queryClient.removeQueries({ queryKey: ["userPreferences"] });
    };

    window.addEventListener(CIVIFY_SESSION_UPDATED, handleSessionUpdated);
    window.addEventListener("auth-state-changed", handleSessionUpdated);
    window.addEventListener("civify:auth-cleared", handleAuthCleared);

    return () => {
      window.removeEventListener(CIVIFY_SESSION_UPDATED, handleSessionUpdated);
      window.removeEventListener("auth-state-changed", handleSessionUpdated);
      window.removeEventListener("civify:auth-cleared", handleAuthCleared);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
