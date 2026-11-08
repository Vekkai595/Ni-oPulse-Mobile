import { loadNoaaEnso } from "../src/lib/noaaData.js";

const CACHE_TTL_MS = Number(process.env.ENSO_CACHE_TTL_MS || 10 * 60 * 1000);
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
        "User-Agent": "NinoPulse-Global/1.1 educational-dashboard contact: site-owner",
        Accept: "text/html,text/plain;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`${source.name} respondeu com HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function refresh() {
  try {
    const value = await loadNoaaEnso(fetchText, CACHE_TTL_MS);
    cache = value;
    expiresAt = Date.now() + CACHE_TTL_MS;
    return value;
  } catch (error) {
    if (cache) {
      return {
        ...cache,
        stale: true,
        warning: `A NOAA não pôde ser atualizada agora. Exibindo o último dado válido: ${error.message}`,
      };
    }
    throw error;
  }
}

export async function getEnsoData({ force = false } = {}) {
  if (!force && cache && Date.now() < expiresAt) return cache;
  if (inFlight) return inFlight;

  inFlight = refresh().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

export function getHealth() {
  return {
    ok: true,
    service: "NiñoPulse NOAA API",
    cached: Boolean(cache),
    cacheExpiresAt: cache ? new Date(expiresAt).toISOString() : null,
    now: new Date().toISOString(),
  };
}

export { NOAA_SOURCES, parseDiagnostic, parseProbabilities, parseWeeklySst } from "../src/lib/noaaData.js";
