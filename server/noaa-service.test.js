import test from "node:test";
import assert from "node:assert/strict";
import { parseDiagnostic, parseProbabilities, parseWeeklySst } from "./noaa-service.js";

test("interpreta a discussão ENSO e entidades HTML", () => {
  const result = parseDiagnostic(`
    <p>11 June 2026</p>
    <p>ENSO Alert System Status: El Ni&ntilde;o Advisory</p>
    <p>Synopsis: El Ni&ntilde;o conditions are present and expected to strengthen.</p>
    <p>The latest weekly Ni&ntilde;o-3.4 index value was +0.7°C, with the westernmost
    (Ni&ntilde;o-4) and easternmost (Ni&ntilde;o-1+2) indices at +0.7°C and +2.1°C, respectively.</p>
    <p>The next ENSO Diagnostics Discussion is scheduled for 9 July 2026.</p>
  `);

  assert.equal(result.alertStatus, "El Niño Advisory");
  assert.equal(result.nino34, 0.7);
  assert.equal(result.nino4, 0.7);
  assert.equal(result.nino12, 2.1);
  assert.equal(result.nextUpdate, "2026-07-09T12:00:00.000Z");
});

test("interpreta a tabela HTML de probabilidades", () => {
  const result = parseProbabilities(`
    <h2>Issued June 2026</h2>
    <table>
      <tr><th>MJJ</th><td>0</td><td>0</td><td>0</td><td>0</td><td>3</td><td>86</td><td>11</td><td>0</td><td>0</td></tr>
    </table>
  `);

  assert.equal(result.seasons[0].season, "MJJ");
  assert.deepEqual(result.seasons[0].probability, {
    laNina: 0,
    neutral: 3,
    elNino: 97,
  });
});

test("interpreta a versão textual da tabela de probabilidades", () => {
  const result = parseProbabilities(`
    Official NOAA CPC ENSO Strength Probabilities
    Issued June 2026
    MJJ May Jun Jul 0 0 0 0 3 86 11 0 0
  `);

  assert.equal(result.seasons[0].probability.elNino, 97);
});

test("usa a linha semanal mais recente dos índices SST", () => {
  const result = parseWeeklySst(`
    Weekly SST data starts week centered on 3Jan1990
    03JAN1990 23.4 -0.4 25.1 -0.3 26.2 -0.1 27.5 0.2
    10JUN2026 25.4 2.1 28.1 1.2 28.2 0.7 29.5 0.7
  `);

  assert.equal(result.date, "2026-06-10T12:00:00.000Z");
  assert.equal(result.regions.nino34.anomaly, 0.7);
  assert.equal(result.regions.nino12.anomaly, 2.1);
});

test("reads official seasonal tooltips and ignores commented publication dates", () => {
  const data = parseProbabilities(`
    <!--<h2>Issued June 2026</h2>--><h2>Issued October 2026</h2>
    <table><tr><th><abbr>FMA <span>Feb Mar Apr</span></abbr></th><td>0</td><td>2</td><td>98</td></tr></table>
  `);
  assert.equal(data.issuedLabel, "October 2026");
  assert.deepEqual(data.seasons[0].probability, { laNina: 0, neutral: 2, elNino: 98 });
});

test("parses weekly NOAA rows with attached negative departures", () => {
  const data = parseWeeklySst("04FEB2026     26.2 0.6     25.9-0.1     26.1-0.4     28.1-0.0");
  assert.equal(data.regions.nino34.anomaly, -0.4);
  assert.equal(data.series.length, 1);
});

test("a watch for a future phase is not classified as an observed phase", async () => {
  const { loadNoaaEnso } = await import("../src/lib/noaaData.js");
  const result = await loadNoaaEnso(async ({ url }) => {
    if (!url.endsWith("ensodisc.shtml")) throw new Error("Source unavailable");
    return "<p>8 October 2026</p><p>ENSO Alert System Status: El Niño Watch</p><p>Synopsis: El Niño conditions are expected to develop later this year.</p>";
  });
  assert.equal(result.current.phase, null);
  assert.equal(result.current.weeklySst, null);
});
