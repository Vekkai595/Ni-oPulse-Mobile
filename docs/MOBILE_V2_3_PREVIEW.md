# NiñoPulse Global 2.3.0-beta.1

Esta versão substitui a prévia `2.3.0-alpha.1` e transforma a base mobile em uma beta pronta para testes reais na escola. Ela não deve ser chamada de “compatível com absolutamente todo Android” antes da matriz física de aparelhos ser concluída, mas o código já foi endurecido para celulares pequenos, tablets, rotação, teclado, notch, barras do sistema, internet instável e Android WebView.

## Principais melhorias

- navegação inferior e painéis com alvos de toque maiores;
- suporte a telas de 320 px, tablets, retrato e paisagem;
- viewport dinâmico, safe areas e layout adaptado ao teclado;
- botão Voltar nativo para fechar mapa, menus e painéis antes de sair;
- mapa com bloqueio de interação acidental, redimensionamento e fallback de tiles;
- carregamento progressivo dos países e módulos pesados sob demanda;
- aviso de conexão perdida/restabelecida e recuperação de erros;
- atualização PWA e confirmação de conteúdo essencial offline;
- tabelas de pesquisa convertidas em cartões no celular;
- retomada do aplicativo com atualização dos dados ativos;
- splash screen controlada pelo aplicativo;
- atividade Android redimensionável para tablets e multiwindow.

## Etapa obrigatória antes do APK/AAB

O aplicativo nativo depende das rotas de servidor. Depois de publicar a versão web na Vercel, crie `.env.android` a partir de `.env.android.example` e informe o domínio HTTPS real:

```env
VITE_API_BASE_URL=https://SEU-PROJETO.vercel.app
```

Depois execute:

```bash
npm ci
npm run android:config
npm run build
npm run android:sync
npm run android:apk
```

Para Play Store, configure a chave privada conforme `docs/APP_RELEASE.md` e execute `npm run android:aab`.

## Critério de versão final

A versão final deve passar pela matriz descrita em `docs/MOBILE_PRODUCTION_QA.md`, incluindo ao menos um Samsung, um Motorola, um Xiaomi/Redmi, um Android de entrada e um tablet ou emulador de tela grande.
