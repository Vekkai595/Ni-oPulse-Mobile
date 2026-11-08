import { alertRequest, capAlertsAt, createCapCache, IDAP_URL, normalizeNws, nwsUrl, NWS_HEADERS } from "../src/lib/officialAlerts.js";

const getCap = createCapCache(async () => {
  const options = { signal: AbortSignal.timeout(55_000), headers: { Accept: "application/atom+xml, application/rss+xml" } };
  let response = await fetch(IDAP_URL, options);
  if ([502, 503, 504].includes(response.status)) {
    await response.body?.cancel();
    response = await fetch(IDAP_URL, options);
  }
  if (!response.ok) throw new Error(`IDAP HTTP ${response.status}`);
  return response.text();
});

export async function alertsResponse(method, params) {
  if (method !== "GET") return { status: 405, body: { error: "Use GET" } };
  const place = alertRequest(params);
  if (!place) return { status: 400, body: { error: "A supported country and valid coordinates are required" } };
  try {
    if (place.countryCode === "BR") return { status: 200, body: capAlertsAt(await getCap(), place) };
    const response = await fetch(nwsUrl(place), { headers: NWS_HEADERS, signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error(`NWS HTTP ${response.status}`);
    return { status: 200, body: normalizeNws(await response.json()) };
  } catch {
    return { status: 503, body: { error: "Official alert feed is temporarily unavailable" } };
  }
}
