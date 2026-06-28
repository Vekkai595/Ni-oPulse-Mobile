import React from "react";
import { motion } from "framer-motion";
import { CloudLightning, CloudRain, Droplets, Filter, Flame, Thermometer, Wheat, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const impactOptions = [
  { value: "seca", icon: Droplets },
  { value: "chuva intensa", icon: CloudLightning },
  { value: "enchentes", icon: CloudRain },
  { value: "calor", icon: Thermometer },
  { value: "agricultura", icon: Wheat },
  { value: "queimadas", icon: Flame },
];

export default function FilterBar({ riskFilter, setRiskFilter, threatFilter, setThreatFilter }) {
  const { t } = useLanguage();
  const hasFilters = riskFilter !== "all" || threatFilter;
  const risks = ["all", "baixo", "moderado", "alto", "extremo"];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="surface-card mb-5 p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{t("filters.title")}</span>
        {hasFilters && (
          <button type="button" onClick={() => { setRiskFilter("all"); setThreatFilter(null); }} className="ml-auto inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-3.5 w-3.5" /> {t("filters.clear")}
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("filters.risk")}</p>
          <div className="scrollbar-none flex snap-x snap-proximity gap-2 overflow-x-auto pb-1 overscroll-x-contain">
            {risks.map((risk) => (
              <button key={risk} type="button" onClick={() => setRiskFilter(risk)} className={`filter-chip ${riskFilter === risk ? "filter-chip-active" : ""}`}>
                {risk === "all" ? t("filters.all") : t(`risks.${risk}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("filters.impact")}</p>
          <div className="scrollbar-none flex snap-x snap-proximity gap-2 overflow-x-auto pb-1 overscroll-x-contain">
            {impactOptions.map(({ value, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setThreatFilter(threatFilter === value ? null : value)} className={`filter-chip ${threatFilter === value ? "filter-chip-active" : ""}`}>
                <Icon className="h-3.5 w-3.5" /> {t(`threats.${value}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
