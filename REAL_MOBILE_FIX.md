# NiñoPulse Global — Real Mobile Fix v2.5.0

Versão focada em corrigir de verdade a experiência Android/WebView.

## O que mudou

- A rolagem vertical agora acontece em um container próprio do app (`#app-scroll-root`).
- O `body` do WebView não é mais o responsável pela rolagem, evitando travamento no Android.
- A aba de mapas no celular agora usa um mapa leve com bolinhas clicáveis, sem Leaflet prendendo o toque.
- O Leaflet continua disponível no botão **Abrir mapa completo**.
- O pacote continua igual: `com.vekkai.ninopulse`.
- Versão para Play Console: `9 (2.5.0-real-mobile)`.

## Como gerar o AAB

```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

No Android Studio:

```text
Generate Signed Bundle / APK → Android App Bundle → release
```

Use a mesma chave `.jks` da Play Console.

## Conferência no Play Console

Depois de subir o AAB, confirme que aparece:

```text
9 (2.5.0-real-mobile)
```
