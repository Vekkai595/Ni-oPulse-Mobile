import { getEnsoData } from "../../server/noaa-service.js";
import { applyPublicApiHeaders, requireGet } from "../../server/api-utils.js";

export default async function handler(request, response) {
  if (!requireGet(request, response)) return;
  const access = await applyPublicApiHeaders(request, response);
  if (access.handled) return;

  try {
    const force = access.tier === "key" && request.query?.refresh === "1";
    const data = await getEnsoData({ force });
    response.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    response.setHeader("Vercel-CDN-Cache-Control", "max-age=600, stale-while-revalidate=86400, stale-if-error=86400");
    return response.status(200).json({
      ...data,
      api: {
        version: "v1",
        tier: access.tier,
        keyLabel: access.keyLabel || null,
        rateLimitBackend: access.backend,
      },
    });
  } catch (error) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(503).json({
      ok: false,
      error: "Official NOAA data is temporarily unavailable.",
      detail: error instanceof Error ? error.message : "Unknown failure",
    });
  }
}
