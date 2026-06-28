import React, { useState } from "react";
import { Braces, Check, Copy, KeyRound, Server, ShieldAlert } from "lucide-react";
import NavBar from "@/components/elnino/NavBar";
import FooterSection from "@/components/elnino/FooterSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { resolveApiBaseUrl } from "@/lib/runtime";

const endpoints = [
  { method: "GET", path: "/api/v1/enso", pt: "Estado ENSO, anomalias semanais, probabilidades e fontes.", en: "ENSO state, weekly anomalies, probabilities and sources." },
  { method: "GET", path: "/api/v1/history", pt: "Séries históricas completas RONI/ONI e episódios detectados.", en: "Complete RONI/ONI historical series and detected episodes." },
  { method: "GET", path: "/api/v1/countries", pt: "Perfis educacionais de impacto por país.", en: "Educational country impact profiles." },
  { method: "GET", path: "/api/v1/live-countries", pt: "Condições atuais e previsão de 7 dias para os 30 países.", en: "Current conditions and 7-day forecast for all 30 countries." },
  { method: "GET", path: "/api/health", pt: "Saúde e cache do serviço NOAA.", en: "NOAA service health and cache state." },
];

export default function ApiDocsPage() {
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState("");
  const origin = typeof window === "undefined" ? "https://your-domain.vercel.app" : (resolveApiBaseUrl() || window.location.origin);
  async function copy(path) {
    await navigator.clipboard.writeText(`${origin}${path}`);
    setCopied(path);
    setTimeout(() => setCopied(""), 1800);
  }
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main id="main-content" className="mx-auto max-w-6xl px-4 pb-16 pt-28">
        <header className="max-w-3xl"><p className="section-kicker">{t("kicker.developer")}</p><h1 className="section-title text-4xl sm:text-6xl">{t("api.title")}</h1><p className="section-description">{t("api.subtitle")}</p></header>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <section className="surface-card overflow-hidden"><div className="border-b border-border p-5"><div className="flex items-center gap-2"><Server className="h-5 w-5 text-primary" /><h2 className="font-display text-xl font-bold">{t("api.endpoints")}</h2></div></div><div className="divide-y divide-border">{endpoints.map((item) => <div key={item.path} className="p-5"><div className="flex flex-wrap items-center gap-3"><span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">{item.method}</span><code className="break-all text-sm">{item.path}</code><button type="button" onClick={() => copy(item.path)} className="ml-auto control-button" aria-label={language === "pt" ? "Copiar endpoint" : "Copy endpoint"}>{copied === item.path ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{language === "pt" ? item.pt : item.en}</p></div>)}</div></section>

          <aside className="space-y-5">
            <div className="surface-card p-5"><KeyRound className="h-6 w-6 text-primary" /><h2 className="mt-4 font-display text-xl font-bold">{t("api.key")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("api.noKey")}</p><p className="mt-3 text-xs leading-5 text-muted-foreground">{t("api.optionalKey")}</p></div>
            <div className="surface-card p-5"><Braces className="h-6 w-6 text-primary" /><h2 className="mt-4 font-display text-xl font-bold">{t("api.rate")}</h2><p className="mt-2 text-sm text-muted-foreground">60 requests / 60 seconds / client</p><p className="mt-2 text-xs text-muted-foreground">Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Backend, Retry-After.</p></div>
          </aside>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/10 p-5 text-sm leading-6 text-muted-foreground"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><p>{t("api.caution")}</p></div>

        <section className="mt-8 surface-card p-5 sm:p-7"><h2 className="font-display text-xl font-bold">{t("api.example")}</h2><pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100"><code>{`const response = await fetch("${origin}/api/v1/enso");\nif (!response.ok) throw new Error("API request failed");\nconst data = await response.json();\nconsole.log(data.current.phase);`}</code></pre></section>
      </main>
      <FooterSection />
    </div>
  );
}
