const NOAA_SOURCES = {
  diagnostic: {
    name: "NOAA/CPC — ENSO Diagnostic Discussion",
    url: "https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
    cadence: "monthly",
  },
  probabilities: {
    name: "NOAA/CPC — Official ENSO Strength Probabilities",
    url: "https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/strengths/",
    cadence: "monthly",
  },
  phaseProbabilities: {
    name: "NOAA/CPC — Official ENSO Probabilities",
    url: "https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/probabilities/",
    cadence: "monthly",
  },
  weeklySst: {
    name: "NOAA/CPC — Weekly Niño SST Indices (1991–2020 base)",
    url: "https://cpc.ncep.noaa.gov/data/indices/wksst9120.for",
    cadence: "weekly",
  },
};

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
  return decodeEntities(html.replace(/<!--[\s\S]*?-->/g, " "))
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

  if (!issuedLabel || (!alertStatus && !synopsis)) {
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
  const rows = [];
  for (const line of raw.split(/\r?\n/)) {
    const match = line.trim().match(/^(\d{1,2}[A-Za-z]{3}\d{4})\s+(.+)$/);
    if (!match) continue;
    const date = parseCompactDate(match[1]);
    // The fixed-width file can attach a negative departure to its temperature.
    const values = (match[2].match(/[+-]?\d+\.\d+/g) ?? []).map(Number);
    if (!date || values.length !== 8) continue;
    const regions = Object.fromEntries(["nino12", "nino3", "nino34", "nino4"].map((key, i) => {
      const [sst, anomaly] = values.slice(i * 2, i * 2 + 2);
      return [key, { sst: sst > -3 && sst < 45 ? sst : null, anomaly: Math.abs(anomaly) < 15 ? anomaly : null }];
    }));
    rows.push({ date, dateLabel: match[1].toUpperCase(), regions });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  if (!rows.length) throw new Error("Weekly NOAA SST data was not recognized");
  return { ...rows.at(-1), series: rows.slice(-52) };
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

  const codes = /^(DJF|JFM|FMA|MAM|AMJ|MJJ|JJA|JAS|ASO|SON|OND|NDJ)$/;
  for (const rowMatch of html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = cellsFromRow(rowMatch[1]);
    const seasonIndex = cells.findIndex((cell) => codes.test(cell.split(/\s+/)[0]));
    if (seasonIndex < 0) continue;
    const season = cells[seasonIndex].split(/\s+/)[0];
    const numbers = cells.slice(seasonIndex + 1).filter((cell) => /^\d{1,3}\s*%?$/.test(cell)).map((cell) => Number(cell.replace("%", "")));
    const sum = numbers.reduce((total, value) => total + value, 0);
    if (Math.abs(sum - 100) > 5 || numbers.some((value) => value > 100)) continue;
    if (numbers.length === 3) {
      const [laNina, neutral, elNino] = numbers;
      rows.push({ season, probability: { laNina, neutral, elNino } });
    }
    if (numbers.length === 9) rows.push(probabilityRow(season, numbers));
  }

  if (!rows.length) {
    const month = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)";
    const rowRegex = new RegExp(`\\b([A-Z]{3})\\s+${month}\\s+${month}\\s+${month}\\s+((?:\\d{1,3}\\s+){8}\\d{1,3})`, "g");
    for (const match of text.matchAll(rowRegex)) {
      const values = match[2].trim().split(/\s+/).map(Number);
      if (codes.test(match[1]) && values.length === 9 && values.every((value) => value <= 100) && Math.abs(values.reduce((sum, value) => sum + value, 0) - 100) <= 5) {
        rows.push(probabilityRow(match[1], values));
      }
    }
  }

  if (!issuedLabel || !rows.length) {
    throw new Error("A tabela oficial de probabilidades não foi reconhecida");
  }

  return {
    issuedLabel,
    issuedAt: issuedLabel ? parseEnglishDate(`1 ${issuedLabel}`) : null,
    seasons: rows,
  };
}

function derivePhase(diagnostic) {
  if (!diagnostic?.issuedAt) return null;
  const summary = diagnostic.synopsis?.toLowerCase() ?? "";
  const alert = diagnostic.alertStatus?.toLowerCase() ?? "";
  if (/^enso[- ]neutral (?:conditions? )?(?:are present|remain|continue|is present|has returned)/.test(summary)) return "ENSO-neutro";
  const current = /^(el ni[ñn]o|la ni[ñn]a) (?:conditions (?:are (?:present|ongoing)|persist|continue)|continues to|is currently present)/.exec(summary);
  if (current) return current[1].startsWith("el") ? "El Niño" : "La Niña";
  if (alert.includes("final")) return /enso[- ]neutral/.test(summary) ? "ENSO-neutro" : null;
  if (/^el ni[ñn]o advisory/.test(alert)) return "El Niño";
  if (/^la ni[ñn]a advisory/.test(alert)) return "La Niña";
  return null;
}

function localizeAlert(alertStatus, phase) {
  const status = alertStatus?.toLowerCase() || "";
  if (status.includes("advisory") && (phase ?? "").includes("El Niño")) return "Aviso de El Niño";
  if (status.includes("advisory") && (phase ?? "").includes("La Niña")) return "Aviso de La Niña";
  if (status.includes("watch") && (phase ?? "").includes("El Niño")) return "Vigilância de El Niño";
  if (status.includes("watch") && (phase ?? "").includes("La Niña")) return "Vigilância de La Niña";
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

function buildResponse(results, ttl) {
  const [diagnosticResult, strengthResult, probabilityResult, weeklyResult] = results;
  const diagnostic = diagnosticResult.status === "fulfilled" ? diagnosticResult.value : null;
  const forecast = probabilityResult.status === "fulfilled" ? probabilityResult.value : null;
  const strength = strengthResult.status === "fulfilled" ? strengthResult.value : null;
  const weekly = weeklyResult.status === "fulfilled" ? weeklyResult.value : null;

  if (!diagnostic && !forecast && !weekly) {
    const reasons = results.map((result) => result.reason?.message).filter(Boolean).join("; ");
    throw new Error(reasons || "Nenhuma fonte da NOAA pôde ser consultada");
  }

  const phase = derivePhase(diagnostic);
  const generatedAt = new Date().toISOString();
  const seasons = forecast?.seasons.map((row) => {
    const detail = strength?.issuedAt === forecast.issuedAt ? strength.seasons.find((item) => item.season === row.season)?.strength : null;
    return detail ? { ...row, strength: detail } : row;
  });

  return {
    ok: true,
    stale: false,
    generatedAt,
    cacheExpiresAt: new Date(Date.now() + ttl).toISOString(),
    refreshIntervalMs: ttl,
    current: {
      phase,
      alertStatus: diagnostic?.alertStatus || null,
      alertStatusPt: localizeAlert(diagnostic?.alertStatus, phase),
      synopsis: diagnostic?.synopsis || null,
      issuedAt: diagnostic?.issuedAt || null,
      issuedLabel: diagnostic?.issuedLabel || null,
      nextUpdate: diagnostic?.nextUpdate || null,
      nextUpdateLabel: diagnostic?.nextUpdateLabel || null,
      weeklySst: weekly,
    },
    forecast: forecast ? {
      issuedAt: forecast.issuedAt,
      issuedLabel: forecast.issuedLabel,
      selectedSeason: seasons[0] ?? null,
      seasons,
    } : null,
    sources: [
      sourceState(NOAA_SOURCES.diagnostic, diagnosticResult),
      sourceState(NOAA_SOURCES.probabilities, strengthResult),
      sourceState(NOAA_SOURCES.phaseProbabilities, probabilityResult),
      sourceState(NOAA_SOURCES.weeklySst, weeklyResult),
    ],
    notes: [
      "A fase oficial considera o sistema oceano-atmosfera, não apenas uma anomalia semanal isolada.",
      "As probabilidades são fornecidas para períodos móveis de três meses.",
      "Os impactos por país exibidos no mapa são referências educacionais baseadas em padrões históricos.",
    ],
  };
}

export async function loadNoaaEnso(fetchText, ttl = 1_800_000) {
  const data = await Promise.allSettled(Object.values(NOAA_SOURCES).map(fetchText));
  const parsers = [parseDiagnostic, parseProbabilities, parseProbabilities, parseWeeklySst];
  return buildResponse(data.map((item, i) => parseResult(item, parsers[i])), ttl);
}

export { NOAA_SOURCES, parseDiagnostic, parseProbabilities, parseWeeklySst };
