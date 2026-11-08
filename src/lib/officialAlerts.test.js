import test from "node:test";
import assert from "node:assert/strict";
import { alertRequest, capAlertsAt, normalizeNws, parseIdap } from "./officialAlerts.js";

const now = "2026-11-07T15:00:00Z";
const geometry = "<polygon>-24,-44 -24,-42 -22,-42 -22,-44 -24,-44</polygon>";
const entry = (id, message = "<msgType>Alert</msgType>", status = "Actual", end = "2026-11-07T20:00:00Z", area = geometry) =>
  `<entry><content><alert><identifier>${id}</identifier><sender>SEDEC</sender><status>${status}</status><scope>Public</scope><sent>2026-11-07T13:00:00Z</sent>${message}<info><category>Met</category><event>Chuva</event><expires>${end}</expires><area>${area}</area></info></alert></content></entry>`;

test("matches active geographic notices and suppresses canceled, expired and test notices", () => {
  const feed = `<feed><updated>${now}</updated>${entry("active")}${entry("canceled")}
    ${entry("cancel", "<msgType>Cancel</msgType><references>SEDEC,canceled,2026-11-07T13:00:00Z</references>")}
    ${entry("test", undefined, "Test")}${entry("expired", undefined, "Actual", "2026-11-07T14:00:00Z")}
    ${entry("missing", undefined, "Actual", undefined, "<areaDesc>Unknown</areaDesc>")}</feed>`;
  const parsed = parseIdap(feed, now);
  const inside = capAlertsAt(parsed, { latitude: -23, longitude: -43 }, now);
  assert.deepEqual(inside.alerts.map(({ id }) => id), ["SEDEC,active"]);
  assert.equal(inside.incomplete, true);
  assert.equal(capAlertsAt(parsed, { latitude: 0, longitude: 0 }, now).alerts.length, 0);
  assert.throws(() => parseIdap(feed.slice(0, -7), now));
});

test("distinguishes failed source responses from an empty official NWS result", () => {
  assert.equal(alertRequest(new URLSearchParams("country=BR&lat=&lon=0")), null);
  assert.equal(alertRequest(new URLSearchParams("country=BR&lat=91&lon=0")), null);
  assert.throws(() => normalizeNws({ error: "Provider unavailable" }, now));
  assert.deepEqual(normalizeNws({ type: "FeatureCollection", features: [] }, now).alerts, []);
});
