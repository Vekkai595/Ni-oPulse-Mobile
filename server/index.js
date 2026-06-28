import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getEnsoData, getHealth } from "./noaa-service.js";
import { getHistoryData, getHistoryHealth } from "./history-service.js";
import { getPublicCountries } from "./country-api.js";
import { getLiveCountries, getLiveCountryHealth } from "./live-country-service.js";

const root = fileURLToPath(new URL("../dist", import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const rateWindows = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
};

function sendJson(response, status, body, cacheControl = "no-store", extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8", "Cache-Control": cacheControl, "Access-Control-Allow-Origin": "*",
    "X-Content-Type-Options": "nosniff", ...extraHeaders,
  });
  response.end(JSON.stringify(body));
}

function applyRateLimit(request, response) {
  const now = Date.now();
  const id = String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "anonymous").split(",")[0].trim();
  const previous = rateWindows.get(id);
  const state = !previous || now >= previous.resetAt ? { count: 0, resetAt: now + 60_000 } : previous;
  state.count += 1;
  rateWindows.set(id, state);
  if (rateWindows.size > 2_000) {
    for (const [key, value] of rateWindows) if (now >= value.resetAt) rateWindows.delete(key);
  }
  const headers = {
    "X-RateLimit-Limit": "60", "X-RateLimit-Remaining": String(Math.max(0, 60 - state.count)),
    "X-RateLimit-Reset": String(Math.ceil(state.resetAt / 1000)),
  };
  if (state.count > 60) {
    sendJson(response, 429, { ok: false, error: "Rate limit exceeded." }, "no-store", { ...headers, "Retry-After": String(Math.ceil((state.resetAt - now) / 1000)) });
    return null;
  }
  return headers;
}

async function handleApi(request, response, url) {
  if (!url.pathname.startsWith("/api/")) return false;
  if (request.method === "OPTIONS") {
    response.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-API-Key" });
    response.end();
    return true;
  }
  if (request.method !== "GET") {
    sendJson(response, 405, { ok: false, error: "Method not allowed. Use GET." }, "no-store", { Allow: "GET" });
    return true;
  }

  if (url.pathname === "/api/health") {
    sendJson(response, 200, { ...getHealth(), history: getHistoryHealth(), liveCountries: getLiveCountryHealth() });
    return true;
  }

  if (url.pathname === "/api/history" || url.pathname === "/api/v1/history") {
    const rateHeaders = url.pathname.startsWith("/api/v1/") ? applyRateLimit(request, response) : {};
    if (rateHeaders === null) return true;
    try {
      const data = await getHistoryData({ force: url.searchParams.get("refresh") === "1" });
      sendJson(response, 200, url.pathname.startsWith("/api/v1/") ? { ...data, api: { version: "v1", tier: "public" } } : data, "public, max-age=0, s-maxage=21600, stale-while-revalidate=604800", rateHeaders);
    } catch (error) {
      sendJson(response, 503, { ok: false, error: "NOAA historical data is temporarily unavailable.", detail: error instanceof Error ? error.message : "Unknown failure" }, "no-store", rateHeaders);
    }
    return true;
  }

  if (url.pathname === "/api/enso" || url.pathname === "/api/v1/enso") {
    const rateHeaders = url.pathname.startsWith("/api/v1/") ? applyRateLimit(request, response) : {};
    if (rateHeaders === null) return true;
    try {
      const data = await getEnsoData({ force: url.searchParams.get("refresh") === "1" });
      sendJson(response, 200, url.pathname.startsWith("/api/v1/") ? { ...data, api: { version: "v1", tier: "public" } } : data, "public, max-age=0, s-maxage=600, stale-while-revalidate=86400", rateHeaders);
    } catch (error) {
      sendJson(response, 503, { ok: false, error: "Official NOAA data is temporarily unavailable.", detail: error instanceof Error ? error.message : "Unknown failure" }, "no-store", rateHeaders);
    }
    return true;
  }

  if (url.pathname === "/api/live-countries" || url.pathname === "/api/v1/live-countries") {
    const rateHeaders = url.pathname.startsWith("/api/v1/") ? applyRateLimit(request, response) : {};
    if (rateHeaders === null) return true;
    try {
      const data = await getLiveCountries({ force: url.searchParams.get("refresh") === "1" });
      sendJson(response, 200, url.pathname.startsWith("/api/v1/") ? { ...data, api: { version: "v1", tier: "public" } } : data, "public, max-age=0, s-maxage=600, stale-while-revalidate=86400", rateHeaders);
    } catch (error) {
      sendJson(response, 503, { ok: false, error: "Live country weather is temporarily unavailable.", detail: error instanceof Error ? error.message : "Unknown failure" }, "no-store", rateHeaders);
    }
    return true;
  }

  if (url.pathname === "/api/v1/countries") {
    const rateHeaders = applyRateLimit(request, response);
    if (rateHeaders === null) return true;
    const result = getPublicCountries(url.searchParams);
    sendJson(response, 200, { ok: true, generatedAt: new Date().toISOString(), count: result.length, countries: result, api: { version: "v1", tier: "public" } }, "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800", rateHeaders);
    return true;
  }

  sendJson(response, 404, { ok: false, error: "API endpoint not found." });
  return true;
}

function safeStaticPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const candidate = resolve(root, `.${decoded || "/index.html"}`);
  const pathFromRoot = relative(root, candidate);
  if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) return null;
  return candidate;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (await handleApi(request, response, url)) return;
  if (!existsSync(root)) { sendJson(response, 500, { ok: false, error: "dist is missing. Run npm run build first." }); return; }

  let filePath = safeStaticPath(url.pathname);
  if (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) filePath = join(root, "index.html");
  const extension = extname(filePath).toLowerCase();
  const noCache = extension === ".html" || filePath.endsWith("sw.js") || extension === ".webmanifest";
  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    "Cache-Control": noCache ? "public, max-age=0, must-revalidate" : "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => console.log(`NiñoPulse available at http://${host}:${port}`));
