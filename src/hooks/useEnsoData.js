import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ensoFallback } from "@/lib/ensoFallback";
import { resolveApiUrl } from "@/lib/runtime";

const STORAGE_KEY = "ninopulse-last-valid-enso";

function readCachedData() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return value?.current && value?.forecast ? value : undefined;
  } catch {
    return undefined;
  }
}

async function fetchEnsoData({ signal }) {
  const response = await fetch(resolveApiUrl("/api/enso"), {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.detail || body.error || "";
    } catch {
      // The best available local copy will be used.
    }
    throw new Error(detail || `ENSO API returned HTTP ${response.status}`);
  }
  return response.json();
}

export function useEnsoData() {
  const cached = typeof window === "undefined" ? undefined : readCachedData();
  const query = useQuery({
    queryKey: ["enso-official-data"],
    queryFn: fetchEnsoData,
    initialData: cached,
    initialDataUpdatedAt: cached ? new Date(cached.generatedAt || 0).getTime() : undefined,
    refetchInterval: 10 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  useEffect(() => {
    if (query.data?.current && !query.data?.stale) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(query.data));
    }
  }, [query.data]);

  return {
    ...query,
    data: query.data || cached || ensoFallback,
    isFallback: !query.data || Boolean(query.data?.stale),
    configurationError: query.error?.message?.includes("VITE_API_BASE_URL") ? query.error.message : null,
  };
}
