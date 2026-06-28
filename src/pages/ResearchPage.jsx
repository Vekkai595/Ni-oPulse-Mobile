import React from "react";
import { Activity, Database, ExternalLink, Gauge, ShieldCheck, Thermometer } from "lucide-react";
import NavBar from "@/components/elnino/NavBar";
import FooterSection from "@/components/elnino/FooterSection";
import ResearchTools from "@/components/elnino/ResearchTools";
import { useEnsoData } from "@/hooks/useEnsoData";
import { useLanguage } from "@/contexts/LanguageContext";
import { cadenceLabel, formatAnomaly, formatDateTime, seasonLabel } from "@/lib/ensoFormat";

export default function ResearchPage() {
  const { data, isFallback } = useEnsoData();
  const { language, t } = useLanguage();
  const regions = data.current?.weeklySst?.regions || {};

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main id="main-content" className="pb-12 pt-28">
        <header className="mx-auto max-w-7xl px-3 sm:px-4">
          <p className="section-kicker">{t("kicker.technical")}</p>
          <h1 className="section-title text-4xl sm:text-6xl">{t("research.title")}</h1>
          <p className="section-description max-w-3xl">{t("research.subtitle")}</p>
        </header>

        <section className="mx-auto mt-10 grid max-w-7xl gap-4 px-3 sm:grid-cols-2 sm:px-4 lg:grid-cols-4">
          <ResearchMetric icon={Activity} label={t("research.current")} value={data.current?.phase || "—"} />
          <ResearchMetric icon={Thermometer} label="Niño 3.4" value={formatAnomaly(regions.nino34?.anomaly)} />
          <ResearchMetric icon={Gauge} label={seasonLabel(data.forecast?.selectedSeason?.season, language)} value={`${data.forecast?.selectedSeason?.probability?.elNino ?? "—"}%`} />
          <ResearchMetric icon={Database} label={t("research.freshness")} value={isFallback ? t("research.fallbackLabel") : formatDateTime(data.generatedAt, language)} />
        </section>

        <section className="mx-auto mt-6 grid max-w-7xl gap-5 px-3 sm:px-4 lg:grid-cols-2">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border p-5"><h2 className="font-display text-xl font-bold">{t("research.anomalies")}</h2></div>
            <div className="responsive-table-wrapper">
              <table className="data-table responsive-data-table">
                <thead><tr><th>{t("research.region")}</th><th>SST</th><th>{t("research.anomaly")}</th></tr></thead>
                <tbody>
                  {Object.entries(regions).map(([key, value]) => (
                    <tr key={key}>
                      <td data-label={t("research.region")}>{key.replace("nino", "Niño ")}</td>
                      <td data-label="SST">{Number.isFinite(value.sst) ? `${value.sst.toFixed(1)} °C` : "—"}</td>
                      <td data-label={t("research.anomaly")}>{formatAnomaly(value.anomaly)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="border-b border-border p-5"><h2 className="font-display text-xl font-bold">{t("research.probabilities")}</h2></div>
            <div className="responsive-table-wrapper max-h-[420px]">
              <table className="data-table responsive-data-table">
                <thead><tr><th>{t("research.season")}</th><th>{t("research.laNina")}</th><th>{t("research.neutral")}</th><th>{t("research.elNino")}</th></tr></thead>
                <tbody>
                  {(data.forecast?.seasons || []).map((item) => (
                    <tr key={item.season}>
                      <td data-label={t("research.season")}>{seasonLabel(item.season, language)}</td>
                      <td data-label={t("research.laNina")}>{item.probability.laNina}%</td>
                      <td data-label={t("research.neutral")}>{item.probability.neutral}%</td>
                      <td data-label={t("research.elNino")} className="font-bold text-primary">{item.probability.elNino}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-6 max-w-7xl px-3 sm:px-4">
          <div className="surface-card p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="font-display text-xl font-bold">{t("research.provenance")}</h2></div>
            <div className="grid gap-3 md:grid-cols-3">
              {(data.sources || []).map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border p-4 transition hover:border-primary/40">
                  <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-bold">{source.name}</h3><ExternalLink className="h-4 w-4 shrink-0 text-primary" /></div>
                  <p className="mt-3 text-xs text-muted-foreground">{t("research.availability")}: {source.available ? "OK" : t("research.fallbackLabel")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("research.cadence")}: {cadenceLabel(source.cadence, language)}</p>
                </a>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-secondary/50 p-4 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">{t("research.methodology")}:</strong> {t("research.methodologyText")}</div>
          </div>
        </section>

        <ResearchTools />
      </main>
      <FooterSection />
    </div>
  );
}

function ResearchMetric({ icon: Icon, label, value }) {
  return <div className="metric-card"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 break-words font-display text-xl font-bold">{value}</p></div>;
}
