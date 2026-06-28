# Validation record

Validated for version 2.1.0:

- clean `npm ci` from the portable npm registry lockfile;
- ESLint;
- JavaScript type checking;
- 19 automated tests;
- production Vite build;
- PWA manifest/service-worker generation;
- Capacitor Android project creation and plugin sync;
- local Node server routes for the app shell, health and historical fallback;
- Vercel v1 route behavior, CORS and rate-limit metadata;
- production dependency audit with zero reported vulnerabilities.

The final signed AAB is intentionally not generated in this repository because signing requires the developer's private upload keystore. Android Gradle compilation also requires Android Studio/SDK and network access to download Gradle dependencies.
