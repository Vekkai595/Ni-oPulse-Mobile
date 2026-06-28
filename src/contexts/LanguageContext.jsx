import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const messages = {
  pt: {
    nav: { home: "Início", map: "Mapa", enso: "ENSO", research: "Pesquisa", about: "Sobre", api: "API", localWeather: "Clima local", privacy: "Privacidade" },
    common: {
      language: "Idioma", theme: "Tema", light: "Claro", dark: "Escuro", system: "Sistema", menu: "Menu",
      live: "Dados NOAA ao vivo", fallback: "Fallback NOAA ativo", updated: "Atualizado", refresh: "Atualizar dados",
      install: "Instalar app", share: "Compartilhar imagem", close: "Fechar", source: "Fonte", official: "Oficial",
      experimental: "Experimental", educational: "Educacional", download: "Baixar", enabled: "Ativado", disabled: "Desativado",
      favorite: "Favoritar", removeFavorite: "Remover favorito", learnMore: "Saiba mais", viewDetails: "Ver detalhes",
      copied: "Copiado", alertConfigured: "Alerta configurado", skip: "Pular para o conteúdo",
    },
    kicker: {
      archive: "ARQUIVO ENSO", toolkit: "KIT DE DADOS ABERTOS", technical: "ESPAÇO TÉCNICO",
      developer: "PLATAFORMA PARA DESENVOLVEDORES", student: "DESENVOLVEDOR ESTUDANTE",
    },
    hero: {
      eyebrow: "Monitoramento global do ENSO", titleA: "Ciência climática", titleB: "clara, visual e atualizada.",
      description: "Acompanhe El Niño, La Niña, anomalias oceânicas e cenários históricos por país com dados oficiais da NOAA/CPC.",
      phase: "Fase oficial", probability: "Probabilidade de El Niño", nino34: "Niño 3.4 semanal", next: "Próximo boletim",
      bulletin: "Resumo oficial NOAA", issued: "Boletim emitido em", explore: "Explorar mapa", research: "Abrir Modo de Pesquisa",
      apiConfig: "O app Android precisa de VITE_API_BASE_URL apontando para o domínio HTTPS publicado.",
    },
    filters: { title: "Filtros", clear: "Limpar", risk: "Nível de risco histórico", impact: "Tipo de impacto", all: "Todos" },
    risks: { baixo: "Baixo", moderado: "Moderado", alto: "Alto", extremo: "Extremo" },
    threats: { seca: "Seca", enchentes: "Enchentes", calor: "Calor extremo", agricultura: "Agricultura", queimadas: "Queimadas", "chuva intensa": "Chuva intensa" },
    map: {
      title: "Mapa educacional de impactos", countries: "países exibidos", legend: "Legenda", layers: "Camadas históricas",
      risk: "Risco histórico", drought: "Seca", rain: "Chuva/enchente", agriculture: "Agricultura", tap: "Toque para ver detalhes",
      note: "As camadas representam perfis históricos por país, não observações meteorológicas em tempo real.",
    },
    countries: { kicker: "30 PAÍSES AO VIVO", title: "Condições atuais nos países", search: "Buscar país", empty: "Nenhum país corresponde aos filtros.", liveSubtitle: "Dados meteorológicos atuais e previsão de 7 dias para um ponto representativo em cada país, separados do contexto histórico do ENSO." },
    live: {
      active: "Ao vivo", cached: "Cache recente", loading: "Carregando dados atuais", refreshing: "Atualizando as condições dos 30 países…",
      unavailable: "Dados atuais indisponíveis", unavailableLong: "Não foi possível carregar as condições atuais deste país. Tente atualizar; o contexto histórico continua disponível abaixo.",
      retryNote: "Abra os detalhes ou tente novamente em alguns instantes.", now: "Agora", currentConditions: "Condições atuais",
      humidity: "Umidade", precipitation: "Precipitação", wind: "Vento", feelsLike: "Sensação", cloudCover: "Nuvens",
      highLow: "Máx. / mín.", localUpdate: "Horário local do dado", sevenDayForecast: "Próximos 7 dias", rainChance: "chuva",
      representativeNote: "Leitura atual de um ponto representativo do país. Não é uma média nacional nem um alerta oficial. Para decisões locais, consulte o serviço meteorológico nacional.",
      sourceAttribution: "Dados meteorológicos: Open-Meteo (CC BY 4.0)", historicalContext: "Contexto histórico do ENSO",
    },
    weather: {
      clear: "Céu limpo", mostlyClear: "Predominantemente limpo", partlyCloudy: "Parcialmente nublado", overcast: "Nublado",
      fog: "Nevoeiro", drizzle: "Garoa", freezingDrizzle: "Garoa congelante", rain: "Chuva", freezingRain: "Chuva congelante",
      snow: "Neve", showers: "Pancadas de chuva", snowShowers: "Pancadas de neve", thunderstorm: "Trovoada",
      thunderstormHail: "Trovoada com granizo", unknown: "Condição não identificada",
    },
    panel: {
      risk: "Risco histórico", confidence: "Cobertura da síntese", climate: "Resumo climático", impact: "Perfil histórico de El Niño",
      regions: "Regiões mais afetadas", agriculture: "Agricultura", water: "Água", temperature: "Temperatura", rain: "Chuvas",
      warning: "Os padrões por país são referências históricas e educacionais, não alertas locais em tempo real.",
      currentScenario: "Cenário ENSO atual", scenarioSignal: "Sinal combinado", alert: "Alternar alerta deste país",
    },
    forecast: {
      kicker: "PREVISÃO NOAA/CPC", title: "Probabilidade ENSO oficial", subtitle: "Probabilidades para períodos móveis de três meses publicadas pela NOAA/CPC.",
      neutral: "Neutro", interpretation: "Como interpretar", explanation: "Estas probabilidades descrevem a fase global do ENSO. Elas não são previsões meteorológicas por país.",
      issued: "Emissão da tabela", open: "Abrir fonte oficial", intensity: "Intensidade possível", weak: "Fraco", moderate: "Moderado", strong: "Forte", veryStrong: "Muito forte",
    },
    analytics: {
      title: "Histórico completo e comparação", subtitle: "Explore a série oficial desde 1950 e compare episódios detectados pela regra de cinco estações.",
      event: "Evento", peak: "Pico do índice", duration: "Duração", global: "Contexto histórico", compare: "Comparar episódios",
      chart: "Série histórica oficial", note: "RONI é o índice oficial atual da NOAA/CPC; ONI permanece disponível para comparação histórica. Valores recentes podem ser revisados.",
      fallback: "A série completa não pôde ser carregada; exibindo um resumo offline.", index: "Índice", roni: "RONI oficial", oni: "ONI histórico",
      allYears: "Todo o período", recentYears: "Últimos 20 anos", noEpisodes: "Episódios insuficientes para comparação.",
    },
    model: {
      title: "Índice experimental de sinal", subtitle: "Uma heurística transparente, separada da previsão oficial e sem alegação de inteligência artificial.",
      confidence: "Índice de sinal", outlook: "Tendência indicada", explanation: "Componentes do cálculo",
      disclaimer: "Este índice não mede confiança científica nem substitui modelos meteorológicos. Ele resume qualidade dos dados, anomalia, concordância e direção das probabilidades.",
      strengthening: "Sinal de fortalecimento", stable: "Sinal relativamente estável", weakening: "Sinal de enfraquecimento",
      dataQuality: "Qualidade dos dados", anomalySignal: "Sinal da anomalia", forecastAgreement: "Concordância da previsão", trendClarity: "Clareza da tendência",
    },
    tools: {
      title: "Ferramentas de pesquisa", subtitle: "Exporte dados, gere relatório e compartilhe uma imagem real do painel.",
      csv: "Exportar CSV", json: "Exportar JSON", pdf: "Exportar PDF", research: "Modo de Pesquisa", api: "Documentação da API",
      shareImage: "Compartilhar painel", exportSuccess: "Arquivo preparado com sucesso.", exportError: "Não foi possível gerar o arquivo.",
      shareSuccess: "Imagem compartilhada com sucesso.", shareDownloaded: "O navegador baixou a imagem para você compartilhar.",
    },
    alerts: {
      title: "Alertas locais no dispositivo", description: "Ao atualizar o app, receba avisos quando a fase global, a probabilidade principal ou o cenário de um país selecionado mudar.",
      enable: "Ativar alertas", unsupported: "Este dispositivo não oferece notificações locais.", denied: "A permissão de notificações foi negada.",
      limitation: "Não é push remoto em segundo plano. Push verdadeiro exige Firebase/APNs e um servidor de assinaturas.",
      changed: "O cenário ENSO foi atualizado", countryChanged: "O cenário educacional mudou para",
    },
    about: {
  title: "Sobre o projeto",
  project: "NiñoPulse Global transforma dados climáticos complexos em uma experiência clara para estudantes, educadores e pesquisadores iniciantes.",

  dataTitle: "Sobre os dados",
  data: "A fase ENSO, índices semanais, probabilidades, RONI e ONI vêm da NOAA/CPC. As condições meteorológicas atuais dos 30 países vêm do Open-Meteo; os perfis nacionais continuam sendo sínteses educacionais de padrões históricos.",

  methodTitle: "Metodologia",
  method: "O backend consulta fontes oficiais, valida os dados, mantém cache e usa a última resposta válida quando uma fonte fica indisponível.",

  devTitle: "About the Dev",
  dev: "Samuel Borba Cordeiro é um estudante brasileiro interessado em ciência, tecnologia e impacto educacional. Ele criou o NiñoPulse Global para tornar o ENSO mais acessível por meio de programação e visualização de dados.",
  email: "E-mail profissional",

  principles: "Princípios",
  p1: "Separação clara entre dado oficial, cenário educacional e experimento",
  p2: "Design acessível, bilíngue e mobile-first",
  p3: "Código documentado, testado e preparado para web e Android",

  credits: "Créditos e fontes",
  noaa: "Dados ENSO: NOAA Climate Prediction Center · Condições meteorológicas: Open-Meteo (CC BY 4.0)",
  school: "Projeto educacional desenvolvido na Firjan SESI Caxias.",

  caseKicker: "ESTUDO DE CASO",
  caseTitle: "Do problema ao produto",
  caseProblem: "Problema",
  caseProblemText: "Boletins ENSO são confiáveis, mas podem ser difíceis de interpretar para estudantes.",

  caseSolution: "Solução",
  caseSolutionText: "Uma interface bilíngue reúne dados oficiais, histórico, explicações e ferramentas de pesquisa sem misturar conteúdo experimental com previsão oficial.",

  caseEngineering: "Engenharia",
  caseEngineeringText: "React, Vite, Node, cache, API versionada, PWA, Capacitor, testes automatizados e CI.",

  caseImpact: "Impacto",
  caseImpactText: "O projeto pode apoiar aulas, demonstrações científicas e o portfólio acadêmico do desenvolvedor.",

  stack: "Tecnologias e decisões",
  privacy: "Privacidade por padrão: favoritos e preferências permanecem no dispositivo; nenhuma conta ou senha é coletada.",
},

    research: {
      title: "Modo de Pesquisa", subtitle: "Visão técnica dos dados ENSO, fontes, integridade, histórico e exportação.",
      current: "Estado atual", anomalies: "Anomalias semanais", probabilities: "Probabilidades sazonais", provenance: "Proveniência dos dados",
      region: "Região", anomaly: "Anomalia", season: "Período", laNina: "La Niña", neutral: "Neutro", elNino: "El Niño", fallbackLabel: "Fallback",
      freshness: "Atualidade", availability: "Disponibilidade", cadence: "Frequência", methodology: "Notas metodológicas",
      methodologyText: "Valores NOAA são processados no servidor, normalizados e armazenados em cache. Perfis nacionais e índice experimental permanecem claramente separados.",
    },
    api: {
      title: "API pública", subtitle: "Endpoints somente leitura para projetos educacionais e protótipos de pesquisa.",
      endpoints: "Endpoints", endpoint: "Endpoint", description: "Descrição", rate: "Limite", key: "Chaves de API", noKey: "Uso público básico não exige chave.",
      caution: "Sem Upstash configurado, o limite usa memória da instância. Com as variáveis Upstash, o mesmo código usa limite distribuído.",
      example: "Exemplo em JavaScript", optionalKey: "Chaves opcionais são configuradas manualmente em NINOPULSE_API_KEYS e nunca são expostas ao navegador.",
    },
    footer: { transparency: "Transparência dos dados", created: "Criado por Samuel Borba Cordeiro para fins educacionais", rights: "Monitoramento oficial + conteúdo educacional" },
  },
  en: {
    nav: { home: "Home", map: "Map", enso: "ENSO", research: "Research", about: "About", api: "API", localWeather: "Local weather", privacy: "Privacy" },
    common: {
      language: "Language", theme: "Theme", light: "Light", dark: "Dark", system: "System", menu: "Menu",
      live: "Live NOAA data", fallback: "NOAA fallback active", updated: "Updated", refresh: "Refresh data",
      install: "Install app", share: "Share image", close: "Close", source: "Source", official: "Official",
      experimental: "Experimental", educational: "Educational", download: "Download", enabled: "Enabled", disabled: "Disabled",
      favorite: "Add favorite", removeFavorite: "Remove favorite", learnMore: "Learn more", viewDetails: "View details",
      copied: "Copied", alertConfigured: "Alert configured", skip: "Skip to content",
    },
    kicker: {
      archive: "ENSO ARCHIVE", toolkit: "OPEN DATA TOOLKIT", technical: "TECHNICAL WORKSPACE",
      developer: "DEVELOPER PLATFORM", student: "STUDENT DEVELOPER",
    },
    hero: {
      eyebrow: "Global ENSO monitoring", titleA: "Climate science", titleB: "made clear, visual and current.",
      description: "Track El Niño, La Niña, ocean anomalies and historical country scenarios with official NOAA/CPC data.",
      phase: "Official phase", probability: "El Niño probability", nino34: "Weekly Niño 3.4", next: "Next bulletin",
      bulletin: "Official NOAA summary", issued: "Bulletin issued on", explore: "Explore map", research: "Open Research Mode",
      apiConfig: "The Android app needs VITE_API_BASE_URL pointing to the deployed HTTPS domain.",
    },
    filters: { title: "Filters", clear: "Clear", risk: "Historical risk level", impact: "Impact type", all: "All" },
    risks: { baixo: "Low", moderado: "Moderate", alto: "High", extremo: "Extreme" },
    threats: { seca: "Drought", enchentes: "Flooding", calor: "Extreme heat", agricultura: "Agriculture", queimadas: "Wildfires", "chuva intensa": "Heavy rain" },
    map: {
      title: "Educational impact map", countries: "countries shown", legend: "Legend", layers: "Historical layers",
      risk: "Historical risk", drought: "Drought", rain: "Rain/flood", agriculture: "Agriculture", tap: "Tap for details",
      note: "Layers represent historical country profiles, not real-time meteorological observations.",
    },
    countries: { kicker: "30 LIVE COUNTRIES", title: "Current country conditions", search: "Search country", empty: "No country matches the filters.", liveSubtitle: "Current weather and a 7-day forecast for one representative location in each country, kept separate from the historical ENSO context." },
    live: {
      active: "Live", cached: "Recent cache", loading: "Loading current data", refreshing: "Refreshing conditions for all 30 countries…",
      unavailable: "Current data unavailable", unavailableLong: "Current conditions for this country could not be loaded. Try refreshing; the historical context remains available below.",
      retryNote: "Open details or try again in a moment.", now: "Now", currentConditions: "Current conditions",
      humidity: "Humidity", precipitation: "Precipitation", wind: "Wind", feelsLike: "Feels like", cloudCover: "Cloud cover",
      highLow: "High / low", localUpdate: "Local data time", sevenDayForecast: "Next 7 days", rainChance: "rain",
      representativeNote: "Current reading for one representative location in the country. It is not a national average or an official warning. Consult the national weather service for local decisions.",
      sourceAttribution: "Weather data: Open-Meteo (CC BY 4.0)", historicalContext: "Historical ENSO context",
    },
    weather: {
      clear: "Clear sky", mostlyClear: "Mostly clear", partlyCloudy: "Partly cloudy", overcast: "Overcast", fog: "Fog",
      drizzle: "Drizzle", freezingDrizzle: "Freezing drizzle", rain: "Rain", freezingRain: "Freezing rain", snow: "Snow",
      showers: "Rain showers", snowShowers: "Snow showers", thunderstorm: "Thunderstorm", thunderstormHail: "Thunderstorm with hail",
      unknown: "Condition unavailable",
    },
    panel: {
      risk: "Historical risk", confidence: "Profile coverage", climate: "Climate overview", impact: "Historical El Niño profile", regions: "Most affected regions",
      agriculture: "Agriculture", water: "Water", temperature: "Temperature", rain: "Rainfall",
      warning: "Country patterns are historical educational references, not real-time local warnings.",
      currentScenario: "Current ENSO scenario", scenarioSignal: "Combined signal", alert: "Toggle alert for this country",
    },
    forecast: {
      kicker: "NOAA/CPC OUTLOOK", title: "Official ENSO probabilities", subtitle: "Three-month rolling probabilities published by NOAA/CPC.", neutral: "Neutral",
      interpretation: "How to read this", explanation: "These probabilities describe the global ENSO phase. They are not country weather forecasts.",
      issued: "Table issued", open: "Open official source", intensity: "Possible intensity", weak: "Weak", moderate: "Moderate", strong: "Strong", veryStrong: "Very strong",
    },
    analytics: {
      title: "Complete history and comparison", subtitle: "Explore the official series since 1950 and compare episodes detected with the five-season rule.",
      event: "Event", peak: "Index peak", duration: "Duration", global: "Historical context", compare: "Compare episodes",
      chart: "Official historical series", note: "RONI is NOAA/CPC's current official index; ONI remains available for historical comparison. Recent values may be revised.",
      fallback: "The complete series could not be loaded; showing a condensed offline summary.", index: "Index", roni: "Official RONI", oni: "Historical ONI",
      allYears: "Full period", recentYears: "Last 20 years", noEpisodes: "Not enough episodes are available for comparison.",
    },
    model: {
      title: "Experimental signal index", subtitle: "A transparent heuristic, separate from the official outlook and making no artificial-intelligence claim.",
      confidence: "Signal index", outlook: "Indicated trend", explanation: "Calculation components",
      disclaimer: "This index is not scientific confidence and does not replace meteorological models. It summarizes data quality, anomaly, agreement and probability direction.",
      strengthening: "Strengthening signal", stable: "Relatively stable signal", weakening: "Weakening signal",
      dataQuality: "Data quality", anomalySignal: "Anomaly signal", forecastAgreement: "Forecast agreement", trendClarity: "Trend clarity",
    },
    tools: {
      title: "Research tools", subtitle: "Export data, generate a report and share a real image of the dashboard.",
      csv: "Export CSV", json: "Export JSON", pdf: "Export PDF", research: "Research Mode", api: "API documentation", shareImage: "Share dashboard",
      exportSuccess: "File prepared successfully.", exportError: "The file could not be generated.", shareSuccess: "Image shared successfully.", shareDownloaded: "The browser downloaded the image for you to share.",
    },
    alerts: {
      title: "Local device alerts", description: "When the app refreshes, receive alerts if the global phase, leading probability or a selected country scenario changes.",
      enable: "Enable alerts", unsupported: "This device does not support local notifications.", denied: "Notification permission was denied.",
      limitation: "This is not remote background push. True push requires Firebase/APNs and a subscription server.",
      changed: "The ENSO scenario was updated", countryChanged: "The educational scenario changed for",
    },
    about: {
      title: "About the project", project: "NiñoPulse Global turns complex climate data into a clear experience for students, educators and early-stage researchers.",
      dataTitle: "About the data", data: "ENSO phase, weekly indices, probabilities, RONI and ONI come from NOAA/CPC. Current weather for the 30 countries comes from Open-Meteo; country profiles remain educational summaries of historical patterns.",
      methodTitle: "Methodology", method: "The backend retrieves official sources, validates data, caches responses and preserves the last valid response when a source is unavailable.",
      devTitle: "About the Dev", dev: "Samuel Borba Cordeiro is a Brazilian student interested in science, technology and educational impact. He created NiñoPulse Global to make ENSO easier to understand through programming and data visualization.",
      email: "Professional email",
      principles: "Principles", p1: "Clear separation of official data, educational scenarios and experiments", p2: "Accessible, bilingual and mobile-first design", p3: "Documented, tested code prepared for web and Android",
      credits: "Credits and sources", noaa: "ENSO data: NOAA Climate Prediction Center · Current weather: Open-Meteo (CC BY 4.0)", school: "Educational project developed at Firjan SESI Caxias.",
      caseKicker: "CASE STUDY", caseTitle: "From problem to product", caseProblem: "Problem", caseProblemText: "ENSO bulletins are reliable but can be difficult for students to interpret.",
      caseSolution: "Solution", caseSolutionText: "A bilingual interface combines official data, history, explanations and research tools without mixing experimental content with the official forecast.",
      caseEngineering: "Engineering", caseEngineeringText: "React, Vite, Node, caching, a versioned API, PWA, Capacitor, automated tests and CI.",
      caseImpact: "Impact", caseImpactText: "The project can support lessons, science demonstrations and the developer's academic portfolio.",
      stack: "Technology and decisions", privacy: "Privacy by default: favorites and preferences stay on the device; no account or password is collected.",
    },
    research: {
      title: "Research Mode", subtitle: "A technical view of ENSO data, sources, integrity, history and exports.", current: "Current state", anomalies: "Weekly anomalies",
      probabilities: "Seasonal probabilities", provenance: "Data provenance", region: "Region", anomaly: "Anomaly", season: "Season", laNina: "La Niña", neutral: "Neutral", elNino: "El Niño", fallbackLabel: "Fallback", freshness: "Freshness", availability: "Availability", cadence: "Cadence", methodology: "Methodology notes",
      methodologyText: "NOAA values are processed server-side, normalized and cached. Country profiles and the experimental index remain clearly separated.",
    },
    api: {
      title: "Public API", subtitle: "Read-only endpoints for educational projects and research prototypes.", endpoints: "Endpoints", endpoint: "Endpoint", description: "Description", rate: "Rate limit",
      key: "API keys", noKey: "Basic public use does not require a key.", caution: "Without Upstash, rate limiting uses instance memory. With the Upstash variables, the same code uses distributed limiting.",
      example: "JavaScript example", optionalKey: "Optional keys are manually configured in NINOPULSE_API_KEYS and are never exposed to the browser.",
    },
    footer: { transparency: "Data transparency", created: "Created by Samuel Borba Cordeiro for educational purposes", rights: "Official monitoring + educational content" },
  },
};

function getByPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem("ninopulse-language") || "pt");

  useEffect(() => {
    localStorage.setItem("ninopulse-language", language);
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key, fallback) => getByPath(messages[language], key) ?? fallback ?? key,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
