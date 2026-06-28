import { getEnsoData } from "../server/noaa-service.js";
import { applyCorsHeaders } from "../server/api-utils.js";

const CDN_CACHE_SECONDS = 10 * 60;
const STALE_SECONDS = 24 * 60 * 60;

function handleMethod(request, response) {
  applyCorsHeaders(response);
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return false;
  }
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.setHeader("Cache-Control", "no-store");
    response.status(405).json({ ok: false, error: "Method not allowed. Use GET." });
    return false;
  }
  return true;
}

export default async function handler(request, response) {
  if (!handleMethod(request, response)) return;

  try {
    const data = await getEnsoData({ force: request.query?.refresh === "1" });
    response.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    response.setHeader(
      "Vercel-CDN-Cache-Control",
      `max-age=${CDN_CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}, stale-if-error=${STALE_SECONDS}`,
    );
    return response.status(200).json(data);
  } catch (error) {
    response.setHeader("Cache-Control", "no-store");
    return response.status(503).json({
      ok: false,
      error: "Official NOAA data is temporarily unavailable.",
      detail: error instanceof Error ? error.message : "Unknown failure",
    });
  }
}
