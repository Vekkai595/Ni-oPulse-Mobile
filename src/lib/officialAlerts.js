import { XMLParser, XMLValidator } from "fast-xml-parser";
import { isPoint } from "./weather.js";

export const ALERT_TTL = 20 * 60 * 1000;
export const IDAP_URL = "https://idapfile.mdr.gov.br/idap/api/rss/cap";
export const ALERT_SOURCES = {
  BR: {
    name: "Defesa Civil · IDAP",
    url: "https://www.gov.br/mdr/pt-br/assuntos/protecao-e-defesa-civil/defesa-civil-alerta",
    supplemental: "https://avisos.inmet.gov.br/",
  },
  US: { name: "National Weather Service", url: "https://www.weather.gov/" },
};
export const NWS_HEADERS = { Accept: "application/geo+json", "User-Agent": "NinoPulse-Global/3.0 (vekkai595@gmail.com)" };
const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const xml = new XMLParser({ ignoreAttributes: true, parseTagValue: false, processEntities: false, removeNSPrefix: true });

function safeLink(value, domain, fallback) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === domain || url.hostname.endsWith(`.${domain}`)) ? url.href : fallback;
  } catch {
    return fallback;
  }
}

export function alertRequest(params) {
  const countryCode = params.get("country")?.toUpperCase();
  const lat = params.get("lat");
  const lon = params.get("lon");
  const point = { countryCode, latitude: Number(lat), longitude: Number(lon) };
  return lat?.trim() && lon?.trim() && Object.hasOwn(ALERT_SOURCES, countryCode) && isPoint(point) ? point : null;
}

export function nwsUrl({ latitude, longitude }) {
  return `https://api.weather.gov/alerts/active?point=${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

export function normalizeNws(raw, now = new Date().toISOString()) {
  if (raw?.type !== "FeatureCollection" || !Array.isArray(raw.features)) throw new Error("Invalid NWS response");
  const alerts = raw.features.flatMap(({ id, properties: p }) => {
    if (!p?.id || p.status !== "Actual" || p.messageType === "Cancel" || !(Date.parse(p.expires) > Date.parse(now)) || !p.event) return [];
    return [{
      id: p.id, title: p.event, headline: p.headline, issuer: p.senderName || ALERT_SOURCES.US.name,
      severity: p.severity, start: p.onset || p.effective, expires: p.ends || p.expires,
      description: p.description, instruction: p.instruction, language: "en", url: safeLink(id, "weather.gov", ALERT_SOURCES.US.url),
    }];
  });
  return { checkedAt: now, issuedAt: raw.updated ?? null, alerts };
}

function pointPair(value) {
  const [lat, lon] = value.split(",");
  return { latitude: lat?.length ? Number(lat) : NaN, longitude: lon?.length ? Number(lon) : NaN };
}

export function containsPoint(polygon, { latitude: y, longitude: x }) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    const dx = b.longitude - a.longitude;
    const dy = b.latitude - a.latitude;
    const cross = (x - a.longitude) * dy - (y - a.latitude) * dx;
    if (Math.abs(cross) < 1e-9 && x >= Math.min(a.longitude, b.longitude) && x <= Math.max(a.longitude, b.longitude) &&
        y >= Math.min(a.latitude, b.latitude) && y <= Math.max(a.latitude, b.latitude)) return true;
    if ((a.latitude > y) !== (b.latitude > y) && x < dx * (y - a.latitude) / dy + a.longitude) inside = !inside;
  }
  return inside;
}

function inCircle({ center, radius }, place) {
  const rad = Math.PI / 180;
  const a = Math.sin((place.latitude - center.latitude) * rad / 2) ** 2 +
    Math.cos(place.latitude * rad) * Math.cos(center.latitude * rad) * Math.sin((place.longitude - center.longitude) * rad / 2) ** 2;
  return 12_742 * Math.asin(Math.min(1, Math.sqrt(a))) <= radius;
}

export function parseIdap(raw, now = new Date().toISOString()) {
  if (typeof raw !== "string" || raw.length > 32_000_000 || /<!DOCTYPE|<!ENTITY/i.test(raw) || XMLValidator.validate(raw) !== true) {
    throw new Error("Invalid CAP feed");
  }
  const feed = xml.parse(raw)?.feed;
  const issuedAt = feed?.updated;
  const nowMs = Date.parse(now);
  if (!Number.isFinite(Date.parse(issuedAt)) || Math.abs(nowMs - Date.parse(issuedAt)) > 3 * 60 * 60 * 1000) throw new Error("Stale CAP feed");
  const messages = asList(feed.entry).flatMap((entry) => asList(entry.content?.alert))
    .filter((alert) => alert.status === "Actual" && alert.scope === "Public" && alert.sender && alert.identifier);
  const retired = new Set(messages.filter((alert) => ["Update", "Cancel"].includes(alert.msgType) && Date.parse(alert.sent) <= nowMs)
    .flatMap((alert) => String(alert.references ?? "").split(/\s+/).map((reference) => reference.split(",").slice(0, 2).join(","))));
  const alerts = [];
  for (const alert of messages) {
    const id = `${alert.sender},${alert.identifier}`;
    if (!["Alert", "Update"].includes(alert.msgType) || retired.has(id) || !(Date.parse(alert.sent) <= nowMs)) continue;
    const info = asList(alert.info).find((item) => asList(item.category).includes("Met") && Date.parse(item.expires) > nowMs && item.event);
    if (!info) continue;
    const areas = asList(info.area);
    const polygons = areas.flatMap((area) => asList(area.polygon))
      .map((line) => line.trim().split(/\s+/).map(pointPair).filter(isPoint)).filter((polygon) => polygon.length >= 3);
    const circles = areas.flatMap((area) => asList(area.circle)).flatMap((circle) => {
      const [point, radius] = circle.trim().split(/\s+/);
      const center = pointPair(point);
      return isPoint(center) && Number(radius) > 0 ? [{ center, radius: Number(radius) }] : [];
    });
    alerts.push({
      id, title: info.event, headline: info.headline, issuer: info.senderName || alert.source || "Defesa Civil",
      severity: info.severity, start: info.onset || info.effective || alert.sent, expires: info.expires,
      language: info.language || "pt-BR", description: info.description, instruction: info.instruction,
      url: safeLink(info.web, "gov.br", ALERT_SOURCES.BR.url), polygons, circles,
    });
  }
  return { issuedAt, alerts };
}

export function capAlertsAt(feed, place, now = new Date().toISOString()) {
  const active = feed.alerts.filter((alert) => Date.parse(alert.expires) > Date.parse(now));
  const matches = active.filter(({ polygons, circles }) => polygons.some((polygon) => containsPoint(polygon, place)) ||
    circles.some((circle) => inCircle(circle, place)));
  return {
    checkedAt: now, issuedAt: feed.issuedAt,
    incomplete: active.some(({ polygons, circles }) => !polygons.length && !circles.length),
    alerts: [...new Map(matches.map(({ polygons: _polygons, circles: _circles, ...alert }) => [alert.id, alert])).values()],
  };
}

export function createCapCache(load) {
  let cached;
  let pending;
  return async function getCap() {
    if (cached?.expiresAt > Date.now()) return cached.feed;
    pending ??= (async () => {
      const feed = parseIdap(await load());
      cached = { feed, expiresAt: Date.now() + ALERT_TTL };
      return feed;
    })().finally(() => { pending = null; });
    return pending;
  };
}
