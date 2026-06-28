import { countries } from "../src/lib/elNinoData.js";

export function publicCountry(country) {
  return {
    id: country.id,
    name: country.nome,
    continent: country.continente,
    riskLevel: country.nivelDeRisco,
    threats: country.ameacas,
    climateSummary: country.resumoClimatico,
    elNinoImpact: country.impactoDoElNino,
    affectedRegions: country.regioesAfetadas,
    profileCoverage: country.confianca,
    coordinates: { lat: country.lat, lng: country.lng },
    disclaimer: "Educational historical profile; not a real-time local warning or country forecast.",
  };
}

export function getPublicCountries(searchParams = new URLSearchParams()) {
  let result = countries;
  const risk = searchParams.get("risk");
  const threat = searchParams.get("threat");
  const query = searchParams.get("q")?.trim().toLocaleLowerCase();

  if (risk) result = result.filter((country) => country.nivelDeRisco === risk);
  if (threat) result = result.filter((country) => country.ameacas.includes(threat));
  if (query) result = result.filter((country) => country.nome.toLocaleLowerCase().includes(query));

  return result.map(publicCountry);
}
