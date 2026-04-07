"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useEffect } from "react";

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
    const handleAuthStateChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    };

    window.addEventListener("auth-state-changed", handleAuthStateChanged);
    return () => {
      window.removeEventListener("auth-state-changed", handleAuthStateChanged);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
