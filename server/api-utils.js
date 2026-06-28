import { timingSafeEqual } from "node:crypto";

const windows = new Map();
const WINDOW_MS = 60_000;
const PUBLIC_LIMIT = 60;
const DEFAULT_KEY_LIMIT = 600;
let distributedClients = null;

function clientId(request) {
  const forwarded = request.headers?.["x-forwarded-for"];
  if (Array.isArray(forwarded)) return forwarded[0];
  return String(forwarded || request.socket?.remoteAddress || "anonymous").split(",")[0].trim();
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function parseApiKeys(env = process.env) {
  const keys = [];
  if (env.NINOPULSE_API_KEYS) {
    try {
      const parsed = JSON.parse(env.NINOPULSE_API_KEYS);
      for (const [label, config] of Object.entries(parsed)) {
        const key = typeof config === "string" ? config : config?.key;
        const limit = Number(typeof config === "object" ? config?.limit : DEFAULT_KEY_LIMIT);
        if (key) keys.push({ label, key: String(key), limit: Number.isFinite(limit) ? limit : DEFAULT_KEY_LIMIT });
      }
    } catch {
      // Invalid optional configuration is ignored instead of breaking the public API.
    }
  }
  if (env.NINOPULSE_API_KEY) keys.push({ label: "legacy", key: String(env.NINOPULSE_API_KEY), limit: DEFAULT_KEY_LIMIT });
  return keys;
}

export function identifyApiTier(suppliedKey, env = process.env) {
  if (!suppliedKey) return { tier: "public", limit: PUBLIC_LIMIT, keyLabel: null, invalid: false };
  const match = parseApiKeys(env).find((entry) => safeEqual(entry.key, suppliedKey));
  if (!match) return { tier: "invalid", limit: 0, keyLabel: null, invalid: true };
  return { tier: "key", limit: match.limit, keyLabel: match.label, invalid: false };
}

export function applyCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
  response.setHeader("Access-Control-Expose-Headers", "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-RateLimit-Backend, Retry-After");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
}

async function getDistributedClients() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (distributedClients) return distributedClients;
  try {
    const [{ Redis }, { Ratelimit }] = await Promise.all([import("@upstash/redis"), import("@upstash/ratelimit")]);
    const redis = Redis.fromEnv();
    distributedClients = { Redis, Ratelimit, redis, limiters: new Map() };
    return distributedClients;
  } catch {
    return null;
  }
}

async function distributedLimit(id, limit) {
  const clients = await getDistributedClients();
  if (!clients) return null;
  let limiter = clients.limiters.get(limit);
  if (!limiter) {
    limiter = new clients.Ratelimit({
      redis: clients.redis,
      limiter: clients.Ratelimit.slidingWindow(limit, "60 s"),
      analytics: false,
      prefix: "ninopulse:ratelimit",
    });
    clients.limiters.set(limit, limiter);
  }
  const result = await limiter.limit(id);
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
    backend: "distributed",
  };
}

function memoryLimit(id, limit, now = Date.now()) {
  const existing = windows.get(id);
  const state = !existing || now >= existing.resetAt ? { count: 0, resetAt: now + WINDOW_MS } : existing;
  state.count += 1;
  windows.set(id, state);
  if (windows.size > 2_000) {
    for (const [key, value] of windows) if (now >= value.resetAt) windows.delete(key);
  }
  return {
    allowed: state.count <= limit,
    remaining: Math.max(0, limit - state.count),
    resetAt: state.resetAt,
    backend: "memory",
  };
}

export async function applyPublicApiHeaders(request, response) {
  applyCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return { allowed: false, handled: true, tier: "public", backend: "none" };
  }

  const suppliedKey = request.headers?.["x-api-key"];
  const tier = identifyApiTier(suppliedKey);
  if (tier.invalid) {
    response.status(401).json({ ok: false, error: "Invalid API key." });
    return { allowed: false, handled: true, tier: "invalid", backend: "none" };
  }

  const id = `${clientId(request)}:${tier.keyLabel || "public"}`;
  let result;
  try {
    result = await distributedLimit(id, tier.limit);
  } catch {
    result = null;
  }
  if (!result) result = memoryLimit(id, tier.limit);

  response.setHeader("X-RateLimit-Limit", String(tier.limit));
  response.setHeader("X-RateLimit-Remaining", String(result.remaining));
  response.setHeader("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  response.setHeader("X-RateLimit-Backend", result.backend);

  if (!result.allowed) {
    response.setHeader("Retry-After", String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))));
    response.status(429).json({ ok: false, error: "Rate limit exceeded." });
    return { allowed: false, handled: true, tier: tier.tier, backend: result.backend };
  }

  return { allowed: true, handled: false, tier: tier.tier, keyLabel: tier.keyLabel, backend: result.backend };
}

export function requireGet(request, response) {
  if (request.method === "GET" || request.method === "OPTIONS") return true;
  applyCorsHeaders(response);
  response.setHeader("Allow", "GET");
  response.status(405).json({ ok: false, error: "Method not allowed. Use GET." });
  return false;
}

export function resetMemoryRateLimitsForTests() {
  windows.clear();
}
