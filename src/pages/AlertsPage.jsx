import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Bell, BellRing, CloudSun, RadioTower, ShieldAlert, Waves } from "lucide-react";
import { usePlaces } from "@/contexts/PlacesContext";
import { useOfficialAlerts } from "@/hooks/useOfficialAlerts";
import { useOnline } from "@/hooks/useOnline";
import { ALERT_SOURCES, ALERT_TTL } from "@/lib/officialAlerts";
import { instant, placeRegion } from "@/lib/weather";
import { changeWatch } from "@/lib/watch";
import { useWatch } from "@/components/pulse/WatchMonitor";
import { Note, PageHeading, Refresh, SectionTitle, SourceLink, useCopy } from "@/components/pulse/ui";

function AlertItem({ alert }) {
  const { copy, language } = useCopy();
  const levels = { Extreme: copy("Extremo", "Extreme"), Severe: copy("Severo", "Severe"), Moderate: copy("Moderado", "Moderate"), Minor: copy("Menor", "Minor") };
  return <li className="np-alert">
    <p className="np-caption"><strong>{alert.issuer}</strong>{levels[alert.severity] && ` · ${levels[alert.severity]}`}</p>
    <h3 lang={alert.language}>{alert.title}</h3>
    {alert.headline && <p lang={alert.language}>{alert.headline}</p>}
    <p className="np-caption">{copy("Início", "Starts")} {instant(alert.start, language)} · {copy("Fim", "Ends")} {instant(alert.expires, language)}</p>
    {(alert.description || alert.instruction) && <details className="np-details"><summary>{copy("Comunicado e orientações oficiais", "Official statement and instructions")}</summary>{alert.description && <p lang={alert.language}>{alert.description}</p>}{alert.instruction && <p lang={alert.language}>{alert.instruction}</p>}</details>}
    <SourceLink href={alert.url}>{copy("Fonte oficial", "Official source")}</SourceLink>
  </li>;
}

function WatchPreferences() {
  const { copy } = useCopy();
  const { settings } = useWatch();
  const [notice, setNotice] = useState(false);
  const [busy, setBusy] = useState(false);
  const kinds = [
    { key: "official", Icon: ShieldAlert, label: copy("Avisos meteorológicos", "Official weather alerts"), description: copy("Novos avisos para cidades acompanhadas no Brasil e nos EUA.", "New notices for followed cities in Brazil and the United States.") },
    { key: "weather", Icon: CloudSun, label: copy("Mudanças nas previsões", "Forecast changes"), description: copy("Mudanças relevantes na chuva ou na temperatura máxima.", "Meaningful changes in precipitation chance or daily highs.") },
    { key: "enso", Icon: Waves, label: copy("Boletins do ENSO", "ENSO bulletins"), description: copy("Uma nova discussão oficial da NOAA/CPC.", "A new official NOAA/CPC discussion.") },
  ];

  async function notifications() {
    setNotice(false);
    if (settings.notify) {
      changeWatch("notify", false);
      return;
    }
    setBusy(true);
    try {
      const { requestNotificationPermission } = await import("@/services/notificationService");
      if (await requestNotificationPermission()) changeWatch("notify", true);
      else setNotice(true);
    } catch {
      setNotice(true);
    } finally {
      setBusy(false);
    }
  }

  return <section className="np-panel" id="preferences">
    <SectionTitle icon={RadioTower} title={copy("O que acompanhar", "What to follow")} description={copy("Para tempo e avisos, o app acompanha a cidade principal e até três favoritas.", "Weather and alerts cover your home city and up to three favorites.")} />
    {kinds.map(({ key, Icon, label, description }) => <label className="np-watch" key={key}><Icon size={19} aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={Boolean(settings[key])} onChange={(event) => changeWatch(key, event.target.checked)} /></label>)}
    <button className="np-button mt-4" type="button" aria-pressed={settings.notify} disabled={busy} onClick={notifications}><BellRing size={17} aria-hidden="true" />{settings.notify ? copy("Desativar notificações", "Turn off notifications") : copy("Ativar notificações", "Turn on notifications")}</button>
    <p className="np-caption">{copy("As verificações acontecem com o app aberto. As categorias acima determinam o que pode gerar notificações.", "Checks run while the app is open. The categories above determine what can trigger notifications.")}</p>
    {notice && <Note warning>{copy("Permissão indisponível ou recusada no dispositivo.", "Permission is unavailable or denied on this device.")}</Note>}
  </section>;
}

export default function AlertsPage() {
  const { copy, language } = useCopy();
  const { main, active, favorites } = usePlaces();
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const online = useOnline();
  const places = [...new Map([main, active?.device ? null : active, ...favorites].filter(Boolean).map((place) => [place.id, place])).values()];
  const place = places.find(({ id }) => id === params.get("place")) ?? main ?? places[0];
  const source = place && ALERT_SOURCES[place.countryCode];
  const query = useOfficialAlerts(place);
  const stale = query.data && (!online || query.isError || Date.now() - Date.parse(query.data.checkedAt) > ALERT_TTL * 2);
  const alerts = query.data?.alerts.filter(({ expires }) => Date.parse(expires) > Date.now()) ?? [];
  useEffect(() => {
    if (hash === "#preferences") document.getElementById("preferences")?.scrollIntoView({ block: "start" });
  }, [hash]);

  return <main id="main-content" className="np-content" tabIndex={-1}>
    <PageHeading title={copy("Alertas", "Alerts")} description={copy("Consulte avisos das autoridades e escolha quais novidades quer acompanhar.", "Check official notices and choose which updates to follow.")} />
    <div className="np-two">
      <section className="np-panel">
        <SectionTitle icon={Bell} title={copy("Avisos por cidade", "Alerts by city")} action={source && <Refresh onClick={() => query.refetch()} busy={query.isFetching} disabled={!online} />} />
        {place ? <>
          <label htmlFor="alert-city" className="np-label">{copy("Cidade", "City")}</label>
          <select id="alert-city" className="np-field" value={place.id} onChange={(event) => setParams({ place: event.target.value }, { replace: true })}>{places.map((item) => <option key={item.id} value={item.id}>{item.name} · {placeRegion(item, language)}</option>)}</select>
          {!source && <Note>{copy("A consulta por cidade cobre Brasil e Estados Unidos. Para outros locais, consulte o serviço meteorológico nacional.", "City-level lookup covers Brazil and the United States. Elsewhere, check the national weather service.")}</Note>}
          {source && <>
            {query.isFetching && !query.data && <Note>{copy("Consultando a fonte oficial…", "Checking the official source…")}</Note>}
            {(!online || query.isError || stale) && <Note warning>{copy("Atualização indisponível. Consulte a autoridade local.", "Updates unavailable. Check with the local authority.")}</Note>}
            {query.isSuccess && !stale && !alerts.length && <Note>{copy("Nenhum aviso ativo para o ponto consultado neste feed.", "No active alerts for the selected point in this feed.")}</Note>}
            {alerts.length > 0 && <ul>{alerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)}</ul>}
            {query.data?.incomplete && <p className="np-caption">{copy("Alguns comunicados vieram sem área geográfica.", "Some notices came without geographic areas.")}</p>}
            {query.data && <p className="np-caption">{copy("Última consulta", "Last checked")} · {instant(query.data.checkedAt, language)}</p>}
            <div className="flex flex-wrap gap-3"><SourceLink href={source.url}>{source.name}</SourceLink>{source.supplemental && <SourceLink href={source.supplemental}>INMET</SourceLink>}</div>
          </>}
        </> : <><Note>{copy("Escolha uma cidade em Meu Clima para consultar avisos.", "Choose a city in My Weather to check official alerts.")}</Note><Link className="np-link" to="/local-weather">{copy("Escolher cidade", "Choose a city")}</Link></>}
      </section>
      <WatchPreferences />
    </div>
    <p className="np-caption">{copy("Para decisões de segurança, siga as orientações da autoridade local.", "For safety decisions, follow your local authority’s guidance.")}</p>
  </main>;
}
