import { ANDROID_API_BASE_URL } from "../generated/androidConfig.js";
import { Capacitor } from "@capacitor/core";

export function normalizeBaseUrl(value = "") {
  return String(value || "").trim().replace(/\/+$/, "");
}

export function isNativeRuntime() {
  return Capacitor.isNativePlatform();
}

/**
 * @param {{env?: Record<string, string | undefined>, native?: boolean, origin?: string}} [options]
 */
export function resolveApiBaseUrl(options = {}) {
  const { env, native, origin } = options;
  const runtimeEnv = env || /** @type {Record<string, string | undefined>} */ (import.meta.env || {});
  const nativeRuntime = native ?? isNativeRuntime();
  const configured = normalizeBaseUrl(runtimeEnv.VITE_API_BASE_URL || (nativeRuntime ? ANDROID_API_BASE_URL : ""));
  if (configured) return configured;

  if (nativeRuntime) return "";

  const currentOrigin = origin ?? globalThis.location?.origin;
  return normalizeBaseUrl(currentOrigin || "");
}

/**
 * @param {string} path
 * @param {{env?: Record<string, string | undefined>, native?: boolean, origin?: string}} [options]
 */
export function resolveApiUrl(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = resolveApiBaseUrl(options);
  const nativeRuntime = options.native ?? isNativeRuntime();

  if (nativeRuntime && !base) {
    throw new Error(
      "VITE_API_BASE_URL is required for the Android build. Copy .env.android.example to .env.android and set the deployed HTTPS domain.",
    );
  }

  return `${base}${normalizedPath}`;
}
