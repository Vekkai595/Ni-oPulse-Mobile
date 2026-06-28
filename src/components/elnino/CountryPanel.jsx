import React, { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets,
  Gauge, MapPin, RefreshCw, Snowflake, Star, Sun, Thermometer, Wheat, Wind, X,
} from "lucide-react";
import { riskColors } from "@/lib/elNinoData";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useEnsoData } from "@/hooks/useEnsoData";
import { useLiveCountries } from "@/hooks/useLiveCountries";
import { getCountryScenario } from "@/lib/countryOutlook";
import { formatCountryLocalTime, roundWeatherValue, weatherCodeKey } from "@/lib/weatherCodes";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CountryPanel({ country, onClose }) {
  const { language, t } = useLanguage();
  const isMobile = useIsMobile();
  const { data } = useEnsoData();
  const { countryMap, isFetching, isStale, refetch } = useLiveCountries();
  const { isFavorite, toggleFavorite, alertSettings, setAlertSettings } = usePreferences();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const scenario = useMemo(() => getCountryScenario(country, data, language), [country, data, language]);
  const live = country ? countryMap[country.id] : null;

  useEffect(() => {
    if (!country) return undefined;
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = () => [...(dialog?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || [])].filter((element) => !element.disabled);
    focusable()[0]?.focus();

    const handler = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const firstItem = items[0];
      const lastItem = items.at(-1);
      if (event.shiftKey && document.activeElement === firstItem) { event.preventDefault(); lastItem.focus(); }
      else if (!event.shiftKey && document.activeElement === lastItem) { event.preventDefault(); firstItem.focus(); }
    };
    const onNativeBack = (event) => {
      event.detail.handled = true;
      onClose();
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("ninopulse:native-back", onNativeBack);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handler);
      window.removeEventListener("ninopulse:native-back", onNativeBack);
      previousFocusRef.current?.focus?.();
    };
  }, [country, onClose]);

  if (!country) return null;
  const color = riskColors[country.nivelDeRisco];
  const favorite = isFavorite(country.id);
  const countryAlert = alertSettings.countries.includes(country.id);

  function toggleCountryAlert() {
    setAlertSettings((current) => ({ ...current, countries: countryAlert ? current.countries.filter((id) => id !== country.id) : [...current.countries, country.id] }));
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[1600] bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-panel-title"
        initial={isMobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 }}
        animate={{ x: 0, y: 0 }}
        exit={isMobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className={isMobile
          ? "fixed inset-x-0 bottom-0 z-[1700] max-h-[min(96dvh,var(--app-height))] w-full overflow-y-auto overscroll-contain rounded-t-3xl border-t border-border bg-background shadow-2xl"
          : "fixed inset-y-0 right-0 z-[1700] w-full max-w-xl overflow-y-auto overscroll-contain border-l border-border bg-background shadow-2xl"}
      >
        <div className="sheet-header">
          {isMobile && <div className="flex justify-center pt-2"><span className="h-1.5 w-12 rounded-full bg-muted-foreground/25" /></div>}
          <div className="flex items-center justify-end gap-2 p-3">
            <button type="button" onClick={() => toggleFavorite(country.id)} className={`control-button min-w-11 ${favorite ? "text-primary" : ""}`} aria-pressed={favorite}><Star className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} /><span className="hidden min-[390px]:inline">{favorite ? t("common.removeFavorite") : t("common.favorite")}</span></button>
            <button type="button" onClick={toggleCountryAlert} className={`control-button h-11 w-11 px-0 ${countryAlert ? "text-primary" : ""}`} aria-label={t("panel.alert")} title={t("panel.alert")} aria-pressed={countryAlert}><Bell className={`h-4 w-4 ${countryAlert ? "fill-current" : ""}`} /></button>
            <button type="button" onClick={onClose} className="control-button h-11 w-11 px-0" aria-label={t("common.close")}><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="safe-bottom p-4 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="country-panel-title" className="font-display text-3xl font-bold sm:text-4xl">{country.nome}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{country.continente}</p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ color, backgroundColor: `${color}1f` }}>{t(`risks.${country.nivelDeRisco}`)}</span>
          </div>

          <LiveWeatherSection live={live} isFetching={isFetching} isStale={isStale} refetch={refetch} language={language} t={t} />

          <div className="mt-8 border-t border-border pt-7">
            <p className="section-kicker">{t("live.historicalContext")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniMetric label={t("panel.risk")} value={t(`risks.${country.nivelDeRisco}`)} />
              <MiniMetric label={t("panel.confidence")} value={country.confianca} />
            </div>

            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wider text-primary">{t("panel.currentScenario")}</p><span className="rounded-full bg-background/70 px-2.5 py-1 text-xs font-bold">{scenario.probability}%</span></div>
              <p className="mt-2 font-display text-lg font-bold">{scenario.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{scenario.summary}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{t("panel.scenarioSignal")}</span><strong className="text-foreground">{scenario.signal}/100</strong></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${scenario.signal}%` }} /></div>
              <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{scenario.disclaimer}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">{country.ameacas.map((threat) => <span key={threat} className="rounded-lg bg-secondary px-2.5 py-1.5 text-xs">{t(`threats.${threat}`)}</span>)}</div>

            <div className="mt-8 space-y-7">
              <TextBlock title={t("panel.climate")} text={country.resumoClimatico} />
              <TextBlock title={t("panel.impact")} text={country.impactoDoElNino} />
              <TextBlock title={t("panel.regions")} text={country.regioesAfetadas} />
              <div className="grid gap-3 sm:grid-cols-2">
                <ImpactCard icon={Wheat} title={t("panel.agriculture")} text={country.impactoNaAgricultura} />
                <ImpactCard icon={Droplets} title={t("panel.water")} text={country.impactoNaAgua} />
                <ImpactCard icon={Thermometer} title={t("panel.temperature")} text={country.impactoNaTemperatura} />
                <ImpactCard icon={CloudRain} title={t("panel.rain")} text={country.impactoNasChuvas} />
              </div>
            </div>

            <p className="mt-8 rounded-xl border border-accent/25 bg-accent/10 p-4 text-xs leading-5 text-muted-foreground">⚠️ {t("panel.warning")}</p>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function LiveWeatherSection({ live, isFetching, isStale, refetch, language, t }) {
  if (!live) {
    return (
      <section className="mt-6 rounded-2xl border border-dashed border-border bg-secondary/30 p-5">
        <div className="flex items-center gap-2"><Gauge className="h-5 w-5 text-primary" /><h3 className="font-display text-xl font-bold">{t("live.currentConditions")}</h3></div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{t("live.unavailableLong")}</p>
        <button type="button" onClick={() => refetch()} className="control-button mt-4"><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />{t("common.refresh")}</button>
      </section>
    );
  }

  const weatherKey = weatherCodeKey(live.current.weatherCode);
  const WeatherIcon = iconForWeather(weatherKey, live.current.isDay);
  const locationName = language === "en" ? (live.location.nameEn || live.location.name) : live.location.name;

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-background">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${isStale ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"}`}><span className={`h-1.5 w-1.5 rounded-full ${isStale ? "bg-amber-500" : "animate-pulse bg-emerald-500"}`} />{isStale ? t("live.cached") : t("live.active")}</span>
              <span className="text-xs text-muted-foreground">{locationName}</span>
            </div>
            <h3 className="mt-3 font-display text-xl font-bold">{t("live.currentConditions")}</h3>
          </div>
          <button type="button" onClick={() => refetch()} className="control-button" aria-label={t("common.refresh")} title={t("common.refresh")}><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /></button>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><WeatherIcon className="h-9 w-9" /></span>
          <div>
            <p className="font-display text-5xl font-bold tracking-tight">{roundWeatherValue(live.current.temperature)}°C</p>
            <p className="mt-1 text-sm text-muted-foreground">{t(`weather.${weatherKey}`)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <LiveDetail icon={Thermometer} label={t("live.feelsLike")} value={`${roundWeatherValue(live.current.apparentTemperature)}°C`} />
          <LiveDetail icon={Droplets} label={t("live.humidity")} value={`${roundWeatherValue(live.current.humidity)}%`} />
          <LiveDetail icon={CloudRain} label={t("live.precipitation")} value={`${Number(live.current.precipitation ?? 0).toFixed(1)} mm`} />
          <LiveDetail icon={Wind} label={t("live.wind")} value={`${roundWeatherValue(live.current.windSpeed)} km/h`} />
        </div>

        <div className="mt-5 flex flex-wrap justify-between gap-2 rounded-xl bg-secondary/45 px-4 py-3 text-xs text-muted-foreground">
          <span>{t("live.localUpdate")}: <strong className="text-foreground">{formatCountryLocalTime(live.current.time)} {live.location.timezoneAbbreviation}</strong></span>
          <span>{t("live.highLow")}: <strong className="text-foreground">{roundWeatherValue(live.today?.temperatureMax)}° / {roundWeatherValue(live.today?.temperatureMin)}°</strong></span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3"><h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("live.sevenDayForecast")}</h4><span className="text-[10px] text-muted-foreground">Open-Meteo</span></div>
          <div className="scrollbar-none mt-3 flex snap-x snap-proximity gap-2 overflow-x-auto pb-2 overscroll-x-contain">
            {live.forecast.map((day) => <ForecastDay key={day.date} day={day} language={language} t={t} />)}
          </div>
        </div>

        <p className="mt-5 text-[11px] leading-5 text-muted-foreground">{t("live.representativeNote")}</p>
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">{t("live.sourceAttribution")}</a>
      </div>
    </section>
  );
}

function ForecastDay({ day, language, t }) {
  const key = weatherCodeKey(day.weatherCode);
  const Icon = iconForWeather(key, true);
  const date = new Date(`${day.date}T12:00:00`);
  const label = new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en-US", { weekday: "short", day: "2-digit" }).format(date);
  return (
    <div className="min-w-[105px] snap-start rounded-2xl border border-border bg-background/70 p-3 text-center">
      <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
      <Icon className="mx-auto mt-2 h-5 w-5 text-primary" />
      <p className="mt-2 text-xs font-bold">{roundWeatherValue(day.temperatureMax)}° / {roundWeatherValue(day.temperatureMin)}°</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{roundWeatherValue(day.precipitationProbability)}% {t("live.rainChance")}</p>
    </div>
  );
}

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

function LiveDetail({ icon: Icon, label, value }) { return <div className="rounded-xl border border-border bg-background/60 p-3"><Icon className="h-4 w-4 text-primary" /><p className="mt-2 text-sm font-bold">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p></div>; }
function MiniMetric({ label, value }) { return <div className="rounded-xl border border-border bg-card p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-display text-lg font-bold">{value}</p></div>; }
function TextBlock({ title, text }) { return <section><h3 className="text-xs font-bold uppercase tracking-widest text-primary">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></section>; }
function ImpactCard({ icon: Icon, title, text }) { return <div className="surface-card p-4"><div className="flex items-center gap-2 text-primary"><Icon className="h-4 w-4" /><h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p></div>; }
