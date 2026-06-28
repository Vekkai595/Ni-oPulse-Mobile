import { countries } from "../src/lib/elNinoData.js";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15_000;

export const monitoringLocations = {
  BR: { name: "Brasília", nameEn: "Brasília", lat: -15.7939, lng: -47.8828 },
  US: { name: "Washington, D.C.", nameEn: "Washington, D.C.", lat: 38.9072, lng: -77.0369 },
  CA: { name: "Ottawa", nameEn: "Ottawa", lat: 45.4215, lng: -75.6972 },
  MX: { name: "Cidade do México", nameEn: "Mexico City", lat: 19.4326, lng: -99.1332 },
  AR: { name: "Buenos Aires", nameEn: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  CL: { name: "Santiago", nameEn: "Santiago", lat: -33.4489, lng: -70.6693 },
  PE: { name: "Lima", nameEn: "Lima", lat: -12.0464, lng: -77.0428 },
  CO: { name: "Bogotá", nameEn: "Bogotá", lat: 4.711, lng: -74.0721 },
  AU: { name: "Canberra", nameEn: "Canberra", lat: -35.2809, lng: 149.13 },
  NZ: { name: "Wellington", nameEn: "Wellington", lat: -41.2865, lng: 174.7762 },
  CN: { name: "Pequim", nameEn: "Beijing", lat: 39.9042, lng: 116.4074 },
  IN: { name: "Nova Délhi", nameEn: "New Delhi", lat: 28.6139, lng: 77.209 },
  JP: { name: "Tóquio", nameEn: "Tokyo", lat: 35.6762, lng: 139.6503 },
  ID: { name: "Jacarta", nameEn: "Jakarta", lat: -6.2088, lng: 106.8456 },
  PH: { name: "Manila", nameEn: "Manila", lat: 14.5995, lng: 120.9842 },
  ZA: { name: "Pretória", nameEn: "Pretoria", lat: -25.7479, lng: 28.2293 },
  EG: { name: "Cairo", nameEn: "Cairo", lat: 30.0444, lng: 31.2357 },
  NG: { name: "Abuja", nameEn: "Abuja", lat: 9.0765, lng: 7.3986 },
  KE: { name: "Nairóbi", nameEn: "Nairobi", lat: -1.2921, lng: 36.8219 },
  GB: { name: "Londres", nameEn: "London", lat: 51.5074, lng: -0.1278 },
  FR: { name: "Paris", nameEn: "Paris", lat: 48.8566, lng: 2.3522 },
  DE: { name: "Berlim", nameEn: "Berlin", lat: 52.52, lng: 13.405 },
  ES: { name: "Madri", nameEn: "Madrid", lat: 40.4168, lng: -3.7038 },
  IT: { name: "Roma", nameEn: "Rome", lat: 41.9028, lng: 12.4964 },
  RU: { name: "Moscou", nameEn: "Moscow", lat: 55.7558, lng: 37.6173 },
  SA: { name: "Riade", nameEn: "Riyadh", lat: 24.7136, lng: 46.6753 },
  PK: { name: "Islamabad", nameEn: "Islamabad", lat: 33.6844, lng: 73.0479 },
  BD: { name: "Daca", nameEn: "Dhaka", lat: 23.8103, lng: 90.4125 },
  TH: { name: "Bangcoc", nameEn: "Bangkok", lat: 13.7563, lng: 100.5018 },
  VN: { name: "Hanói", nameEn: "Hanoi", lat: 21.0278, lng: 105.8342 },
};

let cache = null;
let lastValid = null;
let inFlight = null;

function finiteOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function valueAt(list, index) {
  return Array.isArray(list) ? list[index] ?? null : null;
}

export function buildOpenMeteoUrl() {
  const locations = countries.map((country) => monitoringLocations[country.id]);
  if (locations.some((location) => !location)) throw new Error("A monitoring location is missing for one or more countries.");

  const params = new URLSearchParams({
    latitude: locations.map((location) => location.lat).join(","),
    longitude: locations.map((location) => location.lng).join(","),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  });

  return `${OPEN_METEO_URL}?${params.toString()}`;
}

export function normalizeForecastResponse(payload, generatedAt = new Date().toISOString()) {
  const rows = Array.isArray(payload) ? payload : [payload];
  if (rows.length !== countries.length) {
    throw new Error(`Open-Meteo returned ${rows.length} locations; expected ${countries.length}.`);
  }

  const normalized = countries.map((country, index) => {
    const row = rows[index];
    const location = monitoringLocations[country.id];
    if (!row?.current || !row?.daily) throw new Error(`Weather data is incomplete for ${country.id}.`);

    const dates = Array.isArray(row.daily.time) ? row.daily.time : [];
    const forecast = dates.map((date, dayIndex) => ({
      date,
      weatherCode: finiteOrNull(valueAt(row.daily.weather_code, dayIndex)),
      temperatureMax: finiteOrNull(valueAt(row.daily.temperature_2m_max, dayIndex)),
      temperatureMin: finiteOrNull(valueAt(row.daily.temperature_2m_min, dayIndex)),
      precipitationSum: finiteOrNull(valueAt(row.daily.precipitation_sum, dayIndex)),
      precipitationProbability: finiteOrNull(valueAt(row.daily.precipitation_probability_max, dayIndex)),
      windSpeedMax: finiteOrNull(valueAt(row.daily.wind_speed_10m_max, dayIndex)),
    }));

    return {
      id: country.id,
      countryName: country.nome,
      location: {
        name: location.name,
        nameEn: location.nameEn || location.name,
        requestedLatitude: location.lat,
        requestedLongitude: location.lng,
        latitude: finiteOrNull(row.latitude),
        longitude: finiteOrNull(row.longitude),
        elevation: finiteOrNull(row.elevation),
        timezone: row.timezone || "GMT",
        timezoneAbbreviation: row.timezone_abbreviation || "GMT",
      },
      current: {
        time: row.current.time || generatedAt,
        intervalSeconds: finiteOrNull(row.current.interval),
        temperature: finiteOrNull(row.current.temperature_2m),
        apparentTemperature: finiteOrNull(row.current.apparent_temperature),
        humidity: finiteOrNull(row.current.relative_humidity_2m),
        precipitation: finiteOrNull(row.current.precipitation),
        rain: finiteOrNull(row.current.rain),
        weatherCode: finiteOrNull(row.current.weather_code),
        cloudCover: finiteOrNull(row.current.cloud_cover),
        windSpeed: finiteOrNull(row.current.wind_speed_10m),
        windGusts: finiteOrNull(row.current.wind_gusts_10m),
        isDay: Number(row.current.is_day) === 1,
      },
      today: forecast[0] || null,
      forecast,
    };
  });

  return {
    ok: true,
    generatedAt,
    stale: false,
    count: normalized.length,
    refreshMinutes: CACHE_MS / 60_000,
    source: {
      name: "Open-Meteo",
      url: "https://open-meteo.com/",
      licence: "CC BY 4.0",
      note: "Current conditions are weather-model estimates for one representative location per country.",
    },
    countries: normalized,
  };
}

async function fetchJson(fetchImpl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(buildOpenMeteoUrl(), {
      headers: { Accept: "application/json", "User-Agent": "NinoPulse-Global/2.2" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Open-Meteo returned HTTP ${response.status}.`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLiveCountries({ force = false, fetchImpl = fetch } = {}) {
  const now = Date.now();
  if (!force && cache && now - cache.timestamp < CACHE_MS) return cache.data;
  if (!force && inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const payload = await fetchJson(fetchImpl);
      const data = normalizeForecastResponse(payload);
      cache = { timestamp: Date.now(), data };
      lastValid = data;
      return data;
    } catch (error) {
      if (lastValid) {
        return {
          ...lastValid,
          stale: true,
          lastError: error instanceof Error ? error.message : "Unknown Open-Meteo failure",
        };
      }
      throw error;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function getLiveCountryHealth() {
  return {
    cached: Boolean(cache),
    lastValid: Boolean(lastValid),
    cacheAgeSeconds: cache ? Math.round((Date.now() - cache.timestamp) / 1000) : null,
    cacheTtlSeconds: CACHE_MS / 1000,
    inFlight: Boolean(inFlight),
  };
}

export function resetLiveCountryCacheForTests() {
  cache = null;
  lastValid = null;
  inFlight = null;
}
