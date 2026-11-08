import { readLocal, writeLocal } from "./localStore.js";
import { compareForecast, weatherSnapshots } from "./weather.js";

const KEY = "ninopulse-watch-v3";
export const WATCH_LIMIT = 4;
const DEFAULT = { weather: false, official: false, enso: false, notify: false };
const DAY = 86_400_000;
const listeners = new Set();
let current;
export const watchSnapshot = () => current ??= readLocal(KEY, { settings: DEFAULT, baselines: {}, events: [] });

export function watchSubscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next) {
  current = next;
  writeLocal(KEY, next);
  listeners.forEach((listener) => listener());
}

export function changeWatch(key, enabled) {
  const state = watchSnapshot();
  const baselines = Object.fromEntries(Object.entries(state.baselines).filter(([id]) => !id.startsWith(`${key}:`)));
  const events = state.events.filter((event) => event.kind !== key);
  commit({ ...state, baselines, events, settings: { ...state.settings, [key]: enabled } });
}

export function recordWatch(kind, data, place, now = Date.now()) {
  const state = watchSnapshot();
  const key = `${kind}:${place?.id ?? "global"}`;
  const prior = state.baselines[key];
  const stamp = kind === "weather" ? data.fetchedAt : kind === "official" ? data.checkedAt : data.current?.issuedAt;
  if (!Number.isFinite(Date.parse(stamp)) || (prior && Date.parse(stamp) <= Date.parse(prior.stamp))) return null;

  let detail;
  let baseline = { stamp };
  if (kind === "weather") {
    const date = data.current.time.slice(0, 10);
    const { changes } = compareForecast(data, weatherSnapshots(place));
    if (prior && changes.length && prior.lastChange !== date) detail = changes;
    baseline = { stamp, lastChange: detail ? date : prior?.lastChange };
  }
  if (kind === "official") {
    const active = data.alerts.filter(({ expires }) => Date.parse(expires) > now);
    baseline = { stamp, ids: active.map(({ id }) => id) };
    const newAlerts = prior ? active.filter(({ id }) => !prior.ids.includes(id)) : [];
    if (newAlerts.length) detail = newAlerts.map(({ title }) => title);
  }
  if (kind === "enso" && prior) detail = data.current.phase || "NOAA/CPC";

  const event = detail ? { id: `${key}:${stamp}`, stamp, kind, place: place?.name, placeId: place?.id, detail } : null;
  const retained = Object.fromEntries(Object.entries(state.baselines).filter(([, item]) => now - Date.parse(item.stamp) <= 120 * DAY));
  const events = (event ? [event, ...state.events] : state.events).filter((item) => now - Date.parse(item.stamp) <= 7 * DAY);
  commit({ ...state, baselines: { ...retained, [key]: baseline }, events: events.slice(0, 25) });
  return event;
}
