const NOAA_SOURCES = {
  diagnostic: {
    name: "NOAA/CPC — ENSO Diagnostic Discussion",
    url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
    cadence: "monthly",
  },
  probabilities: {
    name: "NOAA/CPC — Official ENSO Strength Probabilities",
    url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/strengths/",
    cadence: "monthly",
  },
  weeklySst: {
    name: "NOAA/CPC — Weekly Niño SST Indices (1991–2020 base)",
    url: "https://www.cpc.ncep.noaa.gov/data/indices/wksst9120.for",
    cadence: "weekly",
  },
};

const CACHE_TTL_MS = Number(process.env.ENSO_CACHE_TTL_MS || 10 * 60 * 1000);
const REQUEST_TIMEOUT_MS = Number(process.env.NOAA_REQUEST_TIMEOUT_MS || 12_000);

let cache = null;
let expiresAt = 0;
let inFlight = null;

const MONTHS = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

function decodeEntities(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&deg;/gi, "°")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&minus;/gi, "−")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&Ntilde;/g, "Ñ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/<sup[^>]*>(.*?)<\/sup>/gis, "$1")
    .replace(/<sub[^>]*>(.*?)<\/sub>/gis, "$1");
}

function htmlToText(html = "") {
  return decodeEntities(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<(?:br|\/p|\/div|\/li|\/tr|\/h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\t\r ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function normalizeText(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

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

function parseEnglishDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value} 12:00:00 UTC`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parseCompactDate(value) {
  const match = value?.toUpperCase().match(/^(\d{1,2})([A-Z]{3})(\d{4})$/);
  if (!match || MONTHS[match[2]] === undefined) return null;
  return new Date(Date.UTC(Number(match[3]), MONTHS[match[2]], Number(match[1]), 12)).toISOString();
}

function extractLine(text, regex) {
  const match = text.match(regex);
  return match ? normalizeText(match[1]) : null;
}

function parseDiagnostic(html) {
  const text = htmlToText(html);
  const issuedLabel = extractLine(
    text,
    /(?:^|\n)(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})(?:\n|$)/i,
  );
  const alertStatus = extractLine(text, /ENSO Alert System Status:\s*([^\n]+)/i);
  const synopsis = extractLine(text, /Synopsis:\s*([^\n]+)/i);
  const nextUpdateLabel = extractLine(
    text,
    /next ENSO Diagnostics Discussion is scheduled for\s+([^.\n]+)\.?/i,
  );

  const nino34 = Number(text.match(/latest weekly Niño-?3\.4 index value was\s*([+−-]?\d+(?:\.\d+)?)°?C/i)?.[1]?.replace("−", "-"));
  const pairedRegions = text.match(
    /Niño-?4\)?\s+and\s+(?:the\s+)?(?:easternmost\s+)?\(?Niño-?1\+2\)?\s+indices\s+at\s*([+−-]?\d+(?:\.\d+)?)°?C\s+and\s+([+−-]?\d+(?:\.\d+)?)°?C/i,
  );
  const nino4 = Number(pairedRegions?.[1]?.replace("−", "-"));
  const nino12 = Number(pairedRegions?.[2]?.replace("−", "-"));

  if (!alertStatus && !synopsis) {
    throw new Error("A estrutura da discussão ENSO não foi reconhecida");
  }

  return {
    issuedAt: parseEnglishDate(issuedLabel),
    issuedLabel,
    alertStatus,
    synopsis,
    nextUpdate: parseEnglishDate(nextUpdateLabel),
    nextUpdateLabel,
    nino34: Number.isFinite(nino34) ? nino34 : null,
    nino4: Number.isFinite(nino4) ? nino4 : null,
    nino12: Number.isFinite(nino12) ? nino12 : null,
  };
}

function parseWeeklySst(raw) {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsedRows = [];

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (!/^\d{1,2}[A-Za-z]{3}\d{4}$/.test(parts[0]) || parts.length < 9) continue;

    const values = parts.slice(1).map((value) => Number(value.replace("−", "-")));
    if (values.length < 8 || values.some((value) => !Number.isFinite(value))) continue;

    parsedRows.push({
      date: parseCompactDate(parts[0]),
      dateLabel: parts[0].toUpperCase(),
      regions: {
        nino12: { sst: values[0], anomaly: values[1] },
        nino3: { sst: values[2], anomaly: values[3] },
        nino34: { sst: values[4], anomaly: values[5] },
        nino4: { sst: values[6], anomaly: values[7] },
      },
    });
  }

  if (!parsedRows.length) {
    throw new Error("O arquivo semanal de SST não contém linhas reconhecíveis");
  }

  return parsedRows.at(-1);
}

function cellsFromRow(rowHtml) {
  return [...rowHtml.matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)]
    .map((match) => normalizeText(htmlToText(match[1])))
    .filter(Boolean);
}

function probabilityRow(season, values) {
  const [laVeryStrong, laStrong, laModerate, laWeak, neutral, elWeak, elModerate, elStrong, elVeryStrong] = values;
  return {
    season,
    probability: {
      laNina: laVeryStrong + laStrong + laModerate + laWeak,
      neutral,
      elNino: elWeak + elModerate + elStrong + elVeryStrong,
    },
    strength: {
      laNina: { veryStrong: laVeryStrong, strong: laStrong, moderate: laModerate, weak: laWeak },
      neutral,
      elNino: { weak: elWeak, moderate: elModerate, strong: elStrong, veryStrong: elVeryStrong },
    },
  };
}

function parseProbabilities(html) {
  const text = htmlToText(html);
  const issuedLabel = extractLine(text, /Issued\s+([A-Za-z]+\s+\d{4})/i);
  const rows = [];

  for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = cellsFromRow(rowMatch[1]);
    const seasonIndex = cells.findIndex((cell) => /^[A-Z]{3}$/.test(cell));
    if (seasonIndex < 0) continue;

    const numbers = cells
      .slice(seasonIndex + 1)
      .map((cell) => Number(cell.replace(/%/g, "")))
      .filter(Number.isFinite);

    if (numbers.length >= 9) {
      rows.push(probabilityRow(cells[seasonIndex], numbers.slice(-9)));
    }
  }

  if (!rows.length) {
    const month = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)";
    const rowRegex = new RegExp(`\\b([A-Z]{3})\\s+${month}\\s+${month}\\s+${month}\\s+((?:\\d{1,3}\\s+){8}\\d{1,3})`, "g");
    for (const match of text.matchAll(rowRegex)) {
      const values = match[2].trim().split(/\s+/).map(Number);
      if (values.length === 9 && values.every(Number.isFinite)) {
        rows.push(probabilityRow(match[1], values));
      }
    }
  }

  if (!rows.length) {
    throw new Error("A tabela oficial de probabilidades não foi reconhecida");
  }

  return {
    issuedLabel,
    issuedAt: issuedLabel ? parseEnglishDate(`1 ${issuedLabel}`) : null,
    seasons: rows,
  };
}

function derivePhase(alertStatus = "", synopsis = "", nino34 = null) {
  const summary = synopsis.toLowerCase();
  const alert = alertStatus.toLowerCase();

  if (/enso[- ]neutral conditions (?:are|remain|continue)/.test(summary)) return "ENSO-neutro";
  if (/(?:el niño|el nino) conditions (?:are|remain|continue)/.test(summary)) return "El Niño";
  if (/(?:la niña|la nina) conditions (?:are|remain|continue)/.test(summary)) return "La Niña";

  if (alert.includes("final") || summary.includes("enso-neutral")) return "ENSO-neutro";
  if (alert.includes("el niño advisory") || alert.includes("el nino advisory")) return "El Niño";
  if (alert.includes("la niña advisory") || alert.includes("la nina advisory")) return "La Niña";

  if (Number.isFinite(nino34)) {
    if (nino34 >= 0.5) return "Aquecimento oceânico";
    if (nino34 <= -0.5) return "Resfriamento oceânico";
  }
  return "ENSO em monitoramento";
}

function localizeAlert(alertStatus, phase) {
  const status = alertStatus?.toLowerCase() || "";
  if (status.includes("advisory") && phase.includes("El Niño")) return "Aviso de El Niño";
  if (status.includes("advisory") && phase.includes("La Niña")) return "Aviso de La Niña";
  if (status.includes("watch") && phase.includes("El Niño")) return "Vigilância de El Niño";
  if (status.includes("watch") && phase.includes("La Niña")) return "Vigilância de La Niña";
  if (status.includes("final")) return "Aviso final";
  return alertStatus || "Sem alerta informado";
}

function sourceState(source, result) {
  return {
    name: source.name,
    url: source.url,
    cadence: source.cadence,
    available: result.status === "fulfilled",
    error: result.status === "rejected" ? result.reason?.message || "Falha desconhecida" : null,
  };
}

function parseResult(result, parser) {
  if (result.status === "rejected") return result;
  try {
    return { status: "fulfilled", value: parser(result.value) };
  } catch (error) {
    return { status: "rejected", reason: error };
  }
}

function buildResponse(results) {
  const [diagnosticResult, probabilityResult, weeklyResult] = results;
  const diagnostic = diagnosticResult.status === "fulfilled" ? diagnosticResult.value : null;
  const forecast = probabilityResult.status === "fulfilled" ? probabilityResult.value : null;
  const weekly = weeklyResult.status === "fulfilled" ? weeklyResult.value : null;

  if (!diagnostic && !forecast && !weekly) {
    const reasons = results.map((result) => result.reason?.message).filter(Boolean).join("; ");
    throw new Error(reasons || "Nenhuma fonte da NOAA pôde ser consultada");
  }

  const nino34 = weekly?.regions.nino34.anomaly ?? diagnostic?.nino34 ?? null;
  const phase = derivePhase(diagnostic?.alertStatus, diagnostic?.synopsis, nino34);
  const generatedAt = new Date().toISOString();
  const selectedSeason = forecast?.seasons?.[0] || null;

  return {
    ok: true,
    stale: false,
    generatedAt,
    cacheExpiresAt: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
    refreshIntervalMs: CACHE_TTL_MS,
    current: {
      phase,
      alertStatus: diagnostic?.alertStatus || null,
      alertStatusPt: localizeAlert(diagnostic?.alertStatus, phase),
      synopsis: diagnostic?.synopsis || null,
      issuedAt: diagnostic?.issuedAt || null,
      issuedLabel: diagnostic?.issuedLabel || null,
      nextUpdate: diagnostic?.nextUpdate || null,
      nextUpdateLabel: diagnostic?.nextUpdateLabel || null,
      weeklySst: weekly || {
        date: diagnostic?.issuedAt || null,
        dateLabel: diagnostic?.issuedLabel || null,
        regions: {
          nino12: { sst: null, anomaly: diagnostic?.nino12 ?? null },
          nino3: { sst: null, anomaly: null },
          nino34: { sst: null, anomaly: diagnostic?.nino34 ?? null },
          nino4: { sst: null, anomaly: diagnostic?.nino4 ?? null },
        },
      },
    },
    forecast: forecast ? {
      issuedAt: forecast.issuedAt,
      issuedLabel: forecast.issuedLabel,
      selectedSeason,
      seasons: forecast.seasons,
    } : null,
    sources: [
      sourceState(NOAA_SOURCES.diagnostic, diagnosticResult),
      sourceState(NOAA_SOURCES.probabilities, probabilityResult),
      sourceState(NOAA_SOURCES.weeklySst, weeklyResult),
    ],
    notes: [
      "A fase oficial considera o sistema oceano-atmosfera, não apenas uma anomalia semanal isolada.",
      "As probabilidades são fornecidas para períodos móveis de três meses.",
      "Os impactos por país exibidos no mapa são referências educacionais baseadas em padrões históricos.",
    ],
  };
}

async function refresh() {
  const sources = [NOAA_SOURCES.diagnostic, NOAA_SOURCES.probabilities, NOAA_SOURCES.weeklySst];
  const fetched = await Promise.allSettled(sources.map(fetchText));
  const results = [
    parseResult(fetched[0], parseDiagnostic),
    parseResult(fetched[1], parseProbabilities),
    parseResult(fetched[2], parseWeeklySst),
  ];

  try {
    const value = buildResponse(results);
    cache = value;
    expiresAt = Date.now() + CACHE_TTL_MS;
    return value;
  } catch (error) {
    if (cache) {
      return {
        ...cache,
        stale: true,
        warning: `A NOAA não pôde ser atualizada agora. Exibindo o último dado válido: ${error.message}`,
        generatedAt: new Date().toISOString(),
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

export { NOAA_SOURCES, parseDiagnostic, parseProbabilities, parseWeeklySst };
