import { useQuery } from "@tanstack/react-query";
import { loadNoaaEnso, NOAA_SOURCES } from "@/lib/noaaData";
import { readLocal, writeLocal } from "@/lib/localStore";
import { climateSource, nativeSource } from "@/services/officialData";

const KEY = "ninopulse-official-enso-v3";
const INTERVAL = 30 * 60 * 1000;
const EMPTY = { current: null, forecast: null, sources: Object.values(NOAA_SOURCES).map((source) => ({ ...source, available: false })), stale: true };

export function useEnsoData(enabled = true) {
  const query = useQuery({
    queryKey: ["enso-official-v3"],
    enabled,
    initialData: () => readLocal(KEY) ?? undefined,
    initialDataUpdatedAt: () => Date.parse(readLocal(KEY)?.generatedAt) || undefined,
    queryFn: async ({ signal }) => {
      const data = await climateSource("/api/enso", () => loadNoaaEnso(({ url }) => nativeSource(url)), signal);
      if (!data?.ok || !data.current) throw new Error("Invalid NOAA response");
      if (!data.stale) writeLocal(KEY, data);
      return data;
    },
    staleTime: INTERVAL, refetchInterval: INTERVAL, refetchOnWindowFocus: true, retry: 1,
  });
  return {
    ...query, data: query.data || EMPTY, hasData: Boolean(query.data),
    isFallback: !query.data || query.isError || query.isPaused || Boolean(query.data?.stale) ||
      Date.now() - Date.parse(query.data?.generatedAt) > 2 * INTERVAL,
    configurationError: null,
  };
}
