# NiñoPulse Global — Mobile Map Fix v2.4.1

Esta versão foi feita para corrigir o problema visto no Android: conteúdo escapando para o lado e mapa/controles estourando no celular.

## Como confirmar que você instalou a versão certa

Na tela inicial deve aparecer: **Mobile map fix v2.4.1**.

Se aparecer a frase antiga **“Ciência climática clara, visual e atualizada”**, você gerou o AAB pela pasta antiga.

## Dados importantes para Google Play

- Package: `com.vekkai.ninopulse`
- Version code: `7`
- Version name: `2.4.1-mapfix`

## Gerar AAB

```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

No Android Studio, gere o AAB usando a mesma chave `ninopulse-upload-key.jks`.

## No Play Console

Crie uma nova versão no Teste interno e suba o novo `app-release.aab`.

Notas de versão sugeridas:

```text
Correção mobile do NiñoPulse Global.

Esta versão ajusta o mapa, os controles, a largura da tela e a navegação para evitar estouro horizontal no Android.
```
