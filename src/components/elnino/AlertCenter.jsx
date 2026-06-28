import React, { useEffect, useMemo, useState } from "react";
import { Bell, BellRing, Info, ShieldAlert } from "lucide-react";
import { useEnsoData } from "@/hooks/useEnsoData";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { countries } from "@/lib/elNinoData";
import { localizeCountries } from "@/lib/localizedContent";
import { countryAlertSnapshot, getCountryScenario } from "@/lib/countryOutlook";
import { notificationsSupported, requestNotificationPermission, sendLocalNotification } from "@/services/notificationService";

const SNAPSHOT_KEY = "ninopulse-alert-snapshots-v2";

function readSnapshots() {
  try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)) || {}; } catch { return {}; }
}

export default function AlertCenter() {
  const { data } = useEnsoData();
  const { language, t } = useLanguage();
  const { alertSettings, setAlertSettings } = usePreferences();
  const [message, setMessage] = useState("");
  const supported = notificationsSupported();
  const localizedCountries = useMemo(() => localizeCountries(countries, language), [language]);

  useEffect(() => {
    if (!alertSettings.enabled || !supported) return;
    const snapshots = readSnapshots();
    const globalSnapshot = `${data.current?.phase}|${data.forecast?.selectedSeason?.season}|${data.forecast?.selectedSeason?.probability?.elNino}`;
    const next = { ...snapshots, global: globalSnapshot };
    const tasks = [];

    if (snapshots.global && snapshots.global !== globalSnapshot) {
      tasks.push(sendLocalNotification({
        id: 101,
        title: "NiñoPulse Global",
        body: `${t("alerts.changed")}: ${data.current?.phase || "ENSO"} · El Niño ${data.forecast?.selectedSeason?.probability?.elNino ?? "—"}%`,
      }));
    }

    for (const id of alertSettings.countries.slice(0, 8)) {
      const country = localizedCountries.find((item) => item.id === id);
      if (!country) continue;
      const snapshot = countryAlertSnapshot(country, data);
      next[id] = snapshot;
      if (snapshots[id] && snapshots[id] !== snapshot) {
        const scenario = getCountryScenario(country, data, language);
        tasks.push(sendLocalNotification({
          id: 1000 + country.id.charCodeAt(0) * 10 + country.id.charCodeAt(1),
          title: `${t("alerts.countryChanged")} ${country.nome}`,
          body: `${scenario.label} · ${scenario.probability}%`,
        }));
      }
    }

    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
    Promise.allSettled(tasks).catch(() => undefined);
  }, [data, alertSettings.enabled, alertSettings.countries, language, localizedCountries, supported, t]);

  async function enable() {
    if (!supported) { setMessage(t("alerts.unsupported")); return; }
    const granted = await requestNotificationPermission();
    if (granted) {
      setAlertSettings((current) => ({ ...current, enabled: true }));
      const baseline = { global: `${data.current?.phase}|${data.forecast?.selectedSeason?.season}|${data.forecast?.selectedSeason?.probability?.elNino}` };
      for (const id of alertSettings.countries) {
        const country = localizedCountries.find((item) => item.id === id);
        if (country) baseline[id] = countryAlertSnapshot(country, data);
      }
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(baseline));
      setMessage("");
    } else setMessage(t("alerts.denied"));
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-4 rounded-3xl border border-border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">{alertSettings.enabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}</span>
          <div>
            <h2 className="font-display text-xl font-bold">{t("alerts.title")}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("alerts.description")}</p>
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />{t("alerts.limitation")}</p>
            {message && <p className="mt-2 flex items-center gap-1 text-xs text-accent"><ShieldAlert className="h-3.5 w-3.5" />{message}</p>}
          </div>
        </div>
        <button type="button" onClick={alertSettings.enabled ? () => setAlertSettings((current) => ({ ...current, enabled: false })) : enable} className={alertSettings.enabled ? "secondary-action" : "primary-action"}>
          {alertSettings.enabled ? t("common.disabled") : t("alerts.enable")}
        </button>
      </div>
    </section>
  );
}
