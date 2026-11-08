# NiñoPulse Global 3.0 · compilação e teste fechado

Extraia `NinoPulse_Global_3.0_Android_Ready.zip`. Execute os comandos a partir da pasta que contém `package.json`.

## 1. Preparar o computador

| Componente | Versão |
| --- | --- |
| Android Studio | Otter 2025.2.1 ou mais recente |
| Node.js | 22 LTS ou mais recente |
| JDK do Gradle | 21 |
| Plataforma Android | Android 16, API 36 |
| Android SDK Build-Tools | 35.0.0, padrão do AGP 8.13.0 |
| Gradle Wrapper e AGP | 8.14.3 e 8.13.0 |
| Capacitor | 8.6.0 |
| Android compatível | A partir do Android 7, API 24 |
| ID do app | `com.vekkai.ninopulse` |
| Versão | `3.0.0`, código `30` |

No Android Studio, instale a plataforma 36 e os Build-Tools pelo **SDK Manager**. Em **Settings → Build, Execution, Deployment → Build Tools → Gradle**, selecione o JDK 21.

## 2. Compilar e abrir

```bash
npm ci
npm run check
npm run android:prepare
npm run android:open
```

O preparo gera `dist` e sincroniza o Capacitor. O ZIP já inclui os arquivos web em `android/app/src/main/assets/public`. Repita `npm run android:prepare` quando alterar a interface. Você também pode abrir manualmente a pasta `android` em **File → Open**. Para testar, aguarde o **Gradle Sync**, escolha um aparelho e execute **Run** na variante `debug`.

### Dados e serviços

O Android consulta Open-Meteo, NOAA/CPC, NWS e Defesa Civil diretamente. Para usar o backend do NiñoPulse, configure a origem HTTPS real em `VITE_API_BASE_URL` no arquivo opcional `.env.android` e refaça o preparo. A origem entra no bundle público. Na web, publique junto das funções em `api/` no Vercel ou execute `npm run start` após o build em um servidor Node. A página `/privacy` deve ficar pública no endereço informado ao Google Play.

O Open-Meteo oferece API gratuita para uso não comercial dentro dos limites dos termos, com atribuição. O backend HTTPS pode compartilhar em cache o feed brasileiro de avisos. Notificações com o app fechado exigem infraestrutura de push com agendamento, consentimento e gerenciamento de tokens.

## 3. Assinar o AAB

1. No Play Console do app existente, abra o **Explorador de pacotes de apps** e confira o maior código enviado em todas as faixas. O código `30` supera os códigos conhecidos `9` e `10`. Se o maior for 30 ou mais, aumente `versionCode` em `android/app/build.gradle` antes de assinar.
2. No Android Studio, selecione **Build → Generate Signed Bundle / APK → Android App Bundle** e o módulo `app`.
3. Use a chave de upload que você já usava no NiñoPulse e o alias correspondente. Selecione **release** e a pasta de destino. O projeto também aceita um `android/keystore.properties` local com base no exemplo.
4. Confira no resumo o pacote `com.vekkai.ninopulse`, a versão e a variante.

## 4. Teste fechado e publicação

1. Abra **Política → Status da política** no app existente. Consulte a mensagem integral, a versão afetada e o prazo da pendência.
2. Em **Conteúdo do app**, confirme classificação, público-alvo, política de privacidade e Segurança dos dados. Considere a busca, as coordenadas aproximadas opcionais e os dados recebidos por cada provedor.
3. Crie uma versão na faixa de **Teste fechado** existente e carregue o AAB assinado. Confira as verificações automáticas e a disponibilidade para os testadores.
4. Em um Android real, valide a atualização sobre a versão anterior, o teclado, a navegação do sistema, a localização opcional e as notificações. Verifique concessão e recusa de permissões.
5. Resolva a pendência apontada pelo Console e acompanhe o acesso à produção no painel do app. Use o fluxo de produção do mesmo aplicativo quando o Console liberar a faixa.

## Referências

- [API de destino no Google Play](https://support.google.com/googleplay/android-developer/answer/11926878?hl=pt-br)
- [Migração para Capacitor 8](https://capacitorjs.com/docs/updating/8-0)
- [Assinar um app no Android Studio](https://developer.android.com/studio/publish/app-signing?hl=pt-br)
- [Status da política](https://support.google.com/googleplay/android-developer/answer/9842754?hl=pt-br)
- [Segurança dos dados](https://support.google.com/googleplay/android-developer/answer/10787469?hl=pt-br)
- [Termos do Open-Meteo](https://open-meteo.com/en/terms)
