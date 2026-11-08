import { readLocal, writeLocal } from "./localStore.js";

export const WEATHER_TTL = 15 * 60 * 1000;
export const WEATHER_SOURCE = "https://open-meteo.com/";
export const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE = "ninopulse-weather-v3";
const DAY = 86_400_000;

export async function getJson(url, signal, timeoutMs = 16_000) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export const finite = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;

export function isPoint(value) {
  return finite(value?.latitude) !== null && finite(value?.longitude) !== null &&
    Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180;
}

export function isPlace(value) {
  return isPoint(value) && typeof value.id === "string" && typeof value.name === "string";
}

export async function searchPlaces(query, language, signal) {
  const params = new URLSearchParams({ name: query.trim(), language, count: "8", format: "json" });
  const data = await getJson(`https://geocoding-api.open-meteo.com/v1/search?${params}`, signal);
  return (data.results ?? []).filter((item) => isPoint(item) && item.id && item.name).map((item) => ({
    id: String(item.id), name: item.name, region: item.admin1 ?? "", country: item.country ?? "",
    countryCode: item.country_code ?? "", latitude: item.latitude, longitude: item.longitude,
  }));
}

export function placeRegion(place, language) {
  let country = place?.country;
  if (place?.countryCode && Intl.DisplayNames && /^[A-Z]{2}$/.test(place.countryCode)) {
    country = new Intl.DisplayNames([language], { type: "region" }).of(place.countryCode);
  }
  return [place?.region, country].filter((item) => item && item !== place.name).join(" · ");
}

export function normalizeForecast(payload, fetchedAt = new Date().toISOString()) {
  const { current, hourly, daily, timezone } = payload ?? {};
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(current?.time ?? "") ||
      !Array.isArray(hourly?.time) || !hourly.time.length || !Array.isArray(daily?.time) || !daily.time.length || !timezone) {
    throw new Error("Invalid forecast response");
  }
  new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
  const currentHour = current.time.slice(0, 13);
  return {
    fetchedAt, timezone,
    current: {
      time: current.time, temp: finite(current.temperature_2m), feels: finite(current.apparent_temperature),
      humidity: finite(current.relative_humidity_2m), wind: finite(current.wind_speed_10m),
      code: finite(current.weather_code), isDay: current.is_day !== 0,
    },
    hourly: hourly.time.map((time, i) => ({
      time, temp: finite(hourly.temperature_2m?.[i]), rain: finite(hourly.precipitation_probability?.[i]),
      code: finite(hourly.weather_code?.[i]),
    })).filter(({ time }) => time.slice(0, 13) >= currentHour).slice(0, 24),
    daily: daily.time.map((date, i) => ({
      date, high: finite(daily.temperature_2m_max?.[i]), low: finite(daily.temperature_2m_min?.[i]),
      rain: finite(daily.precipitation_probability_max?.[i]), code: finite(daily.weather_code?.[i]),
    })).slice(0, 7),
  };
}

export async function fetchLocalWeather(place, signal) {
  const params = new URLSearchParams({
    latitude: place.latitude.toFixed(4), longitude: place.longitude.toFixed(4),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
    timezone: "auto", forecast_days: "7",
  });
  return normalizeForecast(await getJson(`${FORECAST_URL}?${params}`, signal));
}

export function dateInZone(instant, timeZone) {
  const parts = new Intl.DateTimeFormat("en", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date(instant));
  const part = (key) => parts.find(({ type }) => type === key)?.value;
  return [part("year"), part("month"), part("day")].join("-");
}

function saved(place) {
  return place && !place.device ? readLocal(ARCHIVE, {})[place.id] : undefined;
}

export function readWeather(place) {
  const data = saved(place)?.latest;
  return Number.isFinite(Date.parse(data?.fetchedAt)) ? data : undefined;
}

export function weatherSnapshots(place) {
  return saved(place)?.snapshots ?? [];
}

export function recordForecast(place, forecast) {
  if (place.device) return;
  const archive = readLocal(ARCHIVE, {});
  const last = archive[place.id];
  if (Date.parse(last?.latest?.fetchedAt) >= Date.parse(forecast.fetchedAt)) return;
  const captureDate = dateInZone(forecast.fetchedAt, forecast.timezone);
  const snapshot = { fetchedAt: forecast.fetchedAt, captureDate, daily: forecast.daily.map(({ date, rain, high }) => ({ date, rain, high })) };
  const snapshots = [snapshot, ...(last?.snapshots ?? []).filter((item) => item.captureDate !== captureDate)].slice(0, 8);
  const entries = Object.entries({ ...archive, [place.id]: { latest: forecast, snapshots } })
    .sort((a, b) => Date.parse(b[1].latest?.fetchedAt) - Date.parse(a[1].latest?.fetchedAt));
  writeLocal(ARCHIVE, Object.fromEntries(entries.slice(0, 24)));
}

export function compareForecast(latest, snapshots) {
  if (!latest) return { status: "unavailable", changes: [] };
  const capture = dateInZone(latest.fetchedAt, latest.timezone);
  const yesterday = new Date(Date.parse(capture) - DAY).toISOString().slice(0, 10);
  const previous = snapshots.find((item) => item.captureDate === yesterday && Date.parse(item.fetchedAt) < Date.parse(latest.fetchedAt));
  if (!previous) return { status: "learning", changes: [] };
  const changes = [];
  let comparable = 0;
  for (const day of latest.daily.filter((item) => item.date >= capture).slice(0, 2)) {
    const before = previous.daily.find((item) => item.date === day.date);
    if (!before) continue;
    for (const { metric, threshold } of [{ metric: "rain", threshold: 10 }, { metric: "high", threshold: 2 }]) {
      if (finite(before[metric]) === null || finite(day[metric]) === null) continue;
      comparable++;
      const delta = Math.round((day[metric] - before[metric]) * 10) / 10;
      if (Math.abs(delta) >= threshold) changes.push({ metric, date: day.date, before: before[metric], after: day[metric], delta });
    }
  }
  return { status: comparable ? "compared" : "incomparable", comparedAt: previous.fetchedAt, changes };
}

export function localTime(value, language, options) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : `${value}Z`);
  return Number.isNaN(+date) ? "—" : new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en", { ...options, timeZone: "UTC" }).format(date);
}

export function instant(value, language, timeZone) {
  const date = new Date(value ?? NaN);
  return Number.isNaN(+date) ? "—" : new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en", { dateStyle: "medium", timeStyle: "short", timeZone }).format(date);
}

export function metric(value, language, decimals = 0) {
  return finite(value) === null ? "—" : new Intl.NumberFormat(language, { maximumFractionDigits: decimals }).format(value);
}
