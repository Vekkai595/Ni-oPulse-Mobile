# NiñoPulse Global 3.0 · relatório de testes

## Revisão da interface em 8 de novembro de 2026

- `npm run check` passou com ESLint, verificação de tipos, 29 testes Node e build Vite. O Capacitor sincronizou os arquivos web com o projeto Android.
- A paleta, o degradê e a largura do cartão inicial corresponderam ao projeto original a 390 px e 1440 px, nos temas claro e escuro.
- No navegador, respostas controladas permitiram verificar a busca por cidade, 24 horários e sete dias de previsão, favoritos, mapa, acesso ao painel ENSO, links de navegação, tema e idioma. A 320 px, o fluxo de busca e a previsão salva funcionaram sem rolagem lateral.
- A tela inicial abriu e a busca permaneceu acessível com a consulta à NOAA indisponível.
- A revisão foi executada em navegador. A compilação Gradle e os testes abaixo correspondem à validação de 7 de novembro.

## Validação inicial em 7 de novembro de 2026

| Verificação | Resultado |
| --- | --- |
| Instalação e build web | `npm ci` e `npm run check` concluídos. ESLint, tipos, 29 testes Node e build Vite passaram. |
| Sincronização | Os arquivos de produção foram copiados para Android e sete plugins Capacitor sincronizados. |
| Android | Gradle `:app:assembleDebug` e `:app:testDebugUnitTest` passaram em JDK 21 e SDK 36. |
| Lint de release | Gradle `:app:lintVitalRelease` concluiu com sucesso. |
| Manifesto do APK | `com.vekkai.ninopulse`, versão `3.0.0 (30)`, minSdk 24, compileSdk 36 e targetSdk 36. Localização aproximada e notificações. O APK verificado está livre de bibliotecas `.so`. |
| Auditoria NPM | Zero achados na auditoria das dependências de produção. A auditoria completa registrou seis achados transitivos de severidade baixa ou moderada na cadeia de build da PWA. |

## Dados e interface

- **Meu Clima.** Consulta real ao Open-Meteo encontrou Duque de Caxias e retornou 24 horários e sete dias no fuso `America/Sao_Paulo`. O teste de navegador confirmou favoritos e exibição da previsão salva offline.
- **O que mudou?** As entradas controladas confirmaram a comparação por data-alvo no fuso local, a preservação de valores zero, o tratamento de campos ausentes e a exibição da diferença entre duas previsões.
- **ENSO.** Consulta real à NOAA retornou o diagnóstico, nove janelas sazonais, 52 semanas de SST e séries ONI e RONI. Os testes cobrem anomalias negativas adjacentes, datas em comentários HTML e boletins que descrevem uma possível fase futura.
- **Earth Live.** A consulta real retornou temperatura e precipitação em 14 pontos e temperatura de superfície do mar no Pacífico. O mapa local foi verificado a 390 px, com altura utilizável e sem rolagem lateral.
- **Alertas.** A consulta NWS por ponto respondeu com sucesso. O teste de navegador verificou o aviso e o acompanhamento com uma resposta controlada. Os testes do CAP cobriram polígonos, avisos cancelados, expirados, de teste e sem geometria. O feed brasileiro apresentou indisponibilidade na nova rodada de consultas. A interface distingue fonte indisponível de consulta bem-sucedida sem aviso.
- **Interface.** Desktop e viewport móvel exercitaram idioma, tema, guias, privacidade e consentimento. O navegador confirmou envio de coordenadas arredondadas e ausência de previsão por localização do aparelho no armazenamento persistente.

## Verificações de lançamento

- Ainda falta validar em aparelho físico a atualização sobre a versão anterior, o WebView e as notificações do sistema. A localização no teste de navegador usou coordenadas controladas.
- Avisos automáticos por cidade cobrem Brasil e Estados Unidos conforme os feeds disponíveis. Notificações locais dependem de verificações com o app aberto.
- Antes da assinatura, confirme o maior `versionCode` enviado e consulte o detalhe da pendência em **Política → Status da política** no Play Console. Use a chave de upload existente para gerar o AAB.
