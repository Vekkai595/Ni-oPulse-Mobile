import test from "node:test";
import assert from "node:assert/strict";
import countriesHandler from "../api/v1/countries.js";
import healthHandler from "../api/health.js";
import { resetMemoryRateLimitsForTests } from "./api-utils.js";

function createResponse() {
  return {
    headers: new Map(),
    statusCode: 200,
    body: undefined,
    ended: false,
    setHeader(name, value) { this.headers.set(String(name).toLowerCase(), String(value)); },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; this.ended = true; return this; },
    end() { this.ended = true; return this; },
  };
}

test("Vercel v1 countries route applies CORS and rate-limit metadata", async () => {
  resetMemoryRateLimitsForTests();
  const request = {
    method: "GET",
    url: "/api/v1/countries?risk=alto",
    headers: { host: "ninopulse.test", "x-forwarded-for": "198.51.100.10" },
    socket: { remoteAddress: "198.51.100.10" },
  };
  const response = createResponse();
  await countriesHandler(request, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(response.headers.get("x-ratelimit-limit"), "60");
  assert.equal(response.body.api.version, "v1");
  assert.equal(response.body.count, response.body.countries.length);
  assert.ok(response.body.countries.every((country) => country.riskLevel === "alto"));
});

test("legacy health route accepts native-app preflight requests", () => {
  const response = createResponse();
  healthHandler({ method: "OPTIONS", headers: {} }, response);
  assert.equal(response.statusCode, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(response.ended, true);
});
