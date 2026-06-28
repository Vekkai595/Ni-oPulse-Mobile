import React, { useMemo } from "react";
import { Bell, LayoutDashboard, Star } from "lucide-react";
import { countries } from "@/lib/elNinoData";
import { localizeCountries } from "@/lib/localizedContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useEnsoData } from "@/hooks/useEnsoData";
import { getCountryScenario } from "@/lib/countryOutlook";

export default function FavoritesDashboard({ onCountryClick }) {
  const { language, t } = useLanguage();
  const { data } = useEnsoData();
  const { favorites, alertSettings } = usePreferences();
  const items = useMemo(() => localizeCountries(countries, language).filter((country) => favorites.includes(country.id)), [favorites, language]);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="surface-card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2"><LayoutDashboard className="h-5 w-5 text-primary" /><h2 className="font-display text-xl font-bold">{language === "pt" ? "Seu dashboard" : "Your dashboard"}</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((country) => {
            const scenario = getCountryScenario(country, data, language);
            return (
              <button key={country.id} type="button" onClick={() => onCountryClick(country)} className="rounded-xl border border-border bg-background p-4 text-left transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30">
                <div className="flex items-center justify-between"><span className="font-display font-bold">{country.nome}</span><Star className="h-4 w-4 fill-primary text-primary" /></div>
                <p className="mt-2 text-xs text-muted-foreground">{scenario.label}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${scenario.signal}%` }} /></div>
                {alertSettings.countries.includes(country.id) && <p className="mt-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary"><Bell className="h-3 w-3" />{t("common.alertConfigured")}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
