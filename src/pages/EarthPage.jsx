import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircleMarker, MapContainer, Rectangle, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { Crosshair, Droplets, Globe2, Layers3, Thermometer, Waves } from "lucide-react";
import { useEnsoData } from "@/hooks/useEnsoData";
import { useOnline } from "@/hooks/useOnline";
import { formatDate } from "@/lib/ensoFormat";
import { MAP_POINTS, NINO, OCEAN_POINTS, mapSamples, pointWeather } from "@/lib/earthLayers";
import { NOAA_SOURCES } from "@/lib/noaaData";
import { isPoint, localTime, metric, WEATHER_SOURCE, WEATHER_TTL } from "@/lib/weather";
import Basemap from "@/components/pulse/Basemap";
import { Note, PageHeading, Refresh, SectionTitle, SourceLink, useCopy } from "@/components/pulse/ui";
import "leaflet/dist/leaflet.css";

/** @type {import("leaflet").LatLngBoundsLiteral} */
const WORLD = [[-57, -178], [78, 178]];
const COLORS = { temp: "hsl(var(--accent))", rain: "hsl(var(--primary))", ocean: "#38bdf8" };

function Controls({ onPoint, reset }) {
  const map = useMap();
  useMapEvents({ click: ({ latlng }) => {
    const wrapped = latlng.wrap();
    onPoint({ latitude: Number(wrapped.lat.toFixed(2)), longitude: Number(wrapped.lng.toFixed(2)) });
  } });
  useEffect(() => { map.fitBounds(WORLD, { padding: [10, 10] }); }, [map, reset]);
  useEffect(() => {
    if (!window.ResizeObserver) return undefined;
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function Coordinates({ onPoint }) {
  const { copy } = useCopy();
  return <details className="np-details"><summary>{copy("Consultar coordenadas", "Look up coordinates")}</summary>
    <form onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const point = { latitude: Number(data.get("lat")), longitude: Number(data.get("lon")) };
      if (isPoint(point)) onPoint(point);
    }}>
      <label className="np-label">{copy("Latitude", "Latitude")}<input className="np-field" name="lat" required type="number" min="-90" max="90" step="any" /></label>
      <label className="np-label">{copy("Longitude", "Longitude")}<input className="np-field" name="lon" required type="number" min="-180" max="180" step="any" /></label>
      <button type="submit" className="np-button">{copy("Consultar", "Look up")}</button>
    </form>
  </details>;
}

export default function EarthPage() {
  const { language, copy } = useCopy();
  const online = useOnline();
  const [layer, setLayer] = useState("temp");
  const [region, setRegion] = useState("nino34");
  const [point, setPoint] = useState(null);
  const [reset, setReset] = useState(0);
  const anomaly = layer === "anomaly";
  const ocean = layer === "ocean";
  const forecast = !anomaly && !ocean;
  const enso = useEnsoData(anomaly);
  const weekly = enso.data.current?.weeklySst;
  const anomalyValue = weekly?.regions?.[region]?.anomaly;
  const area = NINO.find((item) => item.id === region);
  const options = [
    { id: "temp", label: copy("Temperatura", "Temperature"), Icon: Thermometer },
    { id: "rain", label: copy("Precipitação", "Precipitation"), Icon: Droplets },
    { id: "anomaly", label: copy("Anomalias do Pacífico", "Pacific anomalies"), Icon: Layers3 },
    { id: "ocean", label: copy("Oceano", "Ocean"), Icon: Waves },
  ];
  const samples = useQuery({ queryKey: ["earth-samples"], queryFn: ({ signal }) => mapSamples(signal), enabled: forecast && online, staleTime: WEATHER_TTL, retry: 1 });
  const sample = forecast && samples.data?.find((item) => item.name === point?.name);
  const single = useQuery({
    queryKey: ["earth-point", point?.latitude, point?.longitude, ocean],
    queryFn: ({ signal }) => pointWeather(point, ocean, signal),
    enabled: Boolean(point && !anomaly && !sample && online), staleTime: WEATHER_TTL, retry: 1,
  });
  const data = sample || single.data;
  const points = ocean ? OCEAN_POINTS : samples.data ?? MAP_POINTS;
  const label = options.find((item) => item.id === layer).label;
  const units = layer === "rain" ? " mm" : " °C";
  const source = anomaly ? NOAA_SOURCES.weeklySst.url : ocean ? "https://open-meteo.com/en/docs/marine-weather-api" : WEATHER_SOURCE;
  const time = (value) => localTime(value, language, { dateStyle: "medium", timeStyle: "short" });
  const placeLabel = (place) => language === "en" && place.en ? place.en : place.name;

  return <main className="np-content" id="main-content" tabIndex={-1}>
    <PageHeading title={copy("Mapa global", "World map")} description={copy("Explore chuva, temperatura e dados do oceano no Earth Live.", "Explore rain, temperature, and ocean data on Earth Live.")} />
    <div className="np-map-layout">
      <section className="np-panel np-map-panel">
        <div className="np-map-tools"><div className="np-segment" aria-label={copy("Camadas do mapa", "Map layers")}>
          {options.map(({ id, label, Icon }) => <button key={id} type="button" aria-pressed={layer === id} onClick={() => { if ((id === "ocean") !== ocean) setPoint(null); setLayer(id); }}><Icon size={16} aria-hidden="true" />{label}</button>)}
        </div><button className="np-button np-icon" type="button" onClick={() => setReset((value) => value + 1)} aria-label={copy("Voltar à visão global", "Reset to global view")}><Globe2 size={18} aria-hidden="true" /></button></div>
        <div role="region" aria-label={copy("Mapa mundial. Os mesmos dados estão nos controles de seleção.", "World map. The same data is available in the selectors.")}>
          <MapContainer className="np-map" center={[12, 0]} zoom={1} minZoom={0} maxZoom={7} zoomSnap={.25} scrollWheelZoom={false} maxBounds={[[-85, -185], [85, 185]]}>
            <Basemap grid /><Controls reset={reset} onPoint={(value) => { if (!anomaly) setPoint(value); }} />
            {anomaly ? <>
              {area.bounds.map((bounds, index) => <Rectangle key={`${region}-${index}`} bounds={bounds} interactive={false} pathOptions={{ color: anomalyValue < 0 ? COLORS.rain : COLORS.temp, fillOpacity: .28, weight: 2 }} />)}
              {NINO.map((item) => <CircleMarker key={item.id} center={item.center} radius={item.id === region ? 9 : 6} pathOptions={{ fillColor: COLORS.temp, color: "var(--np-panel)", fillOpacity: 1, weight: 2, bubblingMouseEvents: false }} eventHandlers={{ click: () => setRegion(item.id) }}><Tooltip>{item.name}</Tooltip></CircleMarker>)}
            </> : <>
              {points.map((item) => <CircleMarker key={item.name} center={[item.latitude, item.longitude]} radius={point?.name === item.name ? 9 : 6} pathOptions={{ fillColor: item[layer] == null && !ocean ? "var(--np-muted)" : COLORS[layer], color: "var(--np-panel)", fillOpacity: 1, weight: 2, bubblingMouseEvents: false }} eventHandlers={{ click: () => setPoint(item) }}><Tooltip>{placeLabel(item)}{item[layer] != null && ` · ${metric(item[layer], language, 1)}${units}`}</Tooltip></CircleMarker>)}
              {point && !point.name && <CircleMarker center={[point.latitude, point.longitude]} radius={8} interactive={false} pathOptions={{ color: COLORS.temp }} />}
            </>}
          </MapContainer>
        </div>
        <p className="np-caption">{anomaly ? copy("Médias semanais por região Niño · base 1991–2020", "Weekly Niño-region averages · 1991–2020 baseline") : copy("Dados de modelo em pontos. Selecione um ponto ou toque no mapa.", "Model data at sampled points. Select a point or tap the map.")}</p>
        <SourceLink href={source}>{anomaly ? "NOAA/CPC" : "Open-Meteo"}</SourceLink>
      </section>
      <section className="np-panel">
        <SectionTitle icon={Crosshair} title={label} action={<Refresh busy={anomaly ? enso.isFetching : single.isFetching || samples.isFetching} disabled={!online || (ocean && !point)} onClick={() => {
          if (anomaly) enso.refetch();
          else if (point && !sample) single.refetch();
          else samples.refetch();
        }} />} />
        {anomaly ? <>
          <label className="np-label" htmlFor="map-region">{copy("Região", "Region")}</label>
          <select id="map-region" className="np-field" value={region} onChange={(event) => setRegion(event.target.value)}>{NINO.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          {weekly && anomalyValue != null ? <div className="np-reading-box"><strong>{anomalyValue > 0 ? "+" : ""}{metric(anomalyValue, language, 1)} °C</strong><small>{formatDate(weekly.date, {}, language)}</small>{enso.isFallback && <small>{copy("Consulta salva", "Saved lookup")}</small>}</div> : <Note>{enso.isFetching ? copy("Consultando a NOAA…", "Checking NOAA…") : copy("Dado semanal indisponível.", "Weekly data unavailable.")}</Note>}
        </> : <>
          <label className="np-label" htmlFor="map-point">{copy("Ponto de referência", "Reference point")}</label>
          <select id="map-point" className="np-field" value={point?.name ?? ""} onChange={(event) => setPoint(points.find((item) => item.name === event.target.value) ?? null)}><option value="">{copy("Selecione um ponto", "Select a point")}</option>{points.map((item) => <option key={item.name} value={item.name}>{placeLabel(item)}{item[layer] != null && ` · ${metric(item[layer], language, 1)}${units}`}</option>)}</select>
          {point && <p className="np-caption">{metric(point.latitude, language, 2)}°, {metric(point.longitude, language, 2)}°</p>}
          {data?.[layer] != null && <div className="np-reading-box" role="status"><strong>{metric(data[layer], language, 1)}{units}</strong><small>{time(data.time)} UTC</small>{layer === "rain" && data.interval && <small>{copy(`Acumulado em ${data.interval / 60} min`, `Accumulation over ${data.interval / 60} min`)}</small>}</div>}
          {(single.isFetching || (forecast && samples.isFetching)) && <Note>{copy("Consultando dados de modelo…", "Loading model data…")}</Note>}
          {(!online || single.isError || (forecast && samples.isError && !data)) && <Note warning>{copy("Fonte indisponível. Os valores visíveis têm data e hora de referência.", "Source unavailable. Visible values have a reference time.")}</Note>}
          {data && data[layer] == null && <Note>{copy("Sem dado nesta camada para o ponto selecionado.", "No value for this layer at the selected point.")}</Note>}
          <Coordinates onPoint={setPoint} />
        </>}
      </section>
    </div>
  </main>;
}
