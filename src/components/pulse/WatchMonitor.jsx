import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { usePlaces } from "@/contexts/PlacesContext";
import { useEnsoData } from "@/hooks/useEnsoData";
import { alertOptions } from "@/hooks/useOfficialAlerts";
import { localWeatherOptions } from "@/hooks/useLocalWeather";
import { useOnline } from "@/hooks/useOnline";
import { ALERT_TTL } from "@/lib/officialAlerts";
import { recordWatch, watchSnapshot, watchSubscribe, WATCH_LIMIT } from "@/lib/watch";
import { instant, WEATHER_TTL } from "@/lib/weather";
import { useCopy } from "./ui";

export const useWatch = () => useSyncExternalStore(watchSubscribe, watchSnapshot, watchSnapshot);

function label(event, copy) {
  if (event.kind === "weather") return copy(`Mudou a previsão de ${event.place}`, `Forecast changed for ${event.place}`);
  if (event.kind === "official") return copy(`Novo aviso oficial em ${event.place}`, `New official alert for ${event.place}`);
  return copy("Novo boletim ENSO da NOAA/CPC", "New NOAA/CPC ENSO bulletin");
}

export default function WatchMonitor() {
  const { copy } = useCopy();
  const { settings } = useWatch();
  const { main, favorites } = usePlaces();
  const online = useOnline();
  const places = useMemo(() => [main, ...favorites.filter(({ id }) => id !== main?.id)].filter(Boolean).slice(0, WATCH_LIMIT), [main, favorites]);
  const weather = useQueries({ queries: settings.weather ? places.map((place) => ({ ...localWeatherOptions(place), refetchInterval: 60 * 60 * 1000 })) : [] });
  const alerts = useQueries({ queries: settings.official ? places.map((place) => alertOptions(place)) : [] });
  const enso = useEnsoData(settings.enso);

  useEffect(() => {
    if (!online || document.visibilityState !== "visible") return;
    const fresh = (date, ttl) => Date.now() - Date.parse(date) <= ttl * 2;
    const events = [];
    weather.forEach((query, index) => {
      if (query.isSuccess && fresh(query.data.fetchedAt, WEATHER_TTL)) events.push(recordWatch("weather", query.data, places[index]));
    });
    alerts.forEach((query, index) => {
      if (query.isSuccess && fresh(query.data.checkedAt, ALERT_TTL)) events.push(recordWatch("official", query.data, places[index]));
    });
    if (settings.enso && enso.isSuccess && !enso.isFallback) events.push(recordWatch("enso", enso.data));
    const recent = events.filter(Boolean);
    if (!settings.notify || !recent.length) return;
    import("@/services/notificationService").then(({ sendLocalNotification }) => sendLocalNotification({
      title: "NiñoPulse Global",
      body: recent.length === 1 ? label(recent[0], copy) : copy(`${recent.length} novidades em O que mudou?`, `${recent.length} updates in What changed?`),
    })).catch(() => undefined);
  }, [online, places, weather, alerts, settings, enso.data, enso.isSuccess, enso.isFallback, copy]);

  return null;
}

export function FollowChanges() {
  const { copy, language } = useCopy();
  const { settings, events } = useWatch();
  const recent = events.filter((event) => settings[event.kind] && Date.now() - Date.parse(event.stamp) <= 7 * 86_400_000).slice(0, 5);
  return <div className="mt-3">
    {recent.length > 0 && <ul className="np-changes">{recent.map((event) => {
      const url = event.kind === "official" ? `/alerts?place=${encodeURIComponent(event.placeId)}` : event.kind === "enso" ? "/enso" : "/alerts#preferences";
      return <li key={event.id}><span><Link to={url} className="np-link">{label(event, copy)}</Link><small>{event.kind === "official" ? `${event.detail.slice(0, 2).join(" · ")} · ` : ""}{instant(event.stamp, language)}</small></span></li>;
    })}</ul>}
    <Link to="/alerts#preferences" className="np-link">{copy("Configurar acompanhamento", "Manage what you follow")}</Link>
  </div>;
}
