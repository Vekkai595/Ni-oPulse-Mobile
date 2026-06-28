import test from "node:test";
import assert from "node:assert/strict";
import { getPublicCountries } from "./country-api.js";

test("filters public country profiles without exposing internal-only fields", () => {
  const result = getPublicCountries(new URLSearchParams("risk=alto&threat=seca"));
  assert.ok(result.length > 0);
  assert.ok(result.every((country) => country.riskLevel === "alto"));
  assert.ok(result.every((country) => country.threats.includes("seca")));
  assert.ok(result.every((country) => !Object.hasOwn(country, "nome")));
  assert.match(result[0].disclaimer, /not a real-time local warning/i);
});

test("supports a case-insensitive country search", () => {
  const result = getPublicCountries(new URLSearchParams("q=brasil"));
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "BR");
});
