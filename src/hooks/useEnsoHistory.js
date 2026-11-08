import { useQuery } from "@tanstack/react-query";
import { loadNoaaHistory } from "@/lib/noaaHistory";
import { readLocal, writeLocal } from "@/lib/localStore";
import { climateSource, nativeSource } from "@/services/officialData";

const KEY = "ninopulse-official-history-v3";
const EMPTY = { datasets: {}, sources: [], stale: true };

export function useEnsoHistory() {
  const query = useQuery({
    queryKey: ["enso-history-v3"],
    initialData: () => readLocal(KEY) ?? undefined,
    initialDataUpdatedAt: () => Date.parse(readLocal(KEY)?.generatedAt) || undefined,
    queryFn: async ({ signal }) => {
      const data = await climateSource("/api/history", () => loadNoaaHistory(({ url }) => nativeSource(url)), signal);
      if (!data?.ok || !Object.keys(data.datasets ?? {}).length) throw new Error("Invalid NOAA history response");
      if (!data.stale) writeLocal(KEY, data);
      return data;
    },
    staleTime: 12 * 60 * 60 * 1000, retry: 1,
  });
  return { ...query, data: query.data || EMPTY, isFallback: !query.data || query.isError || query.isPaused || Boolean(query.data?.stale) };
}
