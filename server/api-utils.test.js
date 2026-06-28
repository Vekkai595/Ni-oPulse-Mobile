import test from "node:test";
import assert from "node:assert/strict";
import { identifyApiTier, parseApiKeys } from "./api-utils.js";

test("parses multiple manually issued API keys", () => {
  const env = { NINOPULSE_API_KEYS: JSON.stringify({ school: { key: "abc", limit: 120 }, lab: "xyz" }) };
  const keys = parseApiKeys(env);
  assert.equal(keys.length, 2);
  assert.deepEqual(identifyApiTier("abc", env), { tier: "key", limit: 120, keyLabel: "school", invalid: false });
  assert.equal(identifyApiTier("wrong", env).invalid, true);
});

test("keeps anonymous access on the public tier", () => {
  assert.deepEqual(identifyApiTier(undefined, {}), { tier: "public", limit: 60, keyLabel: null, invalid: false });
});
