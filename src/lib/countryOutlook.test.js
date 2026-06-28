import test from "node:test";
import assert from "node:assert/strict";
import { countryAlertSnapshot, getCountryScenario } from "./countryOutlook.js";

const country = { id: "BR", nivelDeRisco: "alto", impactoDoElNino: "Historical El Niño impacts." };
const data = {
  current: { phase: "El Niño", weeklySst: { regions: { nino34: { anomaly: 1.1 } } } },
  forecast: { selectedSeason: { probability: { elNino: 80, neutral: 15, laNina: 5 } } },
};

test("builds a current educational country scenario from official global probabilities", () => {
  const result = getCountryScenario(country, data, "en");
  assert.equal(result.phase, "elNino");
  assert.equal(result.probability, 80);
  assert.ok(result.signal > 0);
  assert.match(result.disclaimer, /not a local weather forecast/i);
});

test("country alert snapshots change with official global inputs", () => {
  const first = countryAlertSnapshot(country, data);
  const second = countryAlertSnapshot(country, { ...data, current: { ...data.current, weeklySst: { regions: { nino34: { anomaly: 1.3 } } } } });
  assert.notEqual(first, second);
});
