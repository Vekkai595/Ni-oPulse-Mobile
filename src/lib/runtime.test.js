import test from "node:test";
import assert from "node:assert/strict";
import { normalizeBaseUrl, resolveApiBaseUrl, resolveApiUrl } from "./runtime.js";

test("normalizes configured API base URLs", () => {
  assert.equal(normalizeBaseUrl(" https://example.com/// "), "https://example.com");
  assert.equal(resolveApiUrl("api/enso", { env: { VITE_API_BASE_URL: "https://example.com/" }, native: true }), "https://example.com/api/enso");
});

test("uses the current web origin when no API base is configured", () => {
  assert.equal(resolveApiBaseUrl({ env: {}, native: false, origin: "https://site.test" }), "https://site.test");
  assert.equal(resolveApiUrl("/api/enso", { env: {}, native: false, origin: "https://site.test" }), "https://site.test/api/enso");
});

test("requires an explicit API URL in a native build", () => {
  assert.throws(() => resolveApiUrl("/api/enso", { env: {}, native: true }), /VITE_API_BASE_URL/);
});
