import React, { useState } from "react";
import { Braces, Check, Download, FileJson, FileSpreadsheet, FileText, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnsoData } from "@/hooks/useEnsoData";
import { useLanguage } from "@/contexts/LanguageContext";
import { exportCsv, exportJson, exportPdf } from "@/services/exportService";
import { shareDashboardImage } from "@/services/shareService";
import { resolveApiBaseUrl } from "@/lib/runtime";

export default function ResearchTools() {
  const { data } = useEnsoData();
  const { language, t } = useLanguage();
  const [status, setStatus] = useState("");

  async function run(action, success = t("tools.exportSuccess")) {
    try {
      setStatus("");
      const result = await action();
      setStatus(result === "downloaded" ? t("tools.shareDownloaded") : success);
      window.setTimeout(() => setStatus(""), 3500);
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error(error);
      setStatus(t("tools.exportError"));
    }
  }

  const tools = [
    { label: t("tools.csv"), icon: FileSpreadsheet, action: () => run(() => exportCsv(data, language)) },
    { label: t("tools.json"), icon: FileJson, action: () => run(() => exportJson(data)) },
    { label: t("tools.pdf"), icon: FileText, action: () => run(() => exportPdf(data, language)) },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="surface-card p-5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">{t("kicker.toolkit")}</p>
            <h2 className="section-title">{t("tools.title")}</h2>
            <p className="section-description">{t("tools.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
            {tools.map(({ label, icon: Icon, action }) => <button key={label} type="button" onClick={action} className="tool-button"><Icon className="h-4 w-4" />{label}</button>)}
            <button type="button" onClick={() => run(() => shareDashboardImage({ title: "NiñoPulse Global", text: t("hero.description"), fallbackUrl: resolveApiBaseUrl() || window.location.origin }), t("tools.shareSuccess"))} className="tool-button"><Share2 className="h-4 w-4" />{t("tools.shareImage")}</button>
            <Link to="/research" className="tool-button"><Download className="h-4 w-4" />{t("tools.research")}</Link>
            <Link to="/api-docs" className="tool-button"><Braces className="h-4 w-4" />{t("tools.api")}</Link>
          </div>
        </div>
        {status && <p className="mt-4 flex items-center gap-2 text-xs text-primary" role="status"><Check className="h-4 w-4" />{status}</p>}
      </div>
    </section>
  );
}
