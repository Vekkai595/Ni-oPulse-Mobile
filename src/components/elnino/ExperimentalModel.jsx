import React, { useMemo } from "react";
import { FlaskConical, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useEnsoData } from "@/hooks/useEnsoData";
import { useLanguage } from "@/contexts/LanguageContext";
import { calculateExperimentalOutlook } from "@/lib/experimentalModel";

const componentKeys = ["dataQuality", "anomalySignal", "forecastAgreement", "trendClarity"];

export default function ExperimentalModel() {
  const { data } = useEnsoData();
  const { t } = useLanguage();
  const result = useMemo(() => calculateExperimentalOutlook(data), [data]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><FlaskConical className="h-3.5 w-3.5" />{t("common.experimental")}</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{t("model.title")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{t("model.subtitle")}</p>
            <div className="mt-6 rounded-2xl border border-border bg-background/50 p-4 backdrop-blur">
              <div className="flex items-start gap-3"><SlidersHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("model.explanation")}</p><p className="mt-2 text-sm leading-6">Niño 3.4: {result.anomaly > 0 ? "+" : ""}{result.anomaly.toFixed(1)} °C · El Niño: {result.first}% → {result.last}%</p></div></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {componentKeys.map((key) => (
                  <div key={key} className="rounded-xl bg-secondary/55 p-3">
                    <div className="flex items-center justify-between gap-3 text-xs"><span className="text-muted-foreground">{t(`model.${key}`)}</span><strong>{result.components[key]}</strong></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${result.components[key] / ({ dataQuality: 25, anomalySignal: 25, forecastAgreement: 30, trendClarity: 20 }[key]) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />{t("model.disclaimer")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("model.confidence")}</p>
              <div className="mt-3 flex items-end justify-between gap-4"><span className="font-display text-5xl font-bold text-primary">{result.signalIndex}</span><span className="pb-1 text-sm text-muted-foreground">/ 100</span></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${result.signalIndex}%` }} /></div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("model.outlook")}</p>
              <p className="mt-3 font-display text-2xl font-bold">{t(`model.${result.trend}`)}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Δ {result.direction > 0 ? "+" : ""}{result.direction} pp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
