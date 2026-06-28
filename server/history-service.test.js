import test from "node:test";
import assert from "node:assert/strict";
import { detectEpisodes, parseClimateIndexTable } from "./history-service.js";

const sample = `
<table>
<tr><th>Year</th><th>DJF</th><th>JFM</th><th>FMA</th><th>MAM</th><th>AMJ</th><th>MJJ</th><th>JJA</th><th>JAS</th><th>ASO</th><th>SON</th><th>OND</th><th>NDJ</th></tr>
<tr><td>1997</td><td>-0.5</td><td>-0.4</td><td>-0.1</td><td>0.3</td><td>0.8</td><td>1.2</td><td>1.6</td><td>1.9</td><td>2.1</td><td>2.3</td><td>2.4</td><td>2.4</td></tr>
<tr><td>1998</td><td>2.2</td><td>1.9</td><td>1.4</td><td>1.0</td><td>0.5</td><td>-0.1</td><td>-0.8</td><td>-1.1</td><td>-1.3</td><td>-1.4</td><td>-1.5</td><td>-1.6</td></tr>
</table>`;

test("parses a complete NOAA-style historical row", () => {
  const parsed = parseClimateIndexTable(sample);
  assert.equal(parsed.points.length, 24);
  assert.equal(parsed.points[4].period, "AMJ 1997");
  assert.equal(parsed.points[4].value, 0.8);
});

test("detects warm and cold episodes with at least five overlapping seasons", () => {
  const parsed = parseClimateIndexTable(sample);
  const episodes = detectEpisodes(parsed.points);
  assert.equal(episodes.length, 2);
  assert.equal(episodes[0].kind, "elNino");
  assert.equal(episodes[0].peak, 2.4);
  assert.equal(episodes[1].kind, "laNina");
});
