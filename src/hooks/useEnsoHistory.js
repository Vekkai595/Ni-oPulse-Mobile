import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { historyFallback } from "@/lib/historyFallback";
import { resolveApiUrl } from "@/lib/runtime";

const STORAGE_KEY = "ninopulse-last-valid-history";

function readCached() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return value?.datasets ? value : undefined;
  } catch {
    return undefined;
  }
}

async function fetchHistory({ signal }) {
  const response = await fetch(resolveApiUrl("/api/history"), { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`History API returned HTTP ${response.status}`);
  return response.json();
}

export function useEnsoHistory() {
  const cached = typeof window === "undefined" ? undefined : readCached();
  const query = useQuery({
    queryKey: ["enso-history"],
    queryFn: fetchHistory,
    initialData: cached,
    staleTime: 12 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (query.data?.datasets && !query.data?.stale) localStorage.setItem(STORAGE_KEY, JSON.stringify(query.data));
  }, [query.data]);

  return {
    ...query,
    data: query.data || cached || historyFallback,
    isFallback: !query.data || Boolean(query.data?.stale),
  };
}
