import { useQuery } from "@tanstack/react-query";
import { ALERT_SOURCES, ALERT_TTL, capAlertsAt, createCapCache, IDAP_URL, normalizeNws, nwsUrl, NWS_HEADERS } from "@/lib/officialAlerts";
import { climateSource, nativeSource } from "@/services/officialData";

const getCap = createCapCache(() => nativeSource(IDAP_URL, "text", { Accept: "application/atom+xml, application/rss+xml" }, 55_000));

async function directAlerts(place) {
  if (place.countryCode === "BR") return capAlertsAt(await getCap(), place);
  return normalizeNws(await nativeSource(nwsUrl(place), "json", NWS_HEADERS));
}

export function alertOptions(place, enabled = true) {
  return {
    queryKey: ["official-alerts-v3", place?.countryCode, place?.latitude, place?.longitude],
    enabled: Boolean(enabled && !place?.device && Object.hasOwn(ALERT_SOURCES, place?.countryCode)),
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ country: place.countryCode, lat: place.latitude.toFixed(4), lon: place.longitude.toFixed(4) });
      const data = await climateSource(`/api/alerts?${params}`, () => directAlerts(place), signal, 59_000);
      if (!Array.isArray(data?.alerts) || !Number.isFinite(Date.parse(data.checkedAt))) throw new Error("Invalid official alerts");
      return data;
    },
    staleTime: ALERT_TTL, refetchInterval: ALERT_TTL, refetchOnWindowFocus: true, retry: false,
  };
}

export function useOfficialAlerts(place) {
  return useQuery(alertOptions(place));
}
