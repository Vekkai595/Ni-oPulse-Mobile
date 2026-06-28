import { getHealth } from "../server/noaa-service.js";
import { getHistoryHealth } from "../server/history-service.js";
import { applyCorsHeaders } from "../server/api-utils.js";
import { getLiveCountryHealth } from "../server/live-country-service.js";

export default function handler(request, response) {
  applyCorsHeaders(response);
  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.setHeader("Cache-Control", "no-store");
    return response.status(405).json({ ok: false, error: "Method not allowed. Use GET." });
  }

  response.setHeader("Cache-Control", "no-store");
  return response.status(200).json({
    ...getHealth(),
    history: getHistoryHealth(),
    liveCountries: getLiveCountryHealth(),
    runtime: "Vercel Function",
  });
}
