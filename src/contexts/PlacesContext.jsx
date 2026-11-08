import { createContext, useContext, useEffect, useState } from "react";
import { readLocal, writeLocal } from "@/lib/localStore";
import { isPlace } from "@/lib/weather";

const Places = createContext(null);
const KEY = "ninopulse-places-v3";
export const FAVORITES_LIMIT = 12;

export function PlacesProvider({ children }) {
  const [state, setState] = useState(() => {
    const stored = readLocal(KEY, {});
    const main = isPlace(stored.main) && !stored.main.device ? stored.main : null;
    const favorites = Array.isArray(stored.favorites) ? stored.favorites.filter((place) => isPlace(place) && !place.device).slice(0, FAVORITES_LIMIT) : [];
    return { main, active: main, favorites };
  });
  useEffect(() => writeLocal(KEY, { main: state.main, favorites: state.favorites }), [state.main, state.favorites]);

  function select(place) {
    setState((current) => ({ ...current, active: place, main: current.main ?? (place.device ? null : place) }));
  }

  function setMain(place) {
    if (!place?.device) setState((current) => ({ ...current, main: place, active: place }));
  }

  function toggle(place) {
    if (!place || place.device) return;
    setState((current) => {
      const exists = current.favorites.some(({ id }) => id === place.id);
      if (!exists && current.favorites.length >= FAVORITES_LIMIT) return current;
      const favorites = exists ? current.favorites.filter(({ id }) => id !== place.id) : [...current.favorites, place];
      return { ...current, favorites };
    });
  }

  return <Places.Provider value={{ ...state, select, setMain, toggle, forget: () => setState((current) => ({ ...current, active: current.main })) }}>{children}</Places.Provider>;
}

export const usePlaces = () => useContext(Places);
