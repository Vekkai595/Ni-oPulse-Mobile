import { historyFallback } from "../src/lib/historyFallback.js";

const HISTORY_SOURCES = {
  roni: {
    key: "roni",
    label: "Relative Oceanic Niño Index (RONI)",
    url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/",
    official: true,
    description: "NOAA/CPC historical RONI, 1950–present",
  },
  oni: {
    key: "oni",
    label: "Oceanic Niño Index (ONI)",
    url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ONI_v5.php",
    official: false,
    description: "NOAA/CPC historical ONI, retained for historical comparison",
  },
};

const SEASONS = ["DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ", "JJA", "JAS", "ASO", "SON", "OND", "NDJ"];
const CACHE_TTL_MS = Number(process.env.HISTORY_CACHE_TTL_MS || 24 * 60 * 60 * 1000);
const REQUEST_TIMEOUT_MS = Number(process.env.NOAA_REQUEST_TIMEOUT_MS || 12_000);

let cache = null;
let expiresAt = 0;
let inFlight = null;

function decodeEntities(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&minus;/gi, "-")
    .replace(/&ndash;/gi, "–")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function htmlToText(html = "") {
  return decodeEntities(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<(?:br|\/p|\/div|\/li|\/tr|\/h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\t\r ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

function normalizeText(value = "") {
  return htmlToText(value).replace(/\s+/g, " ").trim();
}

function rowCells(rowHtml) {
  return [...rowHtml.matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)]
    .map((match) => normalizeText(match[1]))
    .filter(Boolean);
}

function rowToPoints(year, values) {
  return values.slice(0, 12).map((value, index) => ({
    year,
    season: SEASONS[index],
    period: `${SEASONS[index]} ${year}`,
    value,
    sequence: year * 12 + index,
  }));
}

export function parseClimateIndexTable(html) {
  const points = [];
  const years = new Set();

  for (const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = rowCells(match[1]);
    const yearIndex = cells.findIndex((cell) => /^\d{4}$/.test(cell));
    if (yearIndex < 0) continue;
    const year = Number(cells[yearIndex]);
    const values = cells
      .slice(yearIndex + 1)
      .flatMap((cell) => cell.match(/[-+]?\d+(?:\.\d+)?/g) || [])
      .map(Number)
      .filter(Number.isFinite);
    if (values.length >= 1) {
      points.push(...rowToPoints(year, values));
      years.add(year);
    }
  }

  if (!points.length) {
    const text = htmlToText(html);
    for (const line of text.split(/\n+/)) {
      const yearMatch = line.match(/^\s*(\d{4})\b/);
      if (!yearMatch) continue;
      const year = Number(yearMatch[1]);
      const values = (line.slice(yearMatch[0].length).match(/[-+]?\d+(?:\.\d+)?/g) || [])
        .map(Number)
        .filter(Number.isFinite);
      if (values.length >= 1) {
        points.push(...rowToPoints(year, values));
        years.add(year);
      }
    }
  }

  const unique = new Map();
  for (const point of points) unique.set(`${point.year}-${point.season}`, point);
  const sorted = [...unique.values()].sort((a, b) => a.sequence - b.sequence);

  if (sorted.length < 12) throw new Error("Historical climate index table was not recognized");

  return {
    points: sorted,
    firstYear: Math.min(...years),
    lastYear: Math.max(...years),
    updatedAt: new Date().toISOString(),
  };
}

const KNOWN_IMPACTS = {
  "1982-1983": {
    pt: "Evento muito forte associado a grandes mudanças de chuva, seca e pesca no Pacífico.",
    en: "Very strong event associated with major rainfall, drought and Pacific fisheries disruptions.",
  },
  "1997-1998": {
    pt: "Um dos eventos mais fortes do registro moderno, com impactos amplos em precipitação e temperatura.",
    en: "One of the strongest modern events, with widespread precipitation and temperature impacts.",
  },
  "2015-2016": {
    pt: "Evento excepcionalmente forte durante um período de temperaturas globais recordes.",
    en: "Exceptionally strong event during a period of record global temperatures.",
  },
  "2023-2024": {
    pt: "Evento forte com aquecimento oceânico intenso e impactos regionais variados.",
    en: "Strong event with intense ocean warming and varied regional impacts.",
  },
};

export function detectEpisodes(points, minimumSeasons = 5) {
  const episodes = [];
  let run = [];
  let type = null;

  function flush() {
    if (run.length >= minimumSeasons) {
      const start = run[0];
      const end = run.at(-1);
      const kind = type === "warm" ? "elNino" : "laNina";
      const peakPoint = run.reduce((best, point) => {
        if (!best) return point;
        return type === "warm" ? (point.value > best.value ? point : best) : (point.value < best.value ? point : best);
      }, null);
      const key = `${start.year}-${end.year}`;
      episodes.push({
        id: `${kind}-${start.season}-${start.year}-${end.season}-${end.year}`,
        kind,
        label: start.year === end.year ? String(start.year) : `${start.year}–${end.year}`,
        start: start.period,
        end: end.period,
        startYear: start.year,
        endYear: end.year,
        duration: run.length,
        peak: peakPoint.value,
        peakPeriod: peakPoint.period,
        impactPt: KNOWN_IMPACTS[key]?.pt || (kind === "elNino"
          ? "Período histórico de aquecimento do Pacífico. Os impactos variam por região e estação."
          : "Período histórico de resfriamento do Pacífico. Os impactos variam por região e estação."),
        impactEn: KNOWN_IMPACTS[key]?.en || (kind === "elNino"
          ? "Historical Pacific warming episode. Impacts vary by region and season."
          : "Historical Pacific cooling episode. Impacts vary by region and season."),
      });
    }
    run = [];
    type = null;
  }

  for (const point of points) {
    const nextType = point.value >= 0.5 ? "warm" : point.value <= -0.5 ? "cold" : null;
    const contiguous = !run.length || point.sequence === run.at(-1).sequence + 1;
    if (!nextType || nextType !== type || !contiguous) flush();
    if (nextType) {
      type = nextType;
      run.push(point);
    }
  }
  flush();
  return episodes;
}

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
  const entries = Object.values(HISTORY_SOURCES);
  const settled = await Promise.allSettled(entries.map(async (source) => {
    const parsed = parseClimateIndexTable(await fetchText(source));
    return {
      ...source,
      ...parsed,
      episodes: detectEpisodes(parsed.points),
    };
  }));

  const datasets = {};
  const sources = [];
  settled.forEach((result, index) => {
    const source = entries[index];
    if (result.status === "fulfilled") {
      datasets[source.key] = result.value;
      sources.push({ ...source, available: true, error: null });
    } else {
      sources.push({ ...source, available: false, error: result.reason?.message || "Unknown failure" });
    }
  });

  if (!Object.keys(datasets).length) {
    const reasons = sources.map((source) => source.error).filter(Boolean).join("; ");
    if (cache) return { ...cache, stale: true, warning: reasons, generatedAt: new Date().toISOString() };
    return {
      ...historyFallback,
      generatedAt: new Date().toISOString(),
      warning: reasons || "No historical NOAA dataset could be loaded",
      sources,
    };
  }

  const value = {
    ok: true,
    stale: false,
    generatedAt: new Date().toISOString(),
    cacheExpiresAt: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
    primary: datasets.roni ? "roni" : "oni",
    datasets,
    sources,
    notes: [
      "RONI is the current official NOAA/CPC historical index used for ENSO monitoring.",
      "ONI remains available for historical comparison.",
      "The most recent values may be revised by NOAA.",
    ],
  };
  cache = value;
  expiresAt = Date.now() + CACHE_TTL_MS;
  return value;
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

export { HISTORY_SOURCES, SEASONS };
