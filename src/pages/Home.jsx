import React, { Suspense, lazy, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  ChevronRight,
  Database,
  Globe2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  ThermometerSun,
} from "lucide-react";
import NavBar from "@/components/elnino/NavBar";
import FilterBar from "@/components/elnino/FilterBar";
import CountryPanel from "@/components/elnino/CountryPanel";
import FooterSection from "@/components/elnino/FooterSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEnsoData } from "@/hooks/useEnsoData";
import { countries, riskColors } from "@/lib/elNinoData";
import { localizeCountries } from "@/lib/localizedContent";
import { formatAnomaly, formatDateTime, seasonLabel } from "@/lib/ensoFormat";

const WorldMap = lazy(() => import("@/components/elnino/WorldMap"));

function SectionLoader({ label = "NiñoPulse…", minHeight = 280 }) {
  return (
    <div className="mobile-section px-3" style={{ minHeight }}>
      <div
        className="surface-card grid h-full min-h-[inherit] place-items-center text-sm text-muted-foreground"
        role="status"
      >
        <span className="loading-pulse">{label}</span>
      </div>
    </div>
  );
}

function pct(value) {
  return Number.isFinite(value) ? `${value}%` : "—";
}

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [riskFilter, setRiskFilter] = useState("all");
  const [threatFilter, setThreatFilter] = useState(null);
  const [query, setQuery] = useState("");

  const { language, t } = useLanguage();
  const { data, isFallback, isFetching, refetch } = useEnsoData();

  const localizedCountries = useMemo(
    () => localizeCountries(countries, language),
    [language]
  );

  const visibleCountries = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return localizedCountries.filter((country) => {
      const riskMatch = riskFilter === "all" || country.nivelDeRisco === riskFilter;
      const threatMatch = !threatFilter || country.ameacas.includes(threatFilter);
      const queryMatch =
        !normalized ||
        `${country.nome} ${country.continente} ${country.resumoClimatico}`
          .toLowerCase()
          .includes(normalized);

      return riskMatch && threatMatch && queryMatch;
    });
  }, [localizedCountries, query, riskFilter, threatFilter]);

  const selectedSeason = data.forecast?.selectedSeason;
  const regions = data.current?.weeklySst?.regions || {};
  const nino34 = regions.nino34?.anomaly;
  const seasons = (data.forecast?.seasons || []).slice(0, 5);

  const highRiskCount = localizedCountries.filter((country) =>
    ["alto", "extremo"].includes(country.nivelDeRisco)
  ).length;

  return (
    <div className="min-h-screen bg-background mobile-home-shell">
      <NavBar />

      <main id="main-content" className="mobile-main pb-6">
        <section className="mobile-hero px-3 pt-24 sm:px-4">
          <div className="mx-auto max-w-md rounded-[2rem] border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                <Globe2 className="h-3.5 w-3.5" /> ENSO Monitor
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  isFallback
                    ? "bg-accent/10 text-accent"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isFallback ? t("common.fallback") : t("common.live")}
              </span>
            </div>

            <h1 className="mt-5 font-display text-[2.25rem] font-black leading-[0.98] tracking-tight">
              NiñoPulse <span className="gradient-text">Global</span>
            </h1>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {language === "pt"
                ? "Monitor ENSO otimizado para celular: dados oficiais, mapa interativo e cartões rápidos para consulta em sala de aula."
                : "Mobile-first ENSO monitor: official data, an interactive map and quick cards for classroom use."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MetricCard
                icon={Activity}
                label={t("hero.phase")}
                value={data.current?.phase || "—"}
              />

              <MetricCard
                icon={BarChart3}
                label={t("hero.probability")}
                value={pct(selectedSeason?.probability?.elNino)}
              />

              <MetricCard
                icon={ThermometerSun}
                label={t("hero.nino34")}
                value={formatAnomaly(nino34)}
              />

              <MetricCard
                icon={CalendarClock}
                label={t("hero.next")}
                value={data.current?.nextUpdateLabel || "—"}
              />
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <a href="#mapa" className="mobile-pill-primary">
                <MapPin className="h-4 w-4" /> {t("nav.map")}
              </a>

              <a href="#paises" className="mobile-pill">
                <Globe2 className="h-4 w-4" />{" "}
                {language === "pt" ? "Países" : "Countries"}
              </a>

              <a href="#previsao" className="mobile-pill">
                <BarChart3 className="h-4 w-4" /> ENSO
              </a>

              <Link to="/research" className="mobile-pill">
                <Database className="h-4 w-4" /> {t("nav.research")}
              </Link>
            </div>
          </div>
        </section>

        <section
          className="mobile-section px-3 pt-5 sm:px-4"
          aria-label={language === "pt" ? "Resumo rápido" : "Quick summary"}
        >
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
            <MiniStat
              value={localizedCountries.length}
              label={language === "pt" ? "países" : "countries"}
            />

            <MiniStat
              value={highRiskCount}
              label={language === "pt" ? "alto risco" : "high risk"}
            />

            <MiniStat
              value={seasonLabel(selectedSeason?.season, language).split(" · ")[0] || "—"}
              label={language === "pt" ? "janela" : "season"}
            />
          </div>
        </section>

        <section className="mobile-section px-3 pt-6 sm:px-4" id="mapa">
          <div className="mx-auto max-w-md">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="section-kicker mb-1">{t("map.layers")}</p>
                <h2 className="font-display text-2xl font-black tracking-tight">
                  {t("map.title")}
                </h2>
              </div>

              <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">
                {visibleCountries.length}
              </span>
            </div>

            <FilterBar
              riskFilter={riskFilter}
              setRiskFilter={setRiskFilter}
              threatFilter={threatFilter}
              setThreatFilter={setThreatFilter}
            />

            <div className="mobile-map-card mt-3">
              <Suspense
                fallback={
                  <SectionLoader
                    minHeight={430}
                    label={language === "pt" ? "Carregando mapa…" : "Loading map…"}
                  />
                }
              >
                <WorldMap
                  riskFilter={riskFilter}
                  threatFilter={threatFilter}
                  onCountryClick={setSelectedCountry}
                />
              </Suspense>
            </div>

            <p className="mt-3 rounded-2xl bg-secondary/60 p-3 text-xs leading-5 text-muted-foreground">
              {language === "pt"
                ? "Dica: toque no mapa para ativar movimento e zoom. Use tela cheia se quiser explorar com mais espaço."
                : "Tip: tap the map to enable move and zoom. Use full screen for extra space."}
            </p>
          </div>
        </section>

        <section className="mobile-section px-3 pt-7 sm:px-4" id="previsao">
          <div className="mx-auto max-w-md rounded-[1.75rem] border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-kicker mb-1">NOAA/CPC</p>
                <h2 className="font-display text-2xl font-black tracking-tight">
                  {t("forecast.title")}
                </h2>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {t("forecast.explanation")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                className="control-button h-11 w-11 shrink-0 px-0"
                aria-label={t("common.refresh")}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {seasons.map((item) => (
                <div
                  key={item.season}
                  className="rounded-2xl border border-border bg-background/55 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-black">
                      {seasonLabel(item.season, language)}
                    </span>

                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-black text-primary">
                      El Niño {item.probability.elNino}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                    <Probability label="La Niña" value={item.probability.laNina} />
                    <Probability
                      label={t("forecast.neutral")}
                      value={item.probability.neutral}
                    />
                    <Probability label="El Niño" value={item.probability.elNino} primary />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mobile-section px-3 pt-7 sm:px-4" id="paises">
          <div className="mx-auto max-w-md">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="section-kicker mb-1">{t("countries.kicker")}</p>
                <h2 className="font-display text-2xl font-black tracking-tight">
                  {t("countries.title")}
                </h2>
              </div>

              <span className="shrink-0 text-xs font-bold text-muted-foreground">
                {visibleCountries.length}/{localizedCountries.length}
              </span>
            </div>

            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("countries.search")}
                className="min-h-12 w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-3 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>

            <div className="mt-3 grid gap-3">
              {visibleCountries.slice(0, 12).map((country) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => setSelectedCountry(country)}
                  className="mobile-country-card text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-black">{country.nome}</p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {country.continente}
                      </p>
                    </div>

                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black"
                      style={{
                        color: riskColors[country.nivelDeRisco],
                        backgroundColor: `${riskColors[country.nivelDeRisco]}1f`,
                      }}
                    >
                      {t(`risks.${country.nivelDeRisco}`)}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {country.impactoDoElNino}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs font-bold text-primary">
                    <span>{t("common.viewDetails")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>

            {visibleCountries.length > 12 && (
              <p className="mt-3 rounded-2xl bg-secondary/60 p-3 text-center text-xs text-muted-foreground">
                {language === "pt"
                  ? `Mostrando 12 de ${visibleCountries.length}. Use busca/filtros para refinar.`
                  : `Showing 12 of ${visibleCountries.length}. Use search/filters to refine.`}
              </p>
            )}
          </div>
        </section>

        <section className="mobile-section px-3 py-7 sm:px-4">
          <div className="mx-auto max-w-md rounded-[1.75rem] border border-border bg-card p-4 shadow-sm">
            <div className="flex gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </span>

              <div>
                <h2 className="font-display text-xl font-black">
                  {language === "pt"
                    ? "Painel pronto para avaliação"
                    : "Dashboard ready for review"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {language === "pt"
                    ? `Última atualização: ${formatDateTime(data.generatedAt, language)}. O painel prioriza dados oficiais, leitura rápida, navegação por toque e visualização interativa do risco climático.`
                    : `Last update: ${formatDateTime(data.generatedAt, language)}. The dashboard prioritizes official data, quick reading, touch navigation and interactive climate-risk visualization.`}
                </p>

                <Link
                  to="/about"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-primary"
                >
                  {t("nav.about")} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />

      {selectedCountry && (
        <CountryPanel
          country={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words font-display text-lg font-black leading-tight">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
      <p className="font-display text-lg font-black">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Probability({ label, value, primary = false }) {
  return (
    <div
      className={`rounded-xl p-2 ${
        primary ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
      }`}
    >
      <p>{label}</p>
      <p className="mt-1 text-sm font-black">{value}%</p>
    </div>
  );
}
