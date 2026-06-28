import { QueryClient } from "@tanstack/react-query";

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => failureCount < 2 && !String(error?.message).includes("404"),
    },
  },
});
