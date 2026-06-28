import React from "react";
import { CheckCircle2, ExternalLink, Globe2, ShieldCheck, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnsoData } from "@/hooks/useEnsoData";
import { cadenceLabel } from "@/lib/ensoFormat";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FooterSection() {
  const { data } = useEnsoData();
  const { language, t } = useLanguage();
  return (
    <footer className="mt-12 border-t border-border bg-card/45 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2"><Globe2 className="h-5 w-5 text-primary" /><span className="font-display font-bold">NiñoPulse Global</span></div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t("footer.created")}. Firjan SESI Caxias.</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm"><Link to="/about" className="hover:text-primary">{t("nav.about")}</Link><Link to="/research" className="hover:text-primary">{t("nav.research")}</Link><Link to="/api-docs" className="hover:text-primary">{t("nav.api")}</Link><Link to="/privacy" className="hover:text-primary">{t("nav.privacy")}</Link></div>
          </div>
          <div>
            <div className="mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><h3 className="text-sm font-bold">{t("footer.transparency")}</h3></div>
            <div className="grid gap-2 sm:grid-cols-3">{(data.sources || []).map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border bg-background/60 p-3 transition hover:border-primary/40"><div className="flex items-start justify-between gap-2"><span className="line-clamp-2 text-xs font-medium">{source.name.replace("NOAA/CPC — ", "")}</span>{source.available ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : <XCircle className="h-4 w-4 shrink-0 text-accent" />}</div><p className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground"><span>{cadenceLabel(source.cadence, language)}</span><ExternalLink className="h-3 w-3" /></p></a>)}</div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:justify-between"><span>© 2026 NiñoPulse Global</span><span>{t("footer.rights")}</span></div>
      </div>
    </footer>
  );
}
