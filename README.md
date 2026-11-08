# NiñoPulse Global

**Understand Your Changing Planet.** Plataforma bilíngue para acompanhar o tempo local e compreender o ENSO.

- **Meu Clima** reúne busca internacional, localização opcional, cidade principal, favoritos e previsões por hora e por dia.
- **O que mudou?** compara consultas reais para a mesma data-alvo e reúne atualizações das fontes acompanhadas.
- **Earth Live** exibe temperatura, precipitação, dados da superfície do mar e anomalias nas regiões Niño.
- **ENSO Tracker** separa fase observada, histórico, observações oceânicas e probabilidades sazonais.
- **Alertas** consulta Defesa Civil no Brasil e NWS nos Estados Unidos. As verificações ocorrem com o app aberto.
- **Explorar** reúne seis guias, perfis regionais e ferramentas de pesquisa e exportação.

```bash
npm ci
npm run dev
npm run check
```

O desenvolvimento local inclui as rotas de dados para NOAA/CPC e alertas. Depois de `npm run build`, use `npm run start` para testar o build com o servidor Node.

O [guia de compilação](BUILD_GUIDE.md) explica como abrir o projeto Android, assinar com a chave de upload existente e atualizar o teste fechado. Consulte também o [changelog](CHANGELOG.md), o [relatório de testes](TEST_REPORT.md), a [metodologia](docs/METHODOLOGY.md) e a [política de privacidade](docs/PRIVACY.md).
