import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, CalendarDays, Database, Gauge, Loader2 } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEnsoHistory } from "@/hooks/useEnsoHistory";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HistoricalAnalytics() {
  const { data, isLoading, isFetching, isFallback } = useEnsoHistory();
  const { language, t } = useLanguage();
  const [indexKey, setIndexKey] = useState(data.primary || "roni");
  const [range, setRange] = useState("recent");
  const dataset = data.datasets?.[indexKey] || data.datasets?.[data.primary] || Object.values(data.datasets || {})[0];
  const episodes = dataset?.episodes || [];
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");

  useEffect(() => {
    if (!data.datasets?.[indexKey]) setIndexKey(data.primary || Object.keys(data.datasets || {})[0] || "oni");
  }, [data, indexKey]);

  useEffect(() => {
    if (!episodes.length) return;
    const strongest = [...episodes].sort((a, b) => Math.abs(b.peak) - Math.abs(a.peak));
    if (!episodes.some((item) => item.id === leftId)) setLeftId(strongest[0]?.id || episodes[0].id);
    if (!episodes.some((item) => item.id === rightId)) setRightId(strongest[1]?.id || strongest[0]?.id || episodes[0].id);
  }, [episodes, leftId, rightId]);

  const chartData = useMemo(() => {
    const points = dataset?.points || [];
    if (range === "all" || !points.length) return points;
    const lastYear = points.at(-1)?.year || new Date().getUTCFullYear();
    return points.filter((point) => point.year >= lastYear - 20);
  }, [dataset, range]);

  const left = episodes.find((item) => item.id === leftId);
  const right = episodes.find((item) => item.id === rightId);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14" id="historico">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="section-kicker">{t("kicker.archive")}</p>
          <h2 className="section-title">{t("analytics.title")}</h2>
          <p className="section-description">{t("analytics.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.datasets?.roni && <button type="button" onClick={() => setIndexKey("roni")} className={`filter-chip ${indexKey === "roni" ? "filter-chip-active" : ""}`}>{t("analytics.roni")}</button>}
          {data.datasets?.oni && <button type="button" onClick={() => setIndexKey("oni")} className={`filter-chip ${indexKey === "oni" ? "filter-chip-active" : ""}`}>{t("analytics.oni")}</button>}
          <button type="button" onClick={() => setRange("recent")} className={`filter-chip ${range === "recent" ? "filter-chip-active" : ""}`}>{t("analytics.recentYears")}</button>
          <button type="button" onClick={() => setRange("all")} className={`filter-chip ${range === "all" ? "filter-chip-active" : ""}`}>{t("analytics.allYears")}</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <div className="surface-card min-w-0 p-4 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" /><h3 className="font-display font-bold">{t("analytics.chart")}</h3></div>
            <span className="text-xs text-muted-foreground">{dataset?.label || "NOAA/CPC"} · {dataset?.firstYear || "—"}–{dataset?.lastYear || "—"}</span>
          </div>
          <div className="historical-chart h-[320px] w-full sm:h-[400px]">
            {isLoading && !dataset ? (
              <div className="grid h-full place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
                  <XAxis dataKey="period" minTickGap={32} tick={{ fontSize: 10 }} tickFormatter={(value) => String(value).replace(/^([A-Z]{3})\s+/, "")} />
                  <YAxis domain={["dataMin - 0.3", "dataMax + 0.3"]} tick={{ fontSize: 11 }} unit="°" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} formatter={(value) => { const numeric = Number(value); return [`${numeric > 0 ? "+" : ""}${numeric.toFixed(1)} °C`, indexKey.toUpperCase()]; }} />
                  <ReferenceLine y={0.5} stroke="hsl(var(--accent))" strokeDasharray="4 4" opacity={0.65} />
                  <ReferenceLine y={-0.5} stroke="hsl(var(--primary))" strokeDasharray="4 4" opacity={0.65} />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive={chartData.length < 300} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          {(isFallback || data.condensed) && <p className="mt-4 rounded-xl border border-accent/25 bg-accent/10 p-3 text-xs leading-5 text-muted-foreground">{t("analytics.fallback")}</p>}
          <p className="mt-4 text-xs leading-5 text-muted-foreground">{t("analytics.note")} {isFetching ? "…" : ""}</p>
        </div>

        <div className="surface-card p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-2"><ArrowLeftRight className="h-5 w-5 text-primary" /><h3 className="font-display font-bold">{t("analytics.compare")}</h3></div>
          {episodes.length >= 1 && left && right ? (
            <>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <EventSelect value={leftId} onChange={setLeftId} episodes={episodes} />
                <span className="text-xs text-muted-foreground">VS</span>
                <EventSelect value={rightId} onChange={setRightId} episodes={episodes} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <CompareMetric icon={Gauge} label={t("analytics.peak")} left={`${left.peak > 0 ? "+" : ""}${left.peak.toFixed(1)} °C`} right={`${right.peak > 0 ? "+" : ""}${right.peak.toFixed(1)} °C`} />
                <CompareMetric icon={CalendarDays} label={t("analytics.duration")} left={`${left.duration} ${language === "pt" ? "estações" : "seasons"}`} right={`${right.duration} ${language === "pt" ? "estações" : "seasons"}`} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Impact event={left} language={language} />
                <Impact event={right} language={language} />
              </div>
            </>
          ) : <p className="rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">{t("analytics.noEpisodes")}</p>}
        </div>
      </div>
    </section>
  );
}

function EventSelect({ value, onChange, episodes }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 min-w-0 rounded-xl border border-border bg-background px-2 text-sm outline-none focus:border-primary">{episodes.map((item) => <option key={item.id} value={item.id}>{item.kind === "elNino" ? "El Niño" : "La Niña"} {item.label}</option>)}</select>;
}
function CompareMetric({ icon: Icon, label, left, right }) { return <div className="rounded-xl bg-secondary/50 p-3 text-center"><div className="mb-2 flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><Icon className="h-3 w-3" />{label}</div><div className="flex justify-between gap-2 font-display text-sm font-bold"><span>{left}</span><span>{right}</span></div></div>; }
function Impact({ event, language }) { return <div className="rounded-xl border border-border p-3"><p className="font-display text-sm font-bold text-primary">{event.kind === "elNino" ? "El Niño" : "La Niña"} {event.label}</p><p className="mt-1 text-[11px] text-muted-foreground">{event.start} → {event.end}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{language === "pt" ? event.impactPt : event.impactEn}</p></div>; }
