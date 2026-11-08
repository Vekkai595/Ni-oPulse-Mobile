# Metodologia e fontes · NiñoPulse 3.0

## Tempo local e Earth Live

O Open-Meteo fornece estimativas de modelo. Meu Clima exibe a hora local da condição modelada e a hora da consulta. A probabilidade diária corresponde à maior chance horária de precipitação para aquele dia.

O mapa apresenta pontos consultados para temperatura, precipitação do intervalo de referência e temperatura da superfície do mar. A camada de anomalias usa médias semanais da NOAA/CPC para as regiões Niño, com base 1991–2020. A cartografia usa o conjunto de terras em escala 1:110 milhões da Natural Earth, em domínio público.

## O que mudou?

O dispositivo guarda a última consulta bem-sucedida de cada dia no fuso da cidade. Compara ontem e hoje para as mesmas datas-alvo, considerando até dois dias. Exibe diferenças a partir de 10 pontos percentuais na chance de precipitação e 2 °C na máxima. O primeiro acesso estabelece a referência.

As categorias acompanhadas também registram novos identificadores de avisos oficiais, mudanças relevantes em cidades salvas e novos boletins do ENSO. Cada categoria é opcional.

## ENSO e alertas

A fase vem da discussão oficial da NOAA/CPC. As probabilidades sazonais descrevem a fase do ENSO no Pacífico em janelas móveis de três meses. RONI e ONI são índices históricos distintos. Os efeitos regionais variam por evento e estação. A atribuição de uma tempestade específica exige estudo próprio.

No Brasil, o app cruza o ponto da cidade com polígonos e círculos do feed CAP da Defesa Civil. Nos Estados Unidos, consulta alertas ativos por ponto do NWS. A cobertura depende da área informada pelos emissores. O INMET é uma fonte complementar no Brasil.

## Fontes

- [Open-Meteo](https://open-meteo.com/en/docs)
- [Open-Meteo Marine](https://open-meteo.com/en/docs/marine-weather-api)
- [Natural Earth](https://www.naturalearthdata.com/)
- [NOAA/CPC · diagnóstico](https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml)
- [NOAA/CPC · probabilidades](https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/probabilities/)
- [NOAA/CPC · RONI](https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/)
- [NOAA/CPC · ONI](https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/)
- [Defesa Civil](https://www.gov.br/mdr/pt-br/assuntos/protecao-e-defesa-civil/defesa-civil-alerta)
- [NWS · avisos](https://www.weather.gov/documentation/services-web-alerts)
