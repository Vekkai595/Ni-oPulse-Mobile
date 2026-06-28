import { getPublicCountries } from "../../server/country-api.js";
import { applyPublicApiHeaders, requireGet } from "../../server/api-utils.js";

export default async function handler(request, response) {
  if (!requireGet(request, response)) return;
  const access = await applyPublicApiHeaders(request, response);
  if (access.handled) return;

  const origin = new URL(request.url || "/api/v1/countries", `https://${request.headers.host || "localhost"}`);
  const result = getPublicCountries(origin.searchParams);
  response.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  response.setHeader("Vercel-CDN-Cache-Control", "max-age=86400, stale-while-revalidate=604800");
  return response.status(200).json({
    ok: true,
    generatedAt: new Date().toISOString(),
    count: result.length,
    countries: result,
    api: {
      version: "v1",
      tier: access.tier,
      keyLabel: access.keyLabel || null,
      rateLimitBackend: access.backend,
    },
  });
}
