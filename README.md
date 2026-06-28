# NiñoPulse Global 2.3 Beta 1

NiñoPulse Global is a bilingual, mobile-first ENSO research dashboard built with React, Vite, Node/Vercel and Capacitor. It combines official NOAA/CPC monitoring with clearly labeled educational country scenarios, historical RONI/ONI data, exports, a read-only API and an Android project.

## What is working

- Portuguese and English interface with persistent language preference.
- System/light/dark theme, native-style bottom navigation, accessible country bottom sheet and hardened mobile-first layouts from 320 px through tablets.
- Official current ENSO phase, weekly Niño indices and seasonal probabilities.
- Current weather and seven-day forecasts for one representative location in each of 30 countries, retrieved in a single cached Open-Meteo batch.
- Official NOAA historical RONI/ONI series with automatically detected warm/cold episodes.
- Live-data, last-updated, source-health, retry, server cache, CDN cache and last-valid browser fallback states.
- Installable PWA with generated Workbox precache, update/offline-ready prompts and successful-response-only API caching.
- Local foreground alerts for ENSO and selected-country scenario changes.
- Favorites and preferences stored on the device; no account or personal-data collection.
- CSV, JSON and PDF exports plus actual dashboard-image sharing.
- Transparent experimental **Signal Index**, explicitly not a validated forecast or AI model.
- Read-only API with optional named keys and optional Upstash distributed rate limiting.
- Capacitor Android project with adaptive launcher assets, branded splash, keyboard/viewport handling, native back navigation, app-resume refresh and native share/filesystem/local-notification plugins.
- Automated tests, lint/type checks, production build validation, GitHub Actions quality CI, optional Android artifact workflow and optional Vercel deployment workflow.

## Scientific boundary

Current ENSO observations and probabilities come from NOAA/CPC. Current weather for the 30 countries comes from Open-Meteo and represents one monitoring location per country, not a national average or official warning. Country impact content remains educational historical context and adapts only to the current **global** ENSO phase. The Signal Index is a transparent heuristic for exploration, not an official forecast or confidence probability.

## Local web development

Requires Node.js 20+.

```bash
npm ci
npm run dev
```

Full validation:

```bash
npm run check
```

Production preview:

```bash
npm run build
npm start
```

## Deploy the API/web app first

Import the repository into Vercel. Keep `api/`, `server/`, `src/`, `public/` and `vercel.json` at the repository root.

```text
Framework: Vite
Build command: npm run build
Output directory: dist
Node.js: 20+
```

No NOAA credential is required. See `.env.example` for optional cache, API-key and distributed-rate-limit settings.

## Build Android

The native app must call an HTTPS deployment because serverless routes do not run inside the APK.

1. Copy `.env.android.example` to `.env.android`.
2. Set `VITE_API_BASE_URL=https://your-project.vercel.app`.
3. Install Android Studio with Android SDK 35 and a compatible JDK.
4. On Windows, prepare the native project with:

```bat
npm run android:prepare:windows
npm run android:open
```

The helper runs these three steps in order: `android:config`, `build`, and `android:sync`. On macOS/Linux, run those three commands separately before `android:open`.

Debug APK:

```bash
npm run android:apk
```

Output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

For a signed Play Store AAB, create an upload keystore, copy `android/keystore.properties.example` to `android/keystore.properties`, fill it locally, then run:

```bash
npm run android:aab
```

Output:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Never commit the keystore or `keystore.properties`.

## Public API

```text
GET /api/v1/enso
GET /api/v1/history
GET /api/v1/countries
GET /api/v1/live-countries
GET /api/v1/countries?risk=alto
GET /api/v1/countries?threat=seca
GET /api/v1/countries?q=brasil
GET /api/health
```

The deployed v1 routes include CORS for the Android app. Anonymous access is limited to 60 requests per 60 seconds per client. Named keys can receive configured limits. Without Upstash, rate limiting is process-local and should be treated as basic protection only.

## Project structure

```text
android/                 Capacitor Android project
api/                     Vercel serverless functions
server/                  NOAA parsers, cache, API helpers and local server
src/contexts/            language and local preferences
src/hooks/               live ENSO, country-weather and history queries plus PWA install logic
src/services/            export, share and notification integrations
src/components/elnino/   dashboard modules
src/pages/               home, research, about and API docs
public/icons/             PWA source icons
docs/                    methodology, privacy, security and release guides
.github/workflows/        quality, Android and optional deployment workflows
```

## Deliberately not faked

- There is no password login or cloud synchronization. Device-only preferences are functional and private.
- Alerts are local and checked while the app is active. Remote background push requires a push service, subscription database and privacy controls.
- API keys are configured by the operator; there is no user-facing automatic issuance portal.
- Country scenarios are not national forecasts.
