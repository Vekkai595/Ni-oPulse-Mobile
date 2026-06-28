import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { Layers3, Loader2, Maximize2, Minimize2, WifiOff } from "lucide-react";
import { useTheme } from "next-themes";
import { countries, riskColors } from "@/lib/elNinoData";
import { localizeCountries } from "@/lib/localizedContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import "leaflet/dist/leaflet.css";

const radius = { baixo: 7, moderado: 9, alto: 11, extremo: 14 };
const layerThreat = { drought: "seca", rain: "enchentes", agriculture: "agricultura" };


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function projectCountry({ lat, lng }) {
  const x = clamp(((lng + 180) / 360) * 100, 4, 96);
  const y = clamp(((82 - lat) / 164) * 100, 6, 92);
  return { x, y };
}

function MobileStaticMap({ filtered, hovered, setHovered, onCountryClick, setFullscreen, language, t }) {
  const highRisk = filtered.filter((country) => ["alto", "extremo"].includes(country.nivelDeRisco)).length;

  return (
    <div className="mobile-static-map-shell">
      <div className="mobile-static-map" role="img" aria-label={language === "pt" ? "Mapa simplificado com países clicáveis" : "Simplified map with clickable countries"}>
        <div className="mobile-static-map-grid" aria-hidden="true" />
        <div className="mobile-static-map-equator" aria-hidden="true" />
        <div className="mobile-static-map-label label-americas" aria-hidden="true">Américas</div>
        <div className="mobile-static-map-label label-europe" aria-hidden="true">Europa/África</div>
        <div className="mobile-static-map-label label-asia" aria-hidden="true">Ásia/Oceania</div>
        {filtered.map((country) => {
          const color = riskColors[country.nivelDeRisco];
          const { x, y } = projectCountry(country);
          const isHovered = hovered === country.id;
          return (
            <button
              key={country.id}
              type="button"
              className={`mobile-static-dot ${isHovered ? "mobile-static-dot-active" : ""}`}
              style={Object.assign({ left: `${x}%`, top: `${y}%` }, { "--dot-color": color })}
              onClick={() => onCountryClick(country)}
              onFocus={() => setHovered(country.id)}
              onBlur={() => setHovered(null)}
              onPointerEnter={() => setHovered(country.id)}
              onPointerLeave={() => setHovered(null)}
              aria-label={`${country.nome}: ${t(`risks.${country.nivelDeRisco}`)}`}
            >
              <span className="mobile-static-dot-core" />
              <span className="mobile-static-dot-tooltip">{country.nome}</span>
            </button>
          );
        })}
      </div>

      <div className="mobile-static-map-info">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            {language === "pt" ? "Mapa toque-livre" : "Scroll-safe map"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {language === "pt"
              ? "Role a página normalmente. Toque nas bolinhas para abrir os detalhes do país."
              : "Scroll normally. Tap the dots to open country details."}
          </p>
        </div>
        <div className="rounded-2xl bg-secondary px-3 py-2 text-center">
          <p className="font-display text-lg font-black">{highRisk}</p>
          <p className="text-[10px] font-bold uppercase text-muted-foreground">{language === "pt" ? "alto risco" : "high risk"}</p>
        </div>
      </div>

      <button type="button" className="secondary-action mt-3 w-full" onClick={() => setFullscreen(true)}>
        <Maximize2 className="h-4 w-4" />
        {language === "pt" ? "Abrir mapa completo" : "Open full map"}
      </button>
    </div>
  );
}

function MapResizeController({ fullscreen }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;
    const timers = [];

    const invalidate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => map.invalidateSize({ animate: false, pan: false }));
    };

    invalidate();
    timers.push(window.setTimeout(invalidate, 80));
    timers.push(window.setTimeout(invalidate, 320));

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(invalidate) : null;
    resizeObserver?.observe(container);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") invalidate();
    };

    window.addEventListener("resize", invalidate, { passive: true });
    window.addEventListener("orientationchange", invalidate, { passive: true });
    window.visualViewport?.addEventListener("resize", invalidate, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach(window.clearTimeout);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("orientationchange", invalidate);
      window.visualViewport?.removeEventListener("resize", invalidate);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [map, fullscreen]);

  return null;
}

function MapFitController({ points, fullscreen }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    const timer = window.setTimeout(() => {
      if (points.length === 1) {
        map.setView(points[0], 4, { animate: true });
        return;
      }
      map.fitBounds(points, {
        animate: true,
        duration: 0.45,
        maxZoom: fullscreen ? 4.5 : 3.25,
        padding: fullscreen ? [42, 42] : [24, 24],
      });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [fullscreen, map, points]);

  return null;
}

function MapInteractionController({ enabled }) {
  const map = useMap();

  useEffect(() => {
    if (enabled) {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
    } else {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
    }
  }, [enabled, map]);

  return null;
}

export default function WorldMap({ riskFilter, threatFilter, onCountryClick }) {
  const [hovered, setHovered] = useState(null);
  const [layer, setLayer] = useState("risk");
  const [fullscreen, setFullscreen] = useState(false);
  const [interactionEnabled, setInteractionEnabled] = useState(false);
  const [useFallbackTiles, setUseFallbackTiles] = useState(false);
  const [tileLoading, setTileLoading] = useState(true);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const { language, t } = useLanguage();
  const localized = useMemo(() => localizeCountries(countries, language), [language]);

  const filtered = useMemo(() => localized.filter((country) => {
    const riskMatch = riskFilter === "all" || country.nivelDeRisco === riskFilter;
    const activeThreat = threatFilter || layerThreat[layer];
    return riskMatch && (!activeThreat || country.ameacas.includes(activeThreat));
  }), [localized, riskFilter, threatFilter, layer]);
  const points = useMemo(() => filtered.map((country) => [country.lat, country.lng]), [filtered]);
  const useStaticMobileMap = isMobile && !fullscreen;
  const mapInteractive = !isMobile || fullscreen || interactionEnabled;

  useEffect(() => {
    setUseFallbackTiles(false);
    setTileLoading(true);
  }, [resolvedTheme]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeFullscreen = () => setFullscreen(false);
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeFullscreen();
    };
    const onNativeBack = (event) => {
      event.detail.handled = true;
      closeFullscreen();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("ninopulse:native-back", onNativeBack);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("ninopulse:native-back", onNativeBack);
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen && isMobile) setInteractionEnabled(false);
  }, [fullscreen, isMobile]);

  const cartoUrl = resolvedTheme === "light"
    ? "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
  const tileUrl = useFallbackTiles ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" : cartoUrl;
  const tileAttribution = useFallbackTiles
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://carto.com/">CARTO</a>';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`surface-card flex overflow-hidden ${fullscreen ? "map-fullscreen fixed inset-0 z-[1400] flex-col rounded-none border-0" : "flex-col"}`}
    >
      <div className={`map-panel-header flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 ${fullscreen ? "safe-top" : ""}`}>
        <div className="map-title-row flex min-w-0 items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" /></span>
          <h2 className="truncate font-display text-sm font-bold sm:text-base">{t("map.title")}</h2>
          <span className="shrink-0 text-xs text-muted-foreground">{filtered.length}</span>
          {!online && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-[10px] font-semibold text-accent"><WifiOff className="h-3 w-3" /> Offline</span>}
        </div>
        <div className="map-control-strip flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Layers3 className="h-4 w-4 shrink-0 text-muted-foreground" />
          {["risk", "drought", "rain", "agriculture"].map((item) => (
            <button key={item} type="button" onClick={() => setLayer(item)} className={`filter-chip whitespace-nowrap ${layer === item ? "filter-chip-active" : ""}`} aria-pressed={layer === item}>{t(`map.${item}`)}</button>
          ))}
          <button
            type="button"
            onClick={() => setFullscreen((current) => !current)}
            className="control-button h-11 w-11 shrink-0 px-0"
            aria-label={fullscreen ? (language === "pt" ? "Sair da tela cheia" : "Exit full screen") : (language === "pt" ? "Abrir mapa em tela cheia" : "Open full-screen map")}
            title={fullscreen ? (language === "pt" ? "Sair da tela cheia" : "Exit full screen") : (language === "pt" ? "Tela cheia" : "Full screen")}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={`relative min-h-0 ${fullscreen ? "flex-1" : "map-viewport-height"} ${useStaticMobileMap ? "map-static-mode" : mapInteractive ? "map-explore-mode" : "map-scroll-mode"}`}>
        {useStaticMobileMap ? (
          <MobileStaticMap filtered={filtered} hovered={hovered} setHovered={setHovered} onCountryClick={onCountryClick} setFullscreen={setFullscreen} language={language} t={t} />
        ) : (
        <MapContainer
          center={[15, 0]}
          zoom={isMobile ? 2 : 2}
          minZoom={isMobile ? 1.5 : 2}
          maxZoom={7}
          scrollWheelZoom={fullscreen}
          dragging={mapInteractive}
          touchZoom={mapInteractive}
          doubleClickZoom={mapInteractive}
          worldCopyJump
          preferCanvas
          zoomControl={!isMobile}
          className="h-full w-full"
          style={{ background: "hsl(var(--background))" }}
        >
          <MapResizeController fullscreen={fullscreen} />
          <MapFitController points={points} fullscreen={fullscreen} />
          <MapInteractionController enabled={mapInteractive} />
          <TileLayer
            key={tileUrl}
            url={tileUrl}
            attribution={tileAttribution}
            updateWhenIdle
            keepBuffer={2}
            eventHandlers={{
              loading: () => setTileLoading(true),
              load: () => setTileLoading(false),
              tileerror: () => {
                setTileLoading(false);
                setUseFallbackTiles(true);
              },
            }}
          />
          {filtered.map((country) => {
            const color = riskColors[country.nivelDeRisco];
            const isHovered = hovered === country.id;
            return (
              <CircleMarker
                key={country.id}
                center={[country.lat, country.lng]}
                radius={(isMobile ? radius[country.nivelDeRisco] + 4 : radius[country.nivelDeRisco]) + (isHovered ? 3 : 0)}
                interactive
                pathOptions={{ fillColor: color, fillOpacity: isHovered ? 0.95 : 0.82, color, weight: isHovered ? 3 : 2 }}
                eventHandlers={{ click: () => onCountryClick(country), mouseover: () => setHovered(country.id), mouseout: () => setHovered(null) }}
              >
                <Tooltip direction="top" offset={[0, -8]} className="custom-tooltip">
                  <div className="w-[min(240px,calc(100vw-32px))] rounded-xl border border-border bg-card p-3 text-card-foreground shadow-xl">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="truncate text-sm">{country.nome}</strong>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ color, backgroundColor: `${color}1f` }}>{t(`risks.${country.nivelDeRisco}`)}</span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{country.impactoDoElNino}</p>
                    <p className="mt-2 text-[10px] font-medium text-primary">{t("map.tap")} →</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
        )}

        {!useStaticMobileMap && tileLoading && online && (
          <div className="pointer-events-none absolute inset-0 z-[450] grid place-items-center bg-background/25 backdrop-blur-[1px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-lg"><Loader2 className="h-4 w-4 animate-spin text-primary" />{language === "pt" ? "Carregando mapa" : "Loading map"}</span>
          </div>
        )}

        {!online && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] rounded-xl border border-border bg-background/90 p-3 text-xs text-muted-foreground shadow-lg backdrop-blur-lg">
            {language === "pt" ? "Sem conexão. O mapa usa os blocos já armazenados no dispositivo quando disponíveis." : "No connection. The map uses tiles already cached on this device when available."}
          </div>
        )}

        {!filtered.length && (
          <div className="absolute inset-0 z-[530] grid place-items-center bg-background/80 p-6 text-center backdrop-blur-sm">
            <p className="max-w-sm text-sm text-muted-foreground">{language === "pt" ? "Nenhum país corresponde a esta combinação de filtros." : "No country matches this filter combination."}</p>
          </div>
        )}
      </div>

      <div className={`border-t border-border p-4 text-xs text-muted-foreground ${fullscreen ? "safe-bottom" : ""}`}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span>{t("map.legend")}:</span>
          {Object.entries(riskColors).map(([key, color]) => <span key={key} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{t(`risks.${key}`)}</span>)}
        </div>
        {!fullscreen && <p className="mt-3 leading-5">{t("map.note")}</p>}
      </div>
    </motion.div>
  );
}
