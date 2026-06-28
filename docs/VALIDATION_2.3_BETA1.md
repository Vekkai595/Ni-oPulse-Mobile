# Validation Report — 2.3.0-beta.1

Validation run on 20 June 2026 against the distributable source package.

## Passed

- `npm run lint`
- `npm run typecheck`
- 22/22 automated tests
- Vite production build
- PWA generation: service worker plus 33 precached entries
- Capacitor Android synchronization with six native plugins
- Capacitor Doctor Android project check
- production dependency audit: zero known vulnerabilities

## Build observations

- main initial JavaScript chunk: approximately 150.64 kB (45.45 kB gzip);
- heavy map, history, PDF and image-export code is split into on-demand chunks;
- Android web assets were copied into the native project successfully.

## Intentionally blocked until deployment details exist

`npm run android:config` rejects an empty or placeholder API address. This is expected: an APK cannot run the Vercel serverless routes internally. Set a real HTTPS deployment in `.env.android`, rebuild and resync before producing an APK/AAB.

## Not claimed by this report

Automated checks do not replace physical testing on Samsung, Motorola, Xiaomi/Redmi, entry-level Android devices and tablets. Use `MOBILE_PRODUCTION_QA.md` before promoting this beta to a final school release.
