import React from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, ArrowRight, CalendarClock, Database, Globe2, Loader2, RefreshCw, Thermometer, WifiOff, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnsoData } from "@/hooks/useEnsoData";
import { formatAnomaly, formatDate, formatDateTime, seasonLabel } from "@/lib/ensoFormat";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HeroSection() {
  const { language, t } = useLanguage();
  const { data, isLoading, isFetching, isError, isFallback, configurationError, refetch } = useEnsoData();
  const current = data.current;
  const forecast = data.forecast?.selectedSeason;
  const isStale = data.stale || isFallback || isError;
  const nino34 = current?.weeklySst?.regions?.nino34?.anomaly;

  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:pb-16 sm:pt-32">
      <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="absolute left-1/2 top-14 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl sm:h-[32rem] sm:w-[32rem]" aria-hidden="true" />
      <div id="ninopulse-share-card" className="relative mx-auto max-w-7xl rounded-[2rem] p-1">
        {configurationError && (
          <div className="mx-auto mb-5 flex max-w-4xl items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-left text-sm text-muted-foreground">
            <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <p><strong className="text-foreground">Android API:</strong> {t("hero.apiConfig")}</p>
          </div>
        )}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 text-xs shadow-sm backdrop-blur-xl sm:px-4">
            {isLoading || isFetching ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : isStale ? <WifiOff className="h-4 w-4 text-accent" /> : <Database className="h-4 w-4 text-primary" />}
            <span className={isStale ? "font-medium text-accent" : "font-medium text-primary"}>{isStale ? t("common.fallback") : t("common.live")}</span>
            <span className="hidden text-muted-foreground sm:inline">•</span>
            <span className="text-muted-foreground">{t("common.updated")}: {formatDateTime(data.generatedAt, language)}</span>
            <button type="button" onClick={() => refetch()} disabled={isFetching} className="rounded-full p-1 hover:bg-secondary disabled:opacity-50" aria-label={t("common.refresh")} title={t("common.refresh")}>
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t("hero.eyebrow")}</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-balance font-display text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {t("hero.titleA")} <span className="gradient-text">{t("hero.titleB")}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">{t("hero.description")}</motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#mapa" className="primary-action">{t("hero.explore")} <ArrowRight className="h-4 w-4" /></a>
            <Link to="/research" className="secondary-action">{t("hero.research")} <Activity className="h-4 w-4" /></Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard icon={Globe2} label={t("hero.phase")} value={current?.phase || "ENSO"} detail={language === "pt" ? current?.alertStatusPt : current?.alertStatus} accent="primary" />
          <StatusCard icon={AlertTriangle} label={t("hero.probability")} value={forecast ? `${forecast.probability.elNino}%` : "—"} detail={forecast ? seasonLabel(forecast.season, language) : "NOAA/CPC"} accent="accent" />
          <StatusCard icon={Thermometer} label={t("hero.nino34")} value={formatAnomaly(nino34)} detail={formatDate(current?.weeklySst?.date, {}, language)} accent="chart-5" />
          <StatusCard icon={CalendarClock} label={t("hero.next")} value={formatDate(current?.nextUpdate, {}, language)} detail="NOAA ENSO Discussion" accent="chart-2" />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mx-auto mt-5 max-w-5xl rounded-2xl border border-border bg-card/60 p-4 text-left shadow-sm backdrop-blur-lg sm:p-5">
          <div className="flex items-start gap-3">
            <Activity className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("hero.bulletin")}</p>
              <p className="mt-1 text-sm leading-6 text-foreground/90">{current?.synopsis || "NOAA bulletin unavailable."}</p>
              {current?.issuedAt && <p className="mt-2 text-xs text-muted-foreground">{t("hero.issued")} {formatDate(current.issuedAt, {}, language)}</p>}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatusCard({ icon: Icon, label, value, detail, accent }) {
  const accentClass = { primary: "text-primary", accent: "text-accent", "chart-5": "text-chart-5", "chart-2": "text-chart-2" }[accent] || "text-primary";
  return (
    <div className="metric-card">
      <div className={`mb-3 flex items-center gap-2 ${accentClass}`}>
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-xl font-bold leading-tight">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail || "—"}</p>
    </div>
  );
}
