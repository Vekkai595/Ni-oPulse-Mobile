import { finite, FORECAST_URL, getJson, isPoint } from "./weather.js";

/** @type {[string, number, number][]} */
const cities = [
  ["Vancouver", 49.28, -123.12], ["New York", 40.71, -74.01], ["Mexico City", 19.43, -99.13], ["Lima", -12.05, -77.04],
  ["Rio de Janeiro", -22.91, -43.2], ["Buenos Aires", -34.6, -58.38], ["Lisboa", 38.72, -9.14], ["Cairo", 30.04, 31.24],
  ["Cape Town", -33.92, 18.42], ["New Delhi", 28.61, 77.21], ["Singapore", 1.35, 103.82], ["Tokyo", 35.68, 139.69],
  ["Sydney", -33.87, 151.21], ["Auckland", -36.85, 174.76],
];
/** @type {{name: string, en?: string, latitude: number, longitude: number}[]} */
export const MAP_POINTS = cities.map(([name, latitude, longitude]) => ({ name, latitude, longitude }));
export const OCEAN_POINTS = [
  { name: "Pacífico · Niño 3.4", en: "Pacific · Niño 3.4", latitude: 0, longitude: -145 },
  { name: "Atlântico Sul", en: "South Atlantic", latitude: -20, longitude: -20 },
  { name: "Oceano Índico", en: "Indian Ocean", latitude: -25, longitude: 77 },
  { name: "Atlântico Norte", en: "North Atlantic", latitude: 33, longitude: -45 },
];

/** @type {{id: string, name: string, center: import("leaflet").LatLngTuple, bounds: import("leaflet").LatLngBoundsLiteral[]}[]} */
export const NINO = [
  { id: "nino34", name: "Niño 3.4", center: [0, -145], bounds: [[[-5, -170], [5, -120]]] },
  { id: "nino3", name: "Niño 3", center: [0, -105], bounds: [[[-5, -150], [5, -90]]] },
  { id: "nino4", name: "Niño 4", center: [0, -175], bounds: [[[-5, 160], [5, 180]], [[-5, -180], [5, -150]]] },
  { id: "nino12", name: "Niño 1+2", center: [-5, -85], bounds: [[[-10, -90], [0, -80]]] },
];

function normalize(raw) {
  if (!raw?.current?.time) throw new Error("Map data unavailable");
  return { time: raw.current.time, interval: finite(raw.current.interval), temp: finite(raw.current.temperature_2m),
    rain: finite(raw.current.precipitation), ocean: finite(raw.current.sea_surface_temperature) };
}

export async function mapSamples(signal) {
  const params = new URLSearchParams({
    latitude: MAP_POINTS.map(({ latitude }) => latitude).join(","),
    longitude: MAP_POINTS.map(({ longitude }) => longitude).join(","),
    current: "temperature_2m,precipitation", timezone: "GMT", forecast_days: "1",
  });
  const data = await getJson(`${FORECAST_URL}?${params}`, signal);
  if (!Array.isArray(data) || data.length !== MAP_POINTS.length) throw new Error("Invalid map samples");
  return MAP_POINTS.map((point, index) => ({ ...point, ...normalize(data[index]) }));
}

export async function pointWeather(point, ocean, signal) {
  if (!isPoint(point)) throw new Error("Invalid coordinates");
  const params = new URLSearchParams({
    latitude: point.latitude.toFixed(2), longitude: point.longitude.toFixed(2),
    current: ocean ? "sea_surface_temperature" : "temperature_2m,precipitation", timezone: "GMT", forecast_days: "1",
  });
  const endpoint = ocean ? "https://marine-api.open-meteo.com/v1/marine" : FORECAST_URL;
  return normalize(await getJson(`${endpoint}?${params}`, signal));
}
