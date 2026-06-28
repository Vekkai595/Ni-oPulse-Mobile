import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink, Info, Snowflake, Thermometer, Waves } from "lucide-react";
import { useEnsoData } from "@/hooks/useEnsoData";
import { formatDate, seasonLabel } from "@/lib/ensoFormat";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ENSOProbability() {
  const { data } = useEnsoData();
  const { language, t } = useLanguage();
  const seasons = data.forecast?.seasons || [];
  const [selectedCode, setSelectedCode] = useState(seasons[0]?.season || "");

  useEffect(() => {
    if (!seasons.some((season) => season.season === selectedCode)) setSelectedCode(seasons[0]?.season || "");
  }, [seasons, selectedCode]);

  const selected = useMemo(() => seasons.find((season) => season.season === selectedCode) || seasons[0], [seasons, selectedCode]);
  const source = data.sources?.find((item) => item.name.includes("Strength Probabilities"));
  const phases = [
    { name: "El Niño", value: selected?.probability?.elNino ?? 0, icon: Thermometer, className: "bg-accent" },
    { name: t("forecast.neutral"), value: selected?.probability?.neutral ?? 0, icon: Waves, className: "bg-primary" },
    { name: "La Niña", value: selected?.probability?.laNina ?? 0, icon: Snowflake, className: "bg-chart-2" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14" id="probabilidade">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <p className="section-kicker">{t("forecast.kicker")}</p>
        <h2 className="section-title">{t("forecast.title")}</h2>
        <p className="section-description">{t("forecast.subtitle")}</p>
      </div>

      <div className="scrollbar-none mb-5 flex snap-x snap-proximity gap-2 overflow-x-auto pb-2 overscroll-x-contain md:justify-center">
        {seasons.map((season) => <button key={season.season} type="button" onClick={() => setSelectedCode(season.season)} className={`filter-chip shrink-0 ${selected?.season === season.season ? "filter-chip-active" : ""}`}>{seasonLabel(season.season, language)}</button>)}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {phases.map(({ name, value, icon: Icon, className }) => (
          <article key={name} className="surface-card p-5 sm:p-6">
            <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary"><Icon className="h-5 w-5" /></span><span className="font-display text-4xl font-bold">{value}%</span></div>
            <h3 className="mt-5 font-display text-lg font-bold">{name}</h3>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${className}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
          </article>
        ))}
      </div>

      {selected?.strength?.elNino && (
        <div className="surface-card mt-5 p-5 sm:p-6">
          <h3 className="font-display font-bold">{t("forecast.intensity")} · {seasonLabel(selected.season, language)}</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Strength label={t("forecast.weak")} value={selected.strength.elNino.weak} />
            <Strength label={t("forecast.moderate")} value={selected.strength.elNino.moderate} />
            <Strength label={t("forecast.strong")} value={selected.strength.elNino.strong} />
            <Strength label={t("forecast.veryStrong")} value={selected.strength.elNino.veryStrong} />
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start">
        <Info className="h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1"><h3 className="font-display font-bold">{t("forecast.interpretation")}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("forecast.explanation")}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>{t("forecast.issued")}: {formatDate(data.forecast?.issuedAt, {}, language)}</span>{source?.url && <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{t("forecast.open")} <ExternalLink className="h-3 w-3" /></a>}</div></div>
      </div>
    </section>
  );
}

function Strength({ label, value }) { return <div className="rounded-xl bg-secondary/50 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold">{value ?? 0}%</p></div>; }
