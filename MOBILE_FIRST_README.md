# NiñoPulse Global — Mobile First 2.4

Esta pasta é uma versão separada para Android/Google Play, com layout focado em celular.

## O que foi mantido

- `appId` / pacote Android: `com.vekkai.ninopulse`
- Nome do app: `NiñoPulse Global`
- Capacitor + Android Studio
- Dados ENSO, mapa Leaflet, cartões de países e páginas de pesquisa/sobre/API

## O que mudou

- Home refeita em estilo mobile-first
- Dashboard desktop pesado removido da tela inicial
- Mapa virou seção principal com espaço próprio
- Cards e filtros foram simplificados para toque
- `versionCode` subiu de `5` para `6`
- `versionName` agora é `2.4.0-mobile.1`

## Como gerar o AAB

```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

No Android Studio:

```text
Build → Generate Signed Bundle / APK → Android App Bundle → release
```

Suba no Play Console o arquivo final:

```text
android/app/release/app-release.aab
```

ou, dependendo do Android Studio:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## Importante

Use a mesma chave `.jks` que você criou para o app atual. Não mude o pacote `com.vekkai.ninopulse`, senão o Play Console entende como outro app.
