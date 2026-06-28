# Release Notes — 2.3.0-beta.1

## Objetivo

Tornar o NiñoPulse Global utilizável como plataforma escolar real em celulares Android, mantendo a experiência de desktop e melhorando estabilidade, acessibilidade, desempenho e comportamento nativo.

## Estado da entrega

- código web mobile-first: concluído;
- PWA e atualização offline: concluído no código;
- integrações nativas de teclado, splash, retomada e botão Voltar: concluídas no código;
- validações automatizadas: concluídas (`npm run check`, 22/22 testes);
- URL de API Android: depende do domínio HTTPS publicado;
- matriz física multiaparelho: obrigatória antes do rótulo final;
- assinatura e AAB da Play Store: depende da chave privada do responsável.

## Risco conhecido

Nenhum pacote web consegue garantir por si só comportamento idêntico em todos os fabricantes e versões de Android. A beta foi preparada para uma faixa ampla, mas a aprovação final depende dos testes registrados em `MOBILE_PRODUCTION_QA.md`.
