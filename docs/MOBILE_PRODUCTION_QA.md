# Mobile Production QA — NiñoPulse Global 2.3

Use esta lista antes de chamar uma versão de “final” ou enviar o AAB para produção. Registre aparelho, versão do Android, resultado, captura e problema encontrado.

## 1. Matriz mínima de aparelhos

| Perfil | Tela sugerida | Android | Resultado |
|---|---:|---:|---|
| celular compacto | 320–360 px | 6–9 | pendente físico |
| Android de entrada | 360–393 px | 10–13 | pendente físico |
| Samsung atual | 360–430 px | 13–15 | pendente físico |
| Motorola atual | 360–430 px | 12–15 | pendente físico |
| Xiaomi/Redmi | 360–430 px | 12–15 | pendente físico |
| tablet/multiwindow | 600–1280 px | 12–15 | pendente físico |

Também valide pelo DevTools/emulador em 320×568, 360×800, 393×852, 412×915, 600×960 e 800×1280, em retrato e paisagem.

## 2. Fluxos críticos

- abrir o app do zero sem tela branca;
- alternar português/inglês e tema sistema/claro/escuro;
- rolar toda a página sem travamento ou conteúdo encoberto;
- abrir, filtrar, pesquisar e expandir a lista de países;
- abrir e fechar o painel de país por toque, gesto e botão Voltar;
- abrir o mapa, habilitar interação, aplicar filtros e usar tela cheia;
- confirmar que o botão Voltar fecha a camada atual antes de sair;
- testar gráficos, tabelas, pesquisa, favoritos, compartilhamento, CSV, JSON e PDF;
- testar instalação PWA, atualização da PWA e inicialização offline;
- testar perda de internet, retorno da conexão e reabertura do aplicativo;
- testar teclado aberto em pesquisa/formulários sem esconder campos;
- testar fonte do sistema ampliada e zoom do navegador;
- testar rotação durante mapa, painel e carregamento;
- testar retomada depois de bloquear a tela ou trocar de aplicativo.

## 3. Desempenho e estabilidade

- nenhuma tarefa principal deve causar tela congelada prolongada;
- nenhuma imagem, tabela ou gráfico deve ultrapassar a largura visível;
- o mapa deve redimensionar depois de rotação e tela cheia;
- listas longas devem renderizar progressivamente;
- o aplicativo deve sobreviver a cinco ciclos de abrir/fechar e dez minutos de navegação;
- registrar qualquer falha no WebView, consumo excessivo de memória ou reinício do processo.

## 4. Ciência, escola e privacidade

- dados oficiais e cenários educativos permanecem claramente separados;
- fonte, horário de atualização e estado de fallback estão visíveis;
- nenhuma previsão nacional é inferida a partir de uma única cidade;
- o Signal Index continua marcado como experimental e não oficial;
- o app não solicita nome, e-mail, localização precisa ou cadastro;
- textos de metodologia, privacidade e limitações continuam acessíveis.

## 5. Portão de lançamento

Somente gerar o AAB de produção depois de:

1. configurar uma URL HTTPS real em `.env.android`;
2. passar `npm run check`;
3. sincronizar o Android sem erro;
4. concluir a matriz física mínima;
5. corrigir todos os problemas bloqueadores;
6. assinar o AAB com uma chave de upload mantida fora do repositório;
7. testar o AAB pela faixa de testes internos/fechados da Play Store.
