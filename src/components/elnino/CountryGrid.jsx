import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp, CloudRain, Droplets, Gauge, Search, Star, Thermometer, Wind } from "lucide-react";
import { countries, riskColors } from "@/lib/elNinoData";
import { localizeCountries } from "@/lib/localizedContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useLiveCountries } from "@/hooks/useLiveCountries";
import { roundWeatherValue, weatherCodeKey } from "@/lib/weatherCodes";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CountryGrid({ riskFilter, threatFilter, onCountryClick }) {
  const [query, setQuery] = useState("");
  const isMobile = useIsMobile();
  const initialCount = isMobile ? 6 : 12;
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const { language, t } = useLanguage();
  const { favorites, toggleFavorite } = usePreferences();
  const { countryMap, isLoading, isFetching, isStale, hasLiveData } = useLiveCountries();
  const localized = useMemo(() => localizeCountries(countries, language), [language]);
  const filtered = useMemo(() => localized.filter((country) => {
    const riskMatch = riskFilter === "all" || country.nivelDeRisco === riskFilter;
    const threatMatch = !threatFilter || country.ameacas.includes(threatFilter);
    const queryMatch = country.nome.toLowerCase().includes(query.trim().toLowerCase());
    return riskMatch && threatMatch && queryMatch;
  }).sort((a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id))), [localized, riskFilter, threatFilter, query, favorites]);

  useEffect(() => {
    setVisibleCount(initialCount);
  }, [initialCount, query, riskFilter, threatFilter]);

  const visibleCountries = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <section className="mx-auto max-w-7xl px-3 py-12 sm:px-4" aria-labelledby="country-heading">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="section-kicker mb-0">{t("countries.kicker")}</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${hasLiveData && !isStale ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${hasLiveData && !isStale ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`} />
              {isLoading ? t("live.loading") : isStale ? t("live.cached") : t("live.active")}
            </span>
          </div>
          <h2 id="country-heading" className="section-title mt-2">{t("countries.title")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("countries.liveSubtitle")}</p>
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">{t("countries.search")}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("countries.search")}
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 sm:h-11 sm:text-sm"
          />
        </label>
      </div>

      <div className="mb-4 flex min-h-5 items-center justify-between gap-3 text-xs text-muted-foreground" aria-live="polite">
        <span>{filtered.length} {language === "pt" ? "países encontrados" : "countries found"}</span>
        {isFetching && hasLiveData && <span>{t("live.refreshing")}</span>}
      </div>

      {filtered.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCountries.map((country, index) => {
              const color = riskColors[country.nivelDeRisco];
              const favorite = favorites.includes(country.id);
              const live = countryMap[country.id];
              const condition = live ? t(`weather.${weatherCodeKey(live.current.weatherCode)}`) : t("live.unavailable");
              return (
                <motion.article
                  key={country.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: Math.min(index * 0.015, 0.12) }}
                  className="group surface-card overflow-hidden transition hover:border-primary/30 hover:shadow-lg motion-safe:hover:-translate-y-0.5"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => onCountryClick(country)} className="min-w-0 flex-1 rounded-lg text-left">
                        <h3 className="truncate font-display text-lg font-bold group-hover:text-primary">{country.nome}</h3>
                        <p className="truncate text-xs text-muted-foreground">{live?.location?.name || country.continente}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(country.id)}
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition active:scale-95 ${favorite ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                        aria-label={favorite ? t("common.removeFavorite") : t("common.favorite")}
                        aria-pressed={favorite}
                      >
                        <Star className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <button type="button" onClick={() => onCountryClick(country)} className="mt-4 w-full rounded-xl text-left">
                      {live ? (
                        <>
                          <div className="flex items-end justify-between gap-4">
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"><Gauge className="h-3.5 w-3.5" />{t("live.now")}</p>
                              <p className="mt-1 font-display text-4xl font-bold tracking-tight">{roundWeatherValue(live.current.temperature)}°</p>
                              <p className="mt-1 truncate text-sm text-muted-foreground">{condition}</p>
                            </div>
                            <div className="shrink-0 text-right text-xs text-muted-foreground">
                              <p>{t("live.highLow")}</p>
                              <p className="mt-1 font-semibold text-foreground">{roundWeatherValue(live.today?.temperatureMax)}° / {roundWeatherValue(live.today?.temperatureMin)}°</p>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <LiveMetric icon={Droplets} value={`${roundWeatherValue(live.current.humidity)}%`} label={t("live.humidity")} />
                            <LiveMetric icon={CloudRain} value={`${Number(live.current.precipitation ?? 0).toFixed(1)} mm`} label={t("live.precipitation")} />
                            <LiveMetric icon={Wind} value={`${roundWeatherValue(live.current.windSpeed)} km/h`} label={t("live.wind")} />
                          </div>
                        </>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold"><Thermometer className="h-4 w-4 text-primary" />{isLoading ? t("live.loading") : t("live.unavailable")}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("live.retryNote")}</p>
                        </div>
                      )}

                      <div className="mt-4 border-t border-border pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("live.historicalContext")}</span>
                          <span className="inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ color, backgroundColor: `${color}1f` }}>{t(`risks.${country.nivelDeRisco}`)}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{country.impactoDoElNino}</p>
                      </div>
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {filtered.length > initialCount && (
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                className="secondary-action min-w-48"
                onClick={() => setVisibleCount(hasMore ? Math.min(visibleCount + initialCount, filtered.length) : initialCount)}
              >
                {hasMore ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                {hasMore
                  ? (language === "pt" ? `Mostrar mais (${filtered.length - visibleCount})` : `Show more (${filtered.length - visibleCount})`)
                  : (language === "pt" ? "Mostrar menos" : "Show less")}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="surface-card grid min-h-48 place-items-center p-8 text-center text-muted-foreground"><div><AlertTriangle className="mx-auto mb-3 h-6 w-6" /><p>{t("countries.empty")}</p></div></div>
      )}
    </section>
  );
}

function LiveMetric({ icon: Icon, value, label }) {
  return (
    <div className="min-w-0 rounded-xl bg-secondary/55 p-2.5">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <p className="mt-1 truncate text-xs font-bold">{value}</p>
      <p className="mt-0.5 line-clamp-2 min-h-6 text-[9px] uppercase leading-3 tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
