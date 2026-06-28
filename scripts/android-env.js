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
  const fileValues = readEnvFile();
  return String(env.VITE_API_BASE_URL || fileValues.VITE_API_BASE_URL || "").replace(/\/+$/, "");
}

export function assertAndroidApiBase(apiBase) {
  const invalid = !/^https:\/\//i.test(apiBase) || /your-project|example\.invalid/i.test(apiBase);
  if (invalid) {
    throw new Error([
      "Android build stopped: VITE_API_BASE_URL must be a real HTTPS deployment.",
      "Copy .env.android.example to .env.android and replace the placeholder with your Vercel domain.",
      "Example: VITE_API_BASE_URL=https://ninopulse-global.vercel.app",
    ].join("\n"));
  }
  return apiBase;
}
