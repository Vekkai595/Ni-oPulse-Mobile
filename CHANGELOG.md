# Changelog

## 2.3.0-beta.1 — School-ready mobile hardening

- Reworked the runtime for Android WebView with dynamic viewport variables, keyboard-aware layout and safe-area handling.
- Added native Android back behavior for menus, settings, country sheets, full-screen map, route history and app exit.
- Added branded manual splash completion and refresh-on-resume behavior.
- Added connection-lost/restored messaging, a recoverable error boundary and PWA update/offline-ready prompts.
- Deferred heavy dashboard modules and dynamically loaded image export code, reducing the initial production JavaScript bundle substantially.
- Added progressive country-card rendering, larger touch targets, scroll-snap filter rails and narrow-screen/landscape refinements.
- Hardened the Leaflet map with interaction locking, loading/fallback states, responsive bounds and WebView resize recovery.
- Converted research tables to mobile cards and improved country-sheet actions and forecast scrolling.
- Enabled Android multi-window/resizable activity, modern system-back integration and `adjustResize` keyboard behavior.
- Added App, Keyboard and Splash Screen Capacitor integrations.
- Updated the web package and Android build to `2.3.0-beta.1` (`versionCode 5`).
- Added a release QA checklist and deployment handoff documentation.

## 2.3.0-alpha.1 — Mobile preview

- Added a native-style mobile bottom navigation with Home, Map, Research and Settings.
- Added a touch-friendly settings bottom sheet for language, theme and PWA installation.
- Added full-screen map mode with safe-area support and an offline status notice.
- Added Leaflet resize recovery for orientation changes, WebView resizes, visibility changes and dynamic viewport changes.
- Added automatic OpenStreetMap fallback when the primary CARTO tile provider fails.
- Converted the country detail drawer into a mobile bottom sheet while preserving the desktop side panel.
- Added dynamic viewport units, notch/Dynamic Island safe areas and mobile content spacing.
- Improved PWA tile caching and immutable Vercel caching for production assets.
- Updated the web package to `2.3.0-alpha.1` and Android to `versionCode 4`.

## 2.2.0

- Added live current conditions and seven-day forecasts for all 30 countries using one cached Open-Meteo batch request.
- Added a last-valid server fallback and a browser snapshot fallback for temporary provider outages.
- Reworked country cards to show temperature, condition, humidity, precipitation, wind and daily high/low.
- Added a detailed live-weather section and seven-day forecast to every country panel.
- Kept live weather clearly separated from historical ENSO impact context and documented the representative-location limitation.
- Added `/api/live-countries` and `/api/v1/live-countries`, source attribution, health information and automated tests.
- Updated Android version to 2.2.0 (`versionCode 3`).

## 2.1.0

- Added official NOAA RONI/ONI historical retrieval, full-series charting and automatic episode detection.
- Replaced overclaimed “AI confidence” wording with a transparent experimental Signal Index.
- Added dynamic educational country scenarios and functional selected-country foreground alerts.
- Added real dashboard-image sharing for web and Android.
- Replaced the manual service worker with Vite PWA/Workbox precaching and successful-response-only API caching.
- Added configurable Android API base URL and clear native configuration errors.
- Added Capacitor Android project, native sharing/filesystem/local notifications, branded launch assets and release scripts.
- Added real Vercel `/api/v1/*` routes, native-app CORS, named API keys and optional Upstash distributed rate limiting.
- Expanded tests from 6 to 19 and made the test script Windows-compatible.
- Improved accessibility with a skip link, focus trap and focus restoration.
- Expanded About the Dev into a project case study and completed missing translations.
- Added privacy, security, cloud-feature and Android release documentation.
- Fixed registry portability in the distributable lockfile.

## 2.0.0

- Initial bilingual mobile-first dashboard, current NOAA data, PWA foundation, exports, favorites, research mode and read-only API.
