const SEASON_MONTHS = {
  pt: { DJF: "dez–fev", JFM: "jan–mar", FMA: "fev–abr", MAM: "mar–mai", AMJ: "abr–jun", MJJ: "mai–jul", JJA: "jun–ago", JAS: "jul–set", ASO: "ago–out", SON: "set–nov", OND: "out–dez", NDJ: "nov–jan" },
  en: { DJF: "Dec–Feb", JFM: "Jan–Mar", FMA: "Feb–Apr", MAM: "Mar–May", AMJ: "Apr–Jun", MJJ: "May–Jul", JJA: "Jun–Aug", JAS: "Jul–Sep", ASO: "Aug–Oct", SON: "Sep–Nov", OND: "Oct–Dec", NDJ: "Nov–Jan" },
};

export function formatDate(value, options = {}, language = "pt") {
  if (!value) return language === "pt" ? "Não informado" : "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC", ...options,
  }).format(date);
}

export function formatDateTime(value, language = "pt") {
  if (!value) return language === "pt" ? "Não informado" : "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(date);
}

export function formatAnomaly(value) {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} °C`;
}

export function seasonLabel(code, language = "pt") {
  return SEASON_MONTHS[language]?.[code] ? `${code} · ${SEASON_MONTHS[language][code]}` : code;
}

export function cadenceLabel(cadence, language = "pt") {
  const labels = {
    pt: { weekly: "semanal", daily: "diária", monthly: "mensal", variable: "variável" },
    en: { weekly: "weekly", daily: "daily", monthly: "monthly", variable: "variable" },
  };
  return labels[language]?.[cadence] || cadence || labels[language].variable;
}
