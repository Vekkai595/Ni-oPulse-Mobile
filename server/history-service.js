import { loadNoaaHistory } from "../src/lib/noaaHistory.js";

const CACHE_TTL_MS = Number(process.env.HISTORY_CACHE_TTL_MS || 24 * 60 * 60 * 1000);
const REQUEST_TIMEOUT_MS = Number(process.env.NOAA_REQUEST_TIMEOUT_MS || 12_000);

let cache = null;
let expiresAt = 0;
let inFlight = null;

async function fetchText(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "NinoPulse-Global/2.1 educational-dashboard",
        Accept: "text/html,text/plain;q=0.9,*/*;q=0.8",
      },
    });
    if (!response.ok) throw new Error(`${source.label} returned HTTP ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshHistory() {
  try {
    cache = await loadNoaaHistory(fetchText, CACHE_TTL_MS);
    expiresAt = Date.now() + CACHE_TTL_MS;
    return cache;
  } catch (error) {
    if (!cache) throw error;
    return { ...cache, stale: true, warning: error.message };
  }
}

export async function getHistoryData({ force = false } = {}) {
  if (!force && cache && Date.now() < expiresAt) return cache;
  if (inFlight) return inFlight;
  inFlight = refreshHistory().finally(() => { inFlight = null; });
  return inFlight;
}

export function getHistoryHealth() {
  return {
    cached: Boolean(cache),
    cacheExpiresAt: cache ? new Date(expiresAt).toISOString() : null,
  };
}

export { HISTORY_SOURCES, SEASONS, parseClimateIndexTable, detectEpisodes } from "../src/lib/noaaHistory.js";
