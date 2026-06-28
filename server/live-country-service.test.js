import assert from "node:assert/strict";
import test from "node:test";
import { countries } from "../src/lib/elNinoData.js";
import {
  buildOpenMeteoUrl,
  getLiveCountries,
  monitoringLocations,
  normalizeForecastResponse,
  resetLiveCountryCacheForTests,
} from "./live-country-service.js";

function mockRow(index = 0) {
  return {
    latitude: index,
    longitude: index + 0.5,
    elevation: 100,
    timezone: "America/Sao_Paulo",
    timezone_abbreviation: "GMT-3",
    current: {
      time: "2026-06-19T20:00",
      interval: 900,
      temperature_2m: 20 + index,
      relative_humidity_2m: 70,
      apparent_temperature: 21 + index,
      is_day: 0,
      precipitation: 0.4,
      rain: 0.4,
      weather_code: 61,
      cloud_cover: 80,
      wind_speed_10m: 12,
      wind_gusts_10m: 24,
    },
    daily: {
      time: ["2026-06-19", "2026-06-20"],
      weather_code: [61, 3],
      temperature_2m_max: [28, 27],
      temperature_2m_min: [18, 17],
      precipitation_sum: [8, 0],
      precipitation_probability_max: [85, 15],
      wind_speed_10m_max: [22, 18],
    },
  };
}

test("builds one Open-Meteo request for all 30 monitoring locations", () => {
  const url = new URL(buildOpenMeteoUrl());
  assert.equal(url.hostname, "api.open-meteo.com");
  assert.equal(url.searchParams.get("latitude").split(",").length, 30);
  assert.equal(url.searchParams.get("longitude").split(",").length, 30);
  assert.equal(url.searchParams.get("forecast_days"), "7");
  assert.equal(Object.keys(monitoringLocations).length, countries.length);
});

test("normalizes current conditions and forecast for every country", () => {
  const payload = countries.map((_, index) => mockRow(index));
  const result = normalizeForecastResponse(payload, "2026-06-19T23:00:00.000Z");
  assert.equal(result.count, 30);
  assert.equal(result.countries[0].id, "BR");
  assert.equal(result.countries[0].location.name, "Brasília");
  assert.equal(result.countries[0].current.temperature, 20);
  assert.equal(result.countries[0].forecast.length, 2);
  assert.equal(result.countries[0].today.precipitationProbability, 85);
});

test("returns the last valid live snapshot when the provider fails", async () => {
  resetLiveCountryCacheForTests();
  const payload = countries.map((_, index) => mockRow(index));
  const okFetch = async () => ({ ok: true, json: async () => payload });
  const failedFetch = async () => ({ ok: false, status: 503, json: async () => ({}) });

  const fresh = await getLiveCountries({ force: true, fetchImpl: okFetch });
  const stale = await getLiveCountries({ force: true, fetchImpl: failedFetch });
  assert.equal(fresh.stale, false);
  assert.equal(stale.stale, true);
  assert.equal(stale.countries.length, 30);
  resetLiveCountryCacheForTests();
});
