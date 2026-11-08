import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, CalendarDays, RadioTower, Waves } from "lucide-react";
import { useEnsoData } from "@/hooks/useEnsoData";
import { useOnline } from "@/hooks/useOnline";
import { formatDate, seasonLabel } from "@/lib/ensoFormat";
import { instant, metric } from "@/lib/weather";
import { NOAA_SOURCES } from "@/lib/noaaData";
import { Note, PageHeading, Refresh, SectionTitle, SourceLink, useCopy } from "@/components/pulse/ui";

const HistoricalAnalytics = lazy(() => import("@/components/elnino/HistoricalAnalytics"));
const REGIONS = { nino34: "Niño 3.4", nino3: "Niño 3", nino4: "Niño 4", nino12: "Niño 1+2" };
const KEYS = ["laNina", "neutral", "elNino"];
const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--accent))"];
const signed = (value, language) => value == null ? "—" : `${value > 0 ? "+" : ""}${metric(value, language, 1)} °C`;

function SeaChart({ rows }) {
  const { language, copy } = useCopy();
  const values = rows.map(({ value }) => value).filter(Number.isFinite);
  if (values.length < 2) return <Note>{copy("Série semanal indisponível.", "Weekly series unavailable.")}</Note>;
  const min = Math.floor(Math.min(0, ...values));
  const max = Math.ceil(Math.max(0, ...values)) || 1;
  const x = (index) => 36 + index * 539 / (rows.length - 1);
  const y = (value) => 146 - (value - min) * 122 / (max - min);
  const path = rows.map(({ value }, i) => Number.isFinite(value) ? `${Number.isFinite(rows[i - 1]?.value) ? "L" : "M"}${x(i).toFixed(2)},${y(value).toFixed(2)}` : "").join(" ");
  return <>
    <figure className="np-chart"><svg viewBox="0 0 600 165" role="img" aria-label={copy("Evolução semanal da anomalia em °C", "Weekly anomaly trend in °C")}>
      {[min, (min + max) / 2, max].map((step) => <g key={step}><line x1="36" x2="575" y1={y(step)} y2={y(step)} stroke="var(--np-line)" /><text x="28" y={y(step) + 4} textAnchor="end" fill="var(--np-muted)" fontSize="12">{metric(step, language, 1)}</text></g>)}
      <line x1="36" x2="575" y1={y(0)} y2={y(0)} stroke="var(--np-muted)" strokeDasharray="4 4" />
      <path d={path} fill="none" stroke="var(--np-accent)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    </svg><figcaption><span>{formatDate(rows[0].date, {}, language)}</span><span>{formatDate(rows.at(-1).date, {}, language)}</span></figcaption></figure>
    <details className="np-details"><summary>{copy("Ver valores do gráfico", "View chart values")}</summary><table className="np-simple-table">
      <thead><tr><th scope="col">{copy("Semana", "Week")}</th><th scope="col">{copy("Anomalia", "Anomaly")}</th></tr></thead>
      <tbody>{rows.slice().reverse().map(({ date, value }) => <tr key={date}><td>{formatDate(date, {}, language)}</td><td>{signed(value, language)}</td></tr>)}</tbody>
    </table></details>
  </>;
}

function Sea({ weekly }) {
  const { copy, language } = useCopy();
  const [region, setRegion] = useState("nino34");
  const data = weekly?.regions?.[region];
  const fourWeeks = weekly?.series?.at(-5)?.regions?.[region]?.anomaly;
  const delta = Number.isFinite(fourWeeks) && Number.isFinite(data?.anomaly) ? Math.round((data.anomaly - fourWeeks) * 10) / 10 : null;
  return <section className="np-panel">
    <SectionTitle icon={Waves} title={copy("Pacífico equatorial", "Equatorial Pacific")} description={copy("Observações semanais da temperatura da superfície do mar.", "Weekly sea surface temperature observations.")} />
    <div className="np-segment">{Object.entries(REGIONS).map(([key, name]) => <button type="button" key={key} aria-pressed={region === key} onClick={() => setRegion(key)}>{name}</button>)}</div>
    {weekly ? <>
      <dl className="np-ocean-metrics"><div><dt>{copy("Temperatura", "Temperature")}</dt><dd>{data?.sst == null ? "—" : `${metric(data.sst, language, 1)} °C`}</dd></div><div><dt>{copy("Anomalia", "Anomaly")}</dt><dd>{signed(data?.anomaly, language)}</dd></div><div><dt>{copy("Variação em 4 semanas", "4-week change")}</dt><dd>{signed(delta, language)}</dd></div></dl>
      <p className="np-caption">{copy("Semana de", "Week of")} {formatDate(weekly.date, {}, language)} · {copy("Base", "Baseline")} 1991–2020</p>
      <SeaChart rows={(weekly.series ?? []).map(({ date, regions }) => ({ date, value: regions[region]?.anomaly }))} />
    </> : <Note>{copy("Série semanal indisponível nesta consulta.", "Weekly series unavailable for this lookup.")}</Note>}
    <SourceLink href={NOAA_SOURCES.weeklySst.url}>NOAA/CPC · SST</SourceLink>
  </section>;
}

function Outlook({ forecast }) {
  const { copy, language } = useCopy();
  const labels = ["La Niña", copy("Neutro", "Neutral"), "El Niño"];
  return <section className="np-panel">
    <SectionTitle icon={CalendarDays} title={copy("Perspectiva sazonal", "Seasonal outlook")} description={copy("Probabilidades oficiais para janelas móveis de três meses.", "Official probabilities for rolling three-month periods.")} />
    {forecast?.seasons.length ? <>
      <p className="np-caption">{copy("Mês de publicação", "Issue month")} · {formatDate(forecast.issuedAt, { day: undefined, month: "long" }, language)}</p>
      <ul className="np-legend">{labels.map((label, index) => <li key={label}><i style={{ background: COLORS[index] }} />{label}</li>)}</ul>
      <ol className="np-outlook">{forecast.seasons.map(({ season, probability }) => <li key={season}>
        <b>{seasonLabel(season, language)}</b><span className="np-bars" aria-hidden="true">{KEYS.map((key, i) => <i key={key} style={{ background: COLORS[i], flexGrow: probability[key] }} />)}</span>
        <span className="np-prob">{KEYS.map((key, i) => <span key={key} aria-label={`${labels[i]} ${probability[key]}%`}>{probability[key]}%</span>)}</span>
      </li>)}</ol>
      <p className="np-caption">{copy("Chances da fase do ENSO no Pacífico, arredondadas pela NOAA. Os impactos locais variam por região e estação.", "NOAA rounds the odds of each ENSO phase in the Pacific. Local effects vary by region and season.")}</p>
    </> : <Note>{copy("Tabela sazonal indisponível.", "Seasonal table unavailable.")}</Note>}
    <div className="flex flex-wrap gap-x-3"><SourceLink href={NOAA_SOURCES.phaseProbabilities.url}>{copy("Tabela oficial", "Official table")}</SourceLink><SourceLink href={NOAA_SOURCES.probabilities.url}>{copy("Por intensidade", "By strength")}</SourceLink></div>
  </section>;
}

export default function EnsoPage() {
  const { copy, language } = useCopy();
  const online = useOnline();
  const { data, hasData, isFallback, isFetching, refetch } = useEnsoData();
  const { current } = data;
  return <main id="main-content" className="np-content" tabIndex={-1}>
    <PageHeading title={copy("El Niño e La Niña", "El Niño and La Niña")} description={copy("Boletins, observações oceânicas e previsões sazonais da NOAA.", "NOAA bulletins, ocean observations, and seasonal forecasts.")}><Refresh busy={isFetching} disabled={!online} onClick={() => refetch()} /></PageHeading>
    <div className="np-stack">
      {!hasData && <Note warning={!isFetching}>{isFetching ? copy("Consultando a NOAA…", "Checking NOAA…") : copy("Dados indisponíveis. Tente atualizar ou consulte as fontes oficiais.", "Data unavailable. Try refreshing or check the official sources.")}</Note>}
      {hasData && isFallback && <Note warning>{copy("Exibindo dados da última consulta salva, com as datas de referência.", "Showing data from the last saved lookup, with reference dates.")}</Note>}
      <section className="np-panel np-bulletin">
        <p className="np-kicker"><RadioTower size={16} aria-hidden="true" />{copy("DISCUSSÃO OFICIAL", "OFFICIAL DISCUSSION")}</p>
        <h2>{current?.phase === "ENSO-neutro" ? copy("ENSO neutro", "ENSO-neutral") : current?.phase ?? copy("Fase indisponível", "Phase unavailable")}</h2>
        {current?.issuedAt && <p className="np-caption">{copy("Publicado em", "Issued on")} {formatDate(current.issuedAt, {}, language)} · {language === "pt" ? current.alertStatusPt : current.alertStatus}</p>}
        {current?.nextUpdate && <p className="np-caption">{copy("Próxima discussão anunciada", "Next scheduled discussion")} · {formatDate(current.nextUpdate, {}, language)}</p>}
        <SourceLink href={NOAA_SOURCES.diagnostic.url}>{copy("Ler boletim original", "Read original bulletin")}</SourceLink>
      </section>
      <div className="np-two"><Sea weekly={current?.weeklySst} /><Outlook forecast={data.forecast} /></div>
      <Suspense fallback={<Note>{copy("Carregando histórico…", "Loading history…")}</Note>}><HistoricalAnalytics /></Suspense>
      <section className="np-panel">
        <SectionTitle icon={Activity} title={copy("Impactos regionais", "Regional impacts")} description={copy("O ENSO altera a chance de certos padrões sazonais. Entender as causas de um evento isolado exige um estudo próprio.", "ENSO changes the odds of seasonal patterns. The causes of an individual event require a separate study.")} />
        <Link to="/explore/regions" className="np-link">{copy("Explorar perfis regionais", "Explore regional profiles")}<ArrowRight size={16} /></Link>
        {data.generatedAt && <p className="np-caption">NOAA/CPC · {copy("Consulta", "Lookup")} {instant(data.generatedAt, language)}</p>}
      </section>
    </div>
  </main>;
}
