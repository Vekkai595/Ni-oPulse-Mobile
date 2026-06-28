import React from "react";
import { CloudRain, Coins, Droplets, Snowflake, Thermometer, Wheat } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
  pt: {
    kicker: "TELECONEXÕES GLOBAIS",
    title: "Clima, agricultura e economia", subtitle: "O ENSO altera riscos — não determina sozinho o resultado de uma safra ou de uma economia.",
    cards: [
      ["Agricultura", "Mudanças de chuva e calor afetam calendário de plantio, produtividade, irrigação e preços de alimentos.", Wheat],
      ["Recursos hídricos", "Secas pressionam reservatórios e energia hidrelétrica; chuva extrema aumenta perdas e custos de infraestrutura.", Droplets],
      ["Cadeias produtivas", "Pesca, transporte, seguros e commodities podem reagir a eventos fortes e impactos regionais.", Coins],
    ],
    warm: "El Niño desloca águas quentes e reorganiza a circulação atmosférica, favorecendo seca em algumas regiões e chuva intensa em outras.",
    cold: "La Niña resfria o Pacífico equatorial central e leste, frequentemente invertendo parte dos padrões associados ao El Niño.",
  },
  en: {
    kicker: "GLOBAL TELECONNECTIONS",
    title: "Climate, agriculture and the economy", subtitle: "ENSO changes risk; it does not determine a harvest or an economy by itself.",
    cards: [
      ["Agriculture", "Rainfall and heat shifts affect planting calendars, yields, irrigation and food prices.", Wheat],
      ["Water resources", "Drought pressures reservoirs and hydropower; extreme rain increases infrastructure damage and cost.", Droplets],
      ["Supply chains", "Fisheries, transport, insurance and commodities may respond to strong events and regional disruption.", Coins],
    ],
    warm: "El Niño shifts warm water and reorganizes atmospheric circulation, favoring drought in some regions and intense rain in others.",
    cold: "La Niña cools the central and eastern equatorial Pacific, often reversing part of the patterns linked to El Niño.",
  },
};

export default function ImpactEconomySection() {
  const { language } = useLanguage();
  const c = content[language];
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-8 max-w-3xl"><p className="section-kicker">{c.kicker}</p><h2 className="section-title">{c.title}</h2><p className="section-description">{c.subtitle}</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">{c.cards.map(([title, text, Icon]) => <article key={title} className="surface-card p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><h3 className="font-display font-bold">{title}</h3></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl border border-accent/25 bg-accent/10 p-6"><Thermometer className="h-7 w-7 text-accent" /><h3 className="mt-5 font-display text-2xl font-bold text-accent">El Niño</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{c.warm}</p><CloudRain className="mt-8 h-16 w-16 text-accent/20" /></article>
          <article className="rounded-3xl border border-primary/25 bg-primary/10 p-6"><Snowflake className="h-7 w-7 text-primary" /><h3 className="mt-5 font-display text-2xl font-bold text-primary">La Niña</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{c.cold}</p><CloudRain className="mt-8 h-16 w-16 text-primary/20" /></article>
        </div>
      </div>
    </section>
  );
}
