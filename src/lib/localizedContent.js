const countryNames = {
  BR: "Brazil", US: "United States", CA: "Canada", MX: "Mexico", AR: "Argentina", CL: "Chile", PE: "Peru", CO: "Colombia",
  AU: "Australia", NZ: "New Zealand", CN: "China", IN: "India", JP: "Japan", ID: "Indonesia", PH: "Philippines", ZA: "South Africa",
  EG: "Egypt", NG: "Nigeria", KE: "Kenya", GB: "United Kingdom", FR: "France", DE: "Germany", ES: "Spain", IT: "Italy", RU: "Russia",
  SA: "Saudi Arabia", PK: "Pakistan", BD: "Bangladesh", TH: "Thailand", VN: "Vietnam",
};

const continents = {
  "América do Sul": "South America", "América do Norte": "North America", "Oceania": "Oceania", "Ásia": "Asia",
  "África": "Africa", "Europa": "Europe", "Oriente Médio": "Middle East",
};

const threatText = {
  seca: { noun: "drought", detail: "lower rainfall and water stress" },
  enchentes: { noun: "flooding", detail: "heavy rainfall and flooding" },
  calor: { noun: "extreme heat", detail: "higher temperatures and heat stress" },
  agricultura: { noun: "agricultural disruption", detail: "crop and food-system disruption" },
  queimadas: { noun: "wildfires", detail: "drier vegetation and wildfire risk" },
  "chuva intensa": { noun: "heavy rainfall", detail: "intense rainfall and landslide risk" },
};

const confidence = { Alta: "High", "Muito Alta": "Very high", Moderada: "Moderate", Baixa: "Low" };

export function localizeCountry(country, language) {
  if (language !== "en") return country;
  const threats = country.ameacas.map((item) => threatText[item]?.noun || item);
  const details = country.ameacas.map((item) => threatText[item]?.detail || item);
  const list = new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(threats);
  const detailList = new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(details);
  const name = countryNames[country.id] || country.nome;

  return {
    ...country,
    nome: name,
    continente: continents[country.continente] || country.continente,
    resumoClimatico: `${name} has a historical ENSO impact profile associated with ${list}. Effects vary by season, event strength and region.`,
    impactoDoElNino: `During El Niño, ${name} may experience ${detailList}. This is an educational historical pattern, not a live national forecast.`,
    regioesAfetadas: "Impacts are region-specific. Consult the national meteorological service for current local guidance.",
    impactoNaAgricultura: country.ameacas.includes("agricultura") ? "Rainfall and heat shifts may affect crop timing, yields, irrigation and food supply chains." : "Agricultural effects depend on local rainfall, temperature and irrigation conditions.",
    impactoNaAgua: country.ameacas.includes("seca") ? "Reduced rainfall may pressure rivers, reservoirs and water supply." : "Water impacts may include changes in reservoirs, river flow and flood exposure.",
    impactoNaTemperatura: country.ameacas.includes("calor") ? "Warmer-than-average conditions and heat stress may become more likely." : "Temperature effects vary by region and season.",
    impactoNasChuvas: country.ameacas.some((item) => item === "enchentes" || item === "chuva intensa") ? "Some regions may face above-average rainfall and flood risk." : "Some regions may receive below-average rainfall or altered seasonal patterns.",
    confianca: confidence[country.confianca] || country.confianca,
  };
}

export function localizeCountries(countries, language) {
  return countries.map((country) => localizeCountry(country, language));
}
