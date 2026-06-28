import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveApiUrl } from "@/lib/runtime";

const STORAGE_KEY = "ninopulse-last-valid-live-countries";

function readCachedData() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(value?.countries) && value.countries.length === 30 ? value : undefined;
  } catch {
    return undefined;
  }
}

async function fetchLiveCountries({ signal }) {
  const response = await fetch(resolveApiUrl("/api/live-countries"), {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.detail || body.error || "";
    } catch {
      // The browser cache may still provide the last valid snapshot.
    }
    throw new Error(detail || `Live countries API returned HTTP ${response.status}`);
  }
  return response.json();
}

export function useLiveCountries() {
  const cached = typeof window === "undefined" ? undefined : readCachedData();
  const query = useQuery({
    queryKey: ["live-country-weather"],
    queryFn: fetchLiveCountries,
    initialData: cached,
    initialDataUpdatedAt: cached ? new Date(cached.generatedAt || 0).getTime() : undefined,
    staleTime: 8 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  useEffect(() => {
    if (query.data?.countries?.length === 30 && !query.data?.stale) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(query.data));
    }
  }, [query.data]);

  const data = query.data || cached;
  const countryMap = useMemo(
    () => Object.fromEntries((data?.countries || []).map((country) => [country.id, country])),
    [data],
  );

  return {
    ...query,
    data,
    countryMap,
    isStale: Boolean(data?.stale) || Boolean(query.error && data),
    hasLiveData: Boolean(data?.countries?.length),
  };
}
