import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { getEnsoData, getHealth } from "./server/noaa-service.js";
import { getHistoryData, getHistoryHealth } from "./server/history-service.js";
import { getPublicCountries } from "./server/country-api.js";
import { getLiveCountries, getLiveCountryHealth } from "./server/live-country-service.js";

function sendJson(response, status, body, cacheControl = "no-store") {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", cacheControl);
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(JSON.stringify(body));
}

function noaaApiPlugin() {
  return {
    name: "ninopulse-local-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url || "/", "http://localhost");

        if (url.pathname === "/api/health") {
          sendJson(response, 200, { ...getHealth(), history: getHistoryHealth(), liveCountries: getLiveCountryHealth() });
          return;
        }

        if (url.pathname === "/api/history" || url.pathname === "/api/v1/history") {
          try {
            const data = await getHistoryData({ force: url.searchParams.get("refresh") === "1" });
            sendJson(response, 200, url.pathname.startsWith("/api/v1/") ? { ...data, api: { version: "v1", tier: "development" } } : data);
          } catch (error) {
            sendJson(response, 503, { ok: false, error: "NOAA historical data is temporarily unavailable.", detail: error instanceof Error ? error.message : "Unknown failure" });
          }
          return;
        }

        if (url.pathname === "/api/live-countries" || url.pathname === "/api/v1/live-countries") {
          try {
            const data = await getLiveCountries({ force: url.searchParams.get("refresh") === "1" });
            sendJson(response, 200, url.pathname.startsWith("/api/v1/") ? { ...data, api: { version: "v1", tier: "development" } } : data);
          } catch (error) {
            sendJson(response, 503, { ok: false, error: "Live country weather is temporarily unavailable.", detail: error instanceof Error ? error.message : "Unknown failure" });
          }
          return;
        }

        if (url.pathname === "/api/v1/countries") {
          const result = getPublicCountries(url.searchParams);
          sendJson(response, 200, { ok: true, generatedAt: new Date().toISOString(), count: result.length, countries: result, api: { version: "v1", tier: "development" } });
          return;
        }

        if (!["/api/enso", "/api/v1/enso"].includes(url.pathname)) {
          next();
          return;
        }

        try {
          const data = await getEnsoData({ force: url.searchParams.get("refresh") === "1" });
          sendJson(response, 200, url.pathname === "/api/v1/enso" ? { ...data, api: { version: "v1", tier: "development" } } : data);
        } catch (error) {
          sendJson(response, 503, { ok: false, error: "Official NOAA data is temporarily unavailable.", detail: error instanceof Error ? error.message : "Unknown failure" });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    noaaApiPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        id: "/",
        name: "NiñoPulse Global",
        short_name: "NiñoPulse",
        description: "Global ENSO dashboard with official NOAA/CPC data and transparent educational impact profiles.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
        orientation: "any",
        background_color: "#08121f",
        theme_color: "#0ab6c8",
        lang: "pt-BR",
        categories: ["education", "weather", "science"],
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
        shortcuts: [
          { name: "Research Mode", short_name: "Research", url: "/research" },
          { name: "About the Data", short_name: "About", url: "/about" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "ninopulse-api-v4",
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/([a-z]+\.)?basemaps\.cartocdn\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "ninopulse-map-tiles-v2",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 180, maxAgeSeconds: 14 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/([a-z]+\.)?tile\.openstreetmap\.org\//,
            handler: "CacheFirst",
            options: {
              cacheName: "ninopulse-map-fallback-v1",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 120, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { "@": path.resolve(process.cwd(), "./src") } },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
