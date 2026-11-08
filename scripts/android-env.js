import { existsSync, readFileSync } from "node:fs";

export function readEnvFile(path = ".env.android") {
  if (!existsSync(path)) return {};
  const values = {};
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    values[key] = value;
  }
  return values;
}

export function resolveAndroidApiBase(env = process.env) {
  const value = String(env.VITE_API_BASE_URL || readEnvFile().VITE_API_BASE_URL || "").trim();
  return value ? assertAndroidApiBase(value) : "";
}

export function assertAndroidApiBase(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
      url.pathname !== "/" || /your-|example\.invalid/i.test(url.hostname)) {
    throw new Error("VITE_API_BASE_URL must be a real HTTPS origin or empty.");
  }
  return url.origin;
}
