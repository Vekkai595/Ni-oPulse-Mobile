import React, { useState, useEffect } from "react";
import { roundWeatherValue, weatherCodeKey } from "@/lib/weatherCodes";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AVAILABLE_COUNTRIES = [
  { iso2: "BR", labelPt: "Brasil", labelEn: "Brazil", apiName: "Brazil" },
  { iso2: "US", labelPt: "Estados Unidos", labelEn: "United States", apiName: "United States" },
  { iso2: "CA", labelPt: "Canadá", labelEn: "Canada", apiName: "Canada" },
  { iso2: "MX", labelPt: "México", labelEn: "Mexico", apiName: "Mexico" },
  { iso2: "AR", labelPt: "Argentina", labelEn: "Argentina", apiName: "Argentina" },
  { iso2: "CL", labelPt: "Chile", labelEn: "Chile", apiName: "Chile" },
  { iso2: "PE", labelPt: "Peru", labelEn: "Peru", apiName: "Peru" },
  { iso2: "CO", labelPt: "Colômbia", labelEn: "Colombia", apiName: "Colombia" },
  { iso2: "AU", labelPt: "Austrália", labelEn: "Australia", apiName: "Australia" },
  { iso2: "NZ", labelPt: "Nova Zelândia", labelEn: "New Zealand", apiName: "New Zealand" },
  { iso2: "CN", labelPt: "China", labelEn: "China", apiName: "China" },
  { iso2: "IN", labelPt: "Índia", labelEn: "India", apiName: "India" },
  { iso2: "JP", labelPt: "Japão", labelEn: "Japan", apiName: "Japan" },
  { iso2: "ID", labelPt: "Indonésia", labelEn: "Indonesia", apiName: "Indonesia" },
  { iso2: "PH", labelPt: "Filipinas", labelEn: "Philippines", apiName: "Philippines" },
  { iso2: "ZA", labelPt: "África do Sul", labelEn: "South Africa", apiName: "South Africa" },
  { iso2: "EG", labelPt: "Egito", labelEn: "Egypt", apiName: "Egypt" },
  { iso2: "NG", labelPt: "Nigéria", labelEn: "Nigeria", apiName: "Nigeria" },
  { iso2: "KE", labelPt: "Quênia", labelEn: "Kenya", apiName: "Kenya" },
  { iso2: "GB", labelPt: "Reino Unido", labelEn: "United Kingdom", apiName: "United Kingdom" },
  { iso2: "FR", labelPt: "França", labelEn: "France", apiName: "France" },
  { iso2: "DE", labelPt: "Alemanha", labelEn: "Germany", apiName: "Germany" },
  { iso2: "ES", labelPt: "Espanha", labelEn: "Spain", apiName: "Spain" },
  { iso2: "IT", labelPt: "Itália", labelEn: "Italy", apiName: "Italy" },
  { iso2: "RU", labelPt: "Rússia", labelEn: "Russia", apiName: "Russia" },
  { iso2: "SA", labelPt: "Arábia Saudita", labelEn: "Saudi Arabia", apiName: "Saudi Arabia" },
  { iso2: "PK", labelPt: "Paquistão", labelEn: "Pakistan", apiName: "Pakistan" },
  { iso2: "BD", labelPt: "Bangladesh", labelEn: "Bangladesh", apiName: "Bangladesh" },
  { iso2: "TH", labelPt: "Tailândia", labelEn: "Thailand", apiName: "Thailand" },
  { iso2: "VN", labelPt: "Vietnã", labelEn: "Vietnam", apiName: "Vietnam" },
];

// Choose an appropriate weather icon based on the Open‑Meteo weather code.
function iconForWeather(key, isDay) {
  if (key === "clear") return isDay ? Sun : CloudSun;
  if (["mostlyClear", "partlyCloudy"].includes(key)) return CloudSun;
  if (key === "overcast") return Cloud;
  if (key === "fog") return CloudFog;
  if (["drizzle", "freezingDrizzle"].includes(key)) return CloudDrizzle;
  if (["rain", "freezingRain", "showers"].includes(key)) return CloudRain;
  if (["snow", "snowShowers"].includes(key)) return Snowflake;
  if (["thunderstorm", "thunderstormHail"].includes(key)) return CloudLightning;
  return Cloud;
}

/**
 * A page that allows the user to drill down from a country to a state/province
 * and then to a city. Once a city is selected, it fetches live weather data
 * from the Open‑Meteo API. The country list uses the same 30 countries
 * defined in elNinoData.js. States and cities are loaded on demand from the
 * public countriesnow.space API, so that the app does not embed thousands
 * of city names and remains lightweight.
 */
export default function LocalWeather() {
  const { language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const availableCountries = AVAILABLE_COUNTRIES;
  const selectedCountryData = availableCountries.find((country) => country.apiName === selectedCountry);

  // When the user selects a country, fetch its states/provinces.
  useEffect(() => {
    if (!selectedCountry) {
      setStatesList([]);
      setSelectedState("");
      setCitiesList([]);
      setSelectedCity("");
      return;
    }
    async function fetchStates() {
      setLoadingStates(true);
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry }),
        });
        const json = await res.json();
        if (json?.data?.states) {
          // Some APIs use "states", others "states" as an array of objects with "name".
          const states =
            Array.isArray(json.data.states) && json.data.states.length > 0
              ? json.data.states.map((s) => (typeof s === "string" ? s : s.name))
              : [];
          setStatesList(states);
        } else {
          setStatesList([]);
        }
      } catch (err) {
        console.error("Failed to load states", err);
        setStatesList([]);
      } finally {
        setLoadingStates(false);
        setSelectedState("");
        setCitiesList([]);
        setSelectedCity("");
        setWeather(null);
      }
    }
    fetchStates();
  }, [selectedCountry]);

  // When the user selects a state, fetch its cities.
  useEffect(() => {
    if (!selectedCountry || !selectedState) {
      setCitiesList([]);
      setSelectedCity("");
      return;
    }
    async function fetchCities() {
      setLoadingCities(true);
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry, state: selectedState }),
        });
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
          setCitiesList(json.data);
        } else {
          setCitiesList([]);
        }
      } catch (err) {
        console.error("Failed to load cities", err);
        setCitiesList([]);
      } finally {
        setLoadingCities(false);
        setSelectedCity("");
        setWeather(null);
      }
    }
    fetchCities();
  }, [selectedCountry, selectedState]);

  // When the user selects a city, fetch its weather using Open‑Meteo.
  useEffect(() => {
    if (!selectedCity || !selectedCountry) {
      setWeather(null);
      return;
    }
    async function fetchWeather() {
      setLoadingWeather(true);
      try {
        // Determine the country code (ISO 3166 alpha‑2) from the predefined list.
        const countryCode = selectedCountryData?.iso2 || "";
        // First lookup coordinates for the selected city. Limit search to one result.
        const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        geoUrl.searchParams.set("name", selectedCity);
        geoUrl.searchParams.set("count", "20");
        geoUrl.searchParams.set("language", "en");
        geoUrl.searchParams.set("format", "json");
        const geoRes = await fetch(geoUrl.toString());
        const geoJson = await geoRes.json();
        const results = Array.isArray(geoJson?.results) ? geoJson.results : [];
        const normalizedState = selectedState.trim().toLowerCase();
        const first =
          results.find((item) => item.country_code === countryCode && String(item.admin1 || "").trim().toLowerCase() === normalizedState) ||
          results.find((item) => item.country_code === countryCode) ||
          results[0] ||
          null;
        if (!first) {
          setWeather(null);
          setLoadingWeather(false);
          return;
        }
        const { latitude, longitude, timezone, timezone_abbreviation: timezoneAbbreviation } = first;
        // Build the forecast URL similar to the live country service.
        const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
        forecastUrl.searchParams.set("latitude", latitude);
        forecastUrl.searchParams.set("longitude", longitude);
        forecastUrl.searchParams.set(
          "current",
          [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "precipitation",
            "rain",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_gusts_10m",
          ].join(",")
        );
        forecastUrl.searchParams.set(
          "daily",
          [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
          ].join(",")
        );
        forecastUrl.searchParams.set("timezone", "auto");
        forecastUrl.searchParams.set("forecast_days", "7");
        forecastUrl.searchParams.set("temperature_unit", "celsius");
        forecastUrl.searchParams.set("wind_speed_unit", "kmh");
        forecastUrl.searchParams.set("precipitation_unit", "mm");
        const foreRes = await fetch(forecastUrl.toString());
        const foreJson = await foreRes.json();
        // Normalize the response into a shape similar to the live country service.
        const dailyTimes = Array.isArray(foreJson?.daily?.time) ? foreJson.daily.time : [];
        const forecast = dailyTimes.map((date, idx) => ({
          date,
          weatherCode: foreJson.daily.weather_code?.[idx] ?? null,
          temperatureMax: foreJson.daily.temperature_2m_max?.[idx] ?? null,
          temperatureMin: foreJson.daily.temperature_2m_min?.[idx] ?? null,
          precipitationSum: foreJson.daily.precipitation_sum?.[idx] ?? null,
          precipitationProbability: foreJson.daily.precipitation_probability_max?.[idx] ?? null,
          windSpeedMax: foreJson.daily.wind_speed_10m_max?.[idx] ?? null,
        }));
        const weatherObj = {
          location: {
            name: selectedCity,
            country: selectedCountryData ? (language === "pt" ? selectedCountryData.labelPt : selectedCountryData.labelEn) : selectedCountry,
            timezone: timezone || "GMT",
            timezoneAbbreviation: timezoneAbbreviation || "GMT",
          },
          current: {
            time: foreJson.current?.time || new Date().toISOString(),
            intervalSeconds: foreJson.current?.interval || null,
            temperature: foreJson.current?.temperature_2m ?? null,
            apparentTemperature: foreJson.current?.apparent_temperature ?? null,
            humidity: foreJson.current?.relative_humidity_2m ?? null,
            precipitation: foreJson.current?.precipitation ?? null,
            rain: foreJson.current?.rain ?? null,
            weatherCode: foreJson.current?.weather_code ?? null,
            cloudCover: foreJson.current?.cloud_cover ?? null,
            windSpeed: foreJson.current?.wind_speed_10m ?? null,
            windGusts: foreJson.current?.wind_gusts_10m ?? null,
            isDay: Number(foreJson.current?.is_day) === 1,
          },
          today: forecast[0] || null,
          forecast,
        };
        setWeather(weatherObj);
      } catch (err) {
        console.error("Failed to load weather", err);
        setWeather(null);
      } finally {
        setLoadingWeather(false);
      }
    }
    fetchWeather();
  }, [selectedCity, selectedCountry, selectedCountryData, selectedState, language]);

  // Helper for formatting date strings (YYYY-MM-DD) into a more human friendly form.
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "pt" ? "pt-BR" : "en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  // Labels for both Portuguese and English. Avoiding adding new keys to the LanguageContext.
  const labels = {
    pt: {
      pageTitle: "Clima por cidade",
      pageSubtitle: "Selecione país, estado e cidade para ver o clima atual e a previsão de 7 dias.",
      selectCountry: "Selecione um país",
      selectState: "Selecione um estado ou região",
      selectCity: "Selecione uma cidade",
      loading: "Carregando…",
      noStates: "Nenhum estado encontrado.",
      noCities: "Nenhuma cidade encontrada.",
      currentConditions: "Condições atuais",
      humidity: "Umidade",
      precipitation: "Precipitação",
      wind: "Vento",
      feelsLike: "Sensação",
      highLow: "Máx. / mín.",
      forecastTitle: "Próximos 7 dias",
    },
    en: {
      pageTitle: "Local weather",
      pageSubtitle: "Select country, state and city to view current weather and a 7‑day forecast.",
      selectCountry: "Select a country",
      selectState: "Select a state or province",
      selectCity: "Select a city",
      loading: "Loading…",
      noStates: "No states found.",
      noCities: "No cities found.",
      currentConditions: "Current conditions",
      humidity: "Humidity",
      precipitation: "Precipitation",
      wind: "Wind",
      feelsLike: "Feels like",
      highLow: "High / low",
      forecastTitle: "Next 7 days",
    },
  };

  const l = labels[language] || labels.en;

  return (
    <div className="min-h-[100dvh] bg-background pt-16 pb-12">
      <div className="mx-auto w-full max-w-4xl px-4">
        <h1 className="font-display text-3xl font-bold">{l.pageTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{l.pageSubtitle}</p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="country-select" className="mb-1 block text-sm font-semibold">{l.selectCountry}</label>
            <select
              id="country-select"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value || "")}
            >
              <option value="">{l.selectCountry}</option>
              {availableCountries.map((c) => (
                <option key={c.iso2} value={c.apiName}>
                  {language === "pt" ? c.labelPt : c.labelEn}
                </option>
              ))}
            </select>
          </div>

          {selectedCountry && (
            <div>
              <label htmlFor="state-select" className="mb-1 block text-sm font-semibold">
                {l.selectState}
              </label>
              {loadingStates ? (
                <p className="text-sm text-muted-foreground">{l.loading}</p>
              ) : statesList.length > 0 ? (
                <select
                  id="state-select"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value || "")}
                >
                  <option value="">{l.selectState}</option>
                  {statesList.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground">{l.noStates}</p>
              )}
            </div>
          )}

          {selectedState && (
            <div>
              <label htmlFor="city-select" className="mb-1 block text-sm font-semibold">
                {l.selectCity}
              </label>
              {loadingCities ? (
                <p className="text-sm text-muted-foreground">{l.loading}</p>
              ) : citiesList.length > 0 ? (
                <select
                  id="city-select"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value || "")}
                >
                  <option value="">{l.selectCity}</option>
                  {citiesList.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground">{l.noCities}</p>
              )}
            </div>
          )}
        </div>

        {loadingWeather && (
          <div className="mt-8 rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">{l.loading}</p>
          </div>
        )}

        {weather && !loadingWeather && (
          <div className="mt-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    {l.currentConditions}
                  </span>
                  <span className="text-xs text-muted-foreground">{weather.location.name}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold">{weather.location.country}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  // Trigger a refresh by resetting the city; use effect will refetch.
                  const city = selectedCity;
                  setSelectedCity("");
                  setTimeout(() => setSelectedCity(city), 0);
                }}
                className="control-button"
                aria-label="Refresh"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loadingWeather ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                {(() => {
                  const key = weatherCodeKey(weather.current.weatherCode);
                  const Icon = iconForWeather(key, weather.current.isDay);
                  return <Icon className="h-9 w-9" />;
                })()}
              </span>
              <div>
                <p className="font-display text-5xl font-bold tracking-tight">
                  {roundWeatherValue(weather.current.temperature)}°C
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(() => {
                    const key = weatherCodeKey(weather.current.weatherCode);
                    const descriptions = {
                      clear: { pt: "Céu limpo", en: "Clear sky" },
                      mostlyClear: { pt: "Pred. limpo", en: "Mostly clear" },
                      partlyCloudy: { pt: "Parcial nublado", en: "Partly cloudy" },
                      overcast: { pt: "Nublado", en: "Overcast" },
                      fog: { pt: "Nevoeiro", en: "Fog" },
                      drizzle: { pt: "Garoa", en: "Drizzle" },
                      freezingDrizzle: { pt: "Garoa cong.", en: "Freezing drizzle" },
                      rain: { pt: "Chuva", en: "Rain" },
                      freezingRain: { pt: "Chuva cong.", en: "Freezing rain" },
                      snow: { pt: "Neve", en: "Snow" },
                      showers: { pt: "Pancadas", en: "Showers" },
                      snowShowers: { pt: "Pancadas neve", en: "Snow showers" },
                      thunderstorm: { pt: "Trovoada", en: "Thunderstorm" },
                      thunderstormHail: { pt: "Trovoada granizo", en: "Thunderstorm hail" },
                      unknown: { pt: "Cond. desconhecida", en: "Unknown" },
                    };
                    return (descriptions[key] ?? descriptions.unknown)[language] || descriptions.unknown.en;
                  })()}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <Thermometer className="h-4 w-4 text-primary" />
                <p className="mt-2 text-sm font-bold">
                  {roundWeatherValue(weather.current.apparentTemperature)}°C
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{l.feelsLike}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <Droplets className="h-4 w-4 text-primary" />
                <p className="mt-2 text-sm font-bold">
                  {roundWeatherValue(weather.current.humidity)}%
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{l.humidity}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <CloudRain className="h-4 w-4 text-primary" />
                <p className="mt-2 text-sm font-bold">
                  {Number(weather.current.precipitation ?? 0).toFixed(1)} mm
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{l.precipitation}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <Wind className="h-4 w-4 text-primary" />
                <p className="mt-2 text-sm font-bold">
                  {roundWeatherValue(weather.current.windSpeed)} km/h
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{l.wind}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-between gap-2 rounded-xl bg-secondary/45 px-4 py-3 text-xs text-muted-foreground">
              <span>
                {l.highLow}: {" "}
                <strong className="text-foreground">
                  {roundWeatherValue(weather.today?.temperatureMax)}° / {roundWeatherValue(weather.today?.temperatureMin)}°
                </strong>
              </span>
              <span>
                {weather.location.timezoneAbbreviation && (
                  <>
                    {weather.location.timezoneAbbreviation}
                  </>
                )}
              </span>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{l.forecastTitle}</h4>
                <span className="text-[10px] text-muted-foreground">Open‑Meteo</span>
              </div>
              <div className="scrollbar-none mt-3 flex snap-x snap-proximity gap-2 overflow-x-auto pb-2">
                {weather.forecast.map((day) => {
                  const key = weatherCodeKey(day.weatherCode);
                  const DayIcon = iconForWeather(key, true);
                  return (
                    <div key={day.date} className="min-w-[90px] snap-start rounded-2xl bg-secondary/45 p-3 text-center text-xs">
                      <p className="font-semibold">{formatDate(day.date)}</p>
                      <DayIcon className="mx-auto my-1 h-6 w-6 text-primary" />
                      <p className="font-semibold">
                        {roundWeatherValue(day.temperatureMax)}° / {roundWeatherValue(day.temperatureMin)}°
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {Number(day.precipitationProbability ?? 0).toFixed(0)}% {l.precipitation.toLowerCase()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 text-[11px] leading-5 text-muted-foreground">
              Dados meteorológicos: Open‑Meteo (CC BY 4.0)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}