import { Activity, CalendarDays, Clock3, Cloud, CloudRain, CloudSun, Droplets, House, MapPin, Moon, Snowflake, Star, Sun, Thermometer, Wind } from "lucide-react";
import { FAVORITES_LIMIT, usePlaces } from "@/contexts/PlacesContext";
import { useLocalWeather } from "@/hooks/useLocalWeather";
import { useOnline } from "@/hooks/useOnline";
import { weatherCodeKey } from "@/lib/weatherCodes";
import { compareForecast, instant, localTime, metric, placeRegion, weatherSnapshots, WEATHER_SOURCE, WEATHER_TTL } from "@/lib/weather";
import PlaceSearch from "@/components/pulse/PlaceSearch";
import { Note, PageHeading, Refresh, SectionTitle, SourceLink, useCopy } from "@/components/pulse/ui";
import { FollowChanges } from "@/components/pulse/WatchMonitor";

function WeatherIcon({ code, isDay = true, size = 21 }) {
  const key = weatherCodeKey(code);
  const Icon = key === "clear" ? (isDay ? Sun : Moon) : ["mostlyClear", "partlyCloudy"].includes(key) ? CloudSun :
    key.toLowerCase().includes("snow") ? Snowflake : /rain|drizzle|shower|thunder/i.test(key) ? CloudRain : Cloud;
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}

function WeatherHero({ place, weather, online }) {
  const { language, copy, t } = useCopy();
  const { main, favorites, setMain, toggle, forget } = usePlaces();
  const reading = weather.data?.current;
  const favorite = favorites.some(({ id }) => id === place.id);
  const label = place.device ? copy("Perto de você", "Near you") : place.name;
  const display = (value, unit) => value == null ? "—" : `${metric(value, language)}${unit}`;
  return <section className="np-panel" aria-label={copy("Condições atuais", "Current conditions")}>
    <div className="np-weather-top">
      <div>
        <p className="np-kicker"><MapPin size={15} aria-hidden="true" />{copy("CONDIÇÕES ATUAIS", "CURRENT CONDITIONS")}</p>
        <h2 className="np-place">{label}</h2>
        <p className="np-caption">{place.device ? copy("Localização aproximada", "Approximate location") : placeRegion(place, language)}</p>
      </div>
      <Refresh onClick={() => weather.refetch()} busy={weather.isFetching} disabled={!online} />
    </div>
    {reading ? <>
      <div className="np-reading"><strong>{metric(reading.temp, language)}<sup>{reading.temp == null ? "" : "°C"}</sup></strong><span><WeatherIcon code={reading.code} isDay={reading.isDay} size={29} />{t(`weather.${weatherCodeKey(reading.code)}`)}</span></div>
      <div className="np-weather-metrics">
        <span><Thermometer size={15} />{copy("Sensação", "Feels like")} <b>{display(reading.feels, "°")}</b></span>
        <span><Droplets size={15} />{copy("Umidade", "Humidity")} <b>{display(reading.humidity, "%")}</b></span>
        <span><Wind size={15} />{copy("Vento", "Wind")} <b>{display(reading.wind, " km/h")}</b></span>
      </div>
    </> : <p className="my-4 text-sm" role="status">{!online ? copy("Sem conexão e sem previsão salva.", "Offline with no saved forecast.") : weather.isError ? copy("Previsão indisponível. Tente atualizar.", "Forecast unavailable. Try refreshing.") : copy("Consultando a previsão…", "Loading the forecast…")}</p>}
    <div className="np-weather-actions">
      {place.device ? <button className="np-button" type="button" onClick={forget}>{copy("Remover localização", "Remove location")}</button> : <>
        <button className="np-button" type="button" aria-pressed={favorite} disabled={!favorite && favorites.length >= FAVORITES_LIMIT} onClick={() => toggle(place)}><Star size={15} fill={favorite ? "currentColor" : "none"} />{favorite ? copy("Favorita", "Favorited") : copy("Favoritar", "Favorite")}</button>
        {main?.id === place.id ? <span><House size={15} />{copy("Cidade principal", "Home city")}</span> : <button className="np-button" type="button" onClick={() => setMain(place)}><House size={15} />{copy("Tornar principal", "Set as home city")}</button>}
      </>}
    </div>
    <div className="np-weather-foot"><SourceLink href={WEATHER_SOURCE}>Open-Meteo</SourceLink>
      <span>{reading ? `${copy("Condição modelada", "Model conditions")} · ${localTime(reading.time, language, { hour: "2-digit", minute: "2-digit" })}` : copy("Previsão local", "Local forecast")}</span>
    </div>
  </section>;
}

function Forecast({ weather }) {
  const { copy, language, t } = useCopy();
  const temp = (value) => value == null ? "—" : `${metric(value, language)}°`;
  const rain = (value) => value == null ? "—" : `${metric(value, language)}%`;
  return <>
    <section className="np-panel">
      <SectionTitle icon={Clock3} title={copy("Previsão por hora", "Hourly forecast")} description={copy("Até 24 horas · horário local", "Up to 24 hours · local time")} />
      <ul className="np-hours" tabIndex={0} aria-label={copy("Lista das próximas horas", "List of upcoming hours")}>
        {weather.hourly.map((row, i) => <li key={`${row.time}-${i}`}>
          <time>{localTime(row.time, language, { hour: "2-digit", minute: "2-digit" })}</time>
          <span title={t(`weather.${weatherCodeKey(row.code)}`)}><WeatherIcon code={row.code} /></span><strong>{temp(row.temp)}</strong><small><Droplets size={13} />{rain(row.rain)}</small>
        </li>)}
      </ul>
    </section>
    <section className="np-panel">
      <SectionTitle icon={CalendarDays} title={copy("Próximos 7 dias", "Next 7 days")} description={copy("Mínima, máxima e chance máxima de precipitação", "Low, high and maximum precipitation chance")} />
      <ul className="np-days">{weather.daily.map((row) => <li key={row.date}><span>{localTime(row.date, language, { weekday: "short", day: "numeric", month: "short" })}</span><WeatherIcon code={row.code} /><span><Droplets size={14} />{rain(row.rain)}</span><span>{temp(row.low)} <strong>{temp(row.high)}</strong></span></li>)}</ul>
    </section>
  </>;
}

function Changes({ place, weather, stale }) {
  const { copy, language } = useCopy();
  const result = compareForecast(weather, weatherSnapshots(place));
  const hints = {
    unavailable: copy("A comparação aparece quando duas consultas cobrem os mesmos dias.", "A comparison appears once two lookups cover the same dates."),
    learning: copy("Ainda não há uma previsão salva de ontem. Atualize amanhã para comparar.", "There is no saved forecast from yesterday. Refresh tomorrow to compare."),
    incomparable: copy("Não há valores comparáveis para as mesmas datas.", "No comparable values for the same dates."),
    compared: copy("Nenhuma diferença atingiu 10 pontos percentuais na chance de precipitação ou 2 °C na máxima.", "No difference reached 10 percentage points in precipitation chance or 2 °C in the high."),
  };
  return <section className="np-panel">
    <SectionTitle icon={Activity} title={copy("O que mudou?", "What changed?")} description={copy("A previsão de ontem e a última consulta para as mesmas datas.", "Yesterday’s forecast and the latest lookup for the same dates.")} />
    {place?.device ? <Note>{copy("Escolha uma cidade para guardar previsões e comparar mudanças.", "Choose a city to save forecasts and compare changes.")}</Note> :
      stale ? <Note>{copy("Atualize a previsão para comparar com a de ontem.", "Refresh the forecast to compare with yesterday’s.")}</Note> :
        result.changes.length ? <ul className="np-changes">{result.changes.map(({ metric: key, date, before, after }) => {
          const unit = key === "rain" ? "%" : " °C";
          return <li key={`${key}-${date}`}><span>{key === "rain" ? copy("Chance de precipitação", "Precipitation chance") : copy("Temperatura máxima", "Daily high")}<small>{localTime(date, language, { day: "numeric", month: "short" })}</small></span><strong>{metric(before, language, 1)}{unit} → {metric(after, language, 1)}{unit}</strong></li>;
        })}</ul> : <Note>{hints[result.status]}</Note>}
    {result.comparedAt && !stale && <p className="np-caption">{copy("Consultas locais", "Local lookups")} · {instant(result.comparedAt, language, weather.timezone)} → {instant(weather.fetchedAt, language, weather.timezone)}</p>}
    <FollowChanges />
  </section>;
}

export default function LocalWeather() {
  const { copy, language, t } = useCopy();
  const { active, main, favorites, select } = usePlaces();
  const weather = useLocalWeather(active);
  const online = useOnline();
  const cached = weather.data;
  const stale = Boolean(cached && (!online || weather.isError || Date.now() - Date.parse(cached.fetchedAt) > 2 * WEATHER_TTL));
  const saved = [main, ...favorites.filter(({ id }) => id !== main?.id)].filter(Boolean);

  return <main className="np-content np-local-weather" id="main-content" tabIndex={-1}>
    <PageHeading title={t("nav.localWeather")} description={copy("Busque sua cidade para ver o tempo agora e a previsão dos próximos sete dias.", "Search for your city to see current conditions and the next seven days.")} />
    <PlaceSearch />
    {saved.length > 0 && <div className="np-saved"><span>{copy("Cidades salvas", "Saved cities")}</span>{saved.map((place) => <button className="np-button" key={place.id} type="button" aria-pressed={place.id === active?.id} onClick={() => select(place)}>{place.name}{place.id === main?.id && <House size={14} aria-hidden="true" />}</button>)}</div>}
    {active && (
      <div className="np-stack">
        <WeatherHero place={active} weather={weather} online={online} />
        {cached && <><p className="np-caption np-lookup" role="status">{stale ? copy("Previsão salva", "Saved forecast") : copy("Última consulta", "Last checked")} · {instant(cached.fetchedAt, language, cached.timezone)} · {cached.timezone}</p><Forecast weather={cached} /></>}
        <Changes place={active} weather={cached} stale={stale} />
      </div>
    )}
  </main>;
}
