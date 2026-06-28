# NiñoPulse Mobile v2.4.2 ScrollMap

Correções desta versão:

- Restaura a rolagem vertical da página no Android WebView.
- Mantém o scroll horizontal bloqueado para evitar tela estourada.
- Remove a camada invisível que cobria o mapa e impedia tocar nos pontos.
- Aumenta os pontos do mapa no celular para facilitar o clique.
- Adiciona botão pequeno "Explorar/Rolagem" no mapa:
  - Rolagem: página rola normalmente e os pontos continuam clicáveis.
  - Explorar: ativa movimento e zoom do mapa.

Versão Android:

- package: com.vekkai.ninopulse
- versionCode: 8
- versionName: 2.4.2-scrollmap

Build:

```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

Depois gere o AAB no Android Studio usando a mesma chave .jks.
