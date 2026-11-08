import { alertsResponse } from "../server/alerts-service.js";
import { applyCorsHeaders } from "../server/api-utils.js";

export default async function handler(request, response) {
  applyCorsHeaders(response);
  response.setHeader("Cache-Control", "no-store");
  if (request.method === "OPTIONS") return response.status(204).end();
  const { status, body } = await alertsResponse(request.method, new URL(request.url, "https://localhost").searchParams);
  return response.status(status).json(body);
}
