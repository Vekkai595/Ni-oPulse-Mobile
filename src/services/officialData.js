import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { getJson } from "@/lib/weather";
import { resolveApiBaseUrl, resolveApiUrl } from "@/lib/runtime";

/** @param {string} url @param {import("@capacitor/core").HttpResponseType} [responseType] @param {Record<string, string>} [headers] @param {number} [readTimeout] */
export async function nativeSource(url, responseType = "text", headers = {}, readTimeout = 20_000) {
  const response = await CapacitorHttp.get({ url, responseType, headers, connectTimeout: 10_000, readTimeout });
  if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
  if (responseType === "text" && typeof response.data !== "string") throw new Error("Expected text");
  return response.data;
}

export async function climateSource(path, direct, signal, timeoutMs = 18_000) {
  if (Capacitor.isNativePlatform()) {
    if (!resolveApiBaseUrl()) return direct();
    try {
      const data = await getJson(resolveApiUrl(path), signal, timeoutMs);
      if (data.ok === false || data.stale) return direct();
      return data;
    } catch (error) {
      if (signal?.aborted) throw error;
      return direct();
    }
  }
  return getJson(resolveApiUrl(path), signal, timeoutMs);
}
