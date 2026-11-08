import test from "node:test";
import assert from "node:assert/strict";
import { compareForecast, dateInZone, normalizeForecast } from "./weather.js";

test("preserves numeric zero and skips the preceding hourly row", () => {
  const result = normalizeForecast({
    timezone: "America/Sao_Paulo",
    current: { time: "2026-11-07T13:15", temperature_2m: 0, relative_humidity_2m: null },
    hourly: { time: ["2026-11-07T12:00", "2026-11-07T13:00", "2026-11-07T14:00"], precipitation_probability: [20, 0, null] },
    daily: { time: ["2026-11-07"], temperature_2m_min: [0], temperature_2m_max: [null] },
  });
  assert.equal(result.current.temp, 0);
  assert.equal(result.current.humidity, null);
  assert.deepEqual(result.hourly.map(({ rain }) => rain), [0, null]);
  assert.equal(result.daily[0].high, null);
});

test("uses yesterday in the city time zone and compares the same target date", () => {
  const fetchedAt = "2026-11-07T02:00:00.000Z";
  const timezone = "America/Sao_Paulo";
  assert.equal(dateInZone(fetchedAt, timezone), "2026-11-06");
  const data = { fetchedAt, timezone, daily: [{ date: "2026-11-06", rain: 30, high: 22 }, { date: "2026-11-07", rain: null, high: 27 }] };
  const previous = [{ captureDate: "2026-11-05", fetchedAt: "2026-11-05T22:00:00Z", daily: [{ date: "2026-11-05", rain: 0, high: 0 }, { date: "2026-11-06", rain: 10, high: 22 }] }];
  assert.deepEqual(compareForecast(data, previous).changes, [{ metric: "rain", date: "2026-11-06", before: 10, after: 30, delta: 20 }]);
  assert.equal(compareForecast(data, []).status, "learning");
  assert.equal(compareForecast({ ...data, daily: [{ date: "2026-11-08", high: 30 }] }, previous).status, "incomparable");
});
