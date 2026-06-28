const RISK_WEIGHT = { baixo: 1, moderado: 2, alto: 3, extremo: 4 };

/**
 * @param {any} data
 * @returns {["laNina" | "neutral" | "elNino", number]}
 */
function dominantPhase(data) {
  const selected = data.forecast?.selectedSeason?.probability;
  if (selected) {
    /** @type {Array<["laNina" | "neutral" | "elNino", number]>} */
    const entries = [
      ["laNina", Number(selected.laNina || 0)],
      ["neutral", Number(selected.neutral || 0)],
      ["elNino", Number(selected.elNino || 0)],
    ];
    return entries.sort((a, b) => b[1] - a[1])[0];
  }
  const phase = String(data.current?.phase || "").toLowerCase();
  if (phase.includes("la niña") || phase.includes("la nina")) return ["laNina", 0];
  if (phase.includes("el niño") || phase.includes("el nino") || phase.includes("aquecimento")) return ["elNino", 0];
  return ["neutral", 0];
}

export function getCountryScenario(country, data, language = "pt") {
  const [phase, probability] = dominantPhase(data);
  const riskWeight = RISK_WEIGHT[country.nivelDeRisco] || 1;
  const signal = Math.round((riskWeight / 4) * (probability || 50));
  const pt = language === "pt";

  let label;
  let summary;
  if (phase === "elNino") {
    label = pt ? "Cenário histórico sob El Niño" : "Historical El Niño scenario";
    summary = country.impactoDoElNino;
  } else if (phase === "laNina") {
    label = pt ? "Cenário histórico sob La Niña" : "Historical La Niña scenario";
    summary = pt
      ? "Os efeitos podem diferir ou se inverter em relação ao perfil de El Niño. Consulte o serviço meteorológico nacional para a previsão atual."
      : "Effects may differ from or reverse the El Niño profile. Check the national meteorological service for a current forecast.";
  } else {
    label = pt ? "Sinal ENSO global neutro" : "Neutral global ENSO signal";
    summary = pt
      ? "O ENSO tende a exercer menor influência global neste cenário, mas riscos locais continuam possíveis por outros sistemas climáticos."
      : "ENSO tends to exert less global influence in this scenario, while local risks can still arise from other climate systems.";
  }

  return {
    phase,
    probability,
    signal,
    label,
    summary,
    disclaimer: pt
      ? "Cenário educacional baseado na fase global do ENSO e em padrões históricos; não é uma previsão meteorológica local."
      : "Educational scenario based on the global ENSO phase and historical patterns; not a local weather forecast.",
  };
}

export function countryAlertSnapshot(country, data) {
  const scenario = getCountryScenario(country, data, "en");
  return `${country.id}|${scenario.phase}|${scenario.probability}|${data.current?.weeklySst?.regions?.nino34?.anomaly ?? "na"}`;
}
