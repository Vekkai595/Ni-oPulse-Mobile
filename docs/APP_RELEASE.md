# Android and Play release checklist

## 1. Production web/API

Deploy the project to an HTTPS domain and confirm:

```text
/api/health
/api/v1/enso
/api/v1/history
```

## 2. Native API configuration

Copy `.env.android.example` to `.env.android` and set the deployed domain. Never use `localhost` inside the APK.

```env
VITE_API_BASE_URL=https://your-project.vercel.app
```

## 3. Sync and test

```bash
npm ci
npm run check
npm run android:config
npm run build
npm run android:sync
npm run android:open
```

Use Android Studio to test a physical phone and emulator. Check Portuguese/English, light/dark mode, map, offline shell, exports, image sharing and notification permission.

## 4. Debug APK

```bash
npm run android:apk
```

Install `android/app/build/outputs/apk/debug/app-debug.apk` only for testing.

## 5. Upload key and release AAB

Create a private upload keystore using Android Studio's **Generate Signed Bundle / APK** flow or `keytool`. Copy `android/keystore.properties.example` to `android/keystore.properties`, set the local path/passwords and run:

```bash
npm run android:aab
```

The release bundle is written to `android/app/build/outputs/bundle/release/app-release.aab`. Back up the keystore and credentials securely; do not send them in chat or commit them.

## 6. Store listing

Prepare app icon, feature graphic, phone screenshots, short/full descriptions, support contact, hosted privacy policy, content rating and Data safety form. Use the Play Console testing track required for the account before requesting production access.

## 7. Version updates

For every Play update, increase both `versionCode` and `versionName` in `android/app/build.gradle`, rebuild, test and sign with the same upload key.


### Windows shortcut

`npm run android:prepare:windows` runs configuration, web build and Capacitor sync in sequence. It intentionally stops if `.env.android` is missing or still contains the placeholder domain.
