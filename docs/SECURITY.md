# Security notes

## Browser and device data

Favorites, language, theme and alert choices are stored locally. The project has no account database and does not intentionally collect names, email addresses, precise location or passwords.

## API

- Endpoints are read-only.
- CORS is intentionally public for research use.
- Optional API keys are compared with timing-safe equality.
- `NINOPULSE_API_KEYS` supports operator-managed named keys and per-key limits.
- Upstash Redis can provide distributed rate limiting. Without it, the in-memory limiter resets with the serverless instance and is only a basic abuse control.
- NOAA requests use timeouts and validate parsed output before replacing last-valid data.

## Android

- Cleartext HTTP traffic is disabled; use an HTTPS API base URL.
- Android backups are disabled for device-local preferences.
- Upload keystores and passwords must remain outside Git.
- The app requests only capabilities needed by its Capacitor plugins. Remote push/Firebase is not configured.

## Reporting

Do not publish real API keys, `.env.android`, `android/keystore.properties`, `.jks` files or Play Console credentials.
