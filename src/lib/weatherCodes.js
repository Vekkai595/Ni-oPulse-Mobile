export function weatherCodeKey(code) {
  const value = Number(code);
  if (value === 0) return "clear";
  if (value === 1) return "mostlyClear";
  if (value === 2) return "partlyCloudy";
  if (value === 3) return "overcast";
  if ([45, 48].includes(value)) return "fog";
  if ([51, 53, 55].includes(value)) return "drizzle";
  if ([56, 57].includes(value)) return "freezingDrizzle";
  if ([61, 63, 65].includes(value)) return "rain";
  if ([66, 67].includes(value)) return "freezingRain";
  if ([71, 73, 75, 77].includes(value)) return "snow";
  if ([80, 81, 82].includes(value)) return "showers";
  if ([85, 86].includes(value)) return "snowShowers";
  if (value === 95) return "thunderstorm";
  if ([96, 99].includes(value)) return "thunderstormHail";
  return "unknown";
}

export function roundWeatherValue(value, fallback = "—") {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : fallback;
}

export function formatCountryLocalTime(value) {
  if (!value) return "—";
  return String(value).replace("T", " ");
}
