import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const PreferencesContext = createContext(null);
const DEFAULT_ALERTS = { enabled: false, countries: [] };

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeAlerts(value) {
  return {
    enabled: Boolean(value?.enabled),
    countries: Array.isArray(value?.countries) ? [...new Set(value.countries.filter((item) => typeof item === "string"))] : [],
  };
}

export function PreferencesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const value = readJson("ninopulse-favorites", []);
    return Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === "string"))] : [];
  });
  const [alertSettings, setAlertSettingsState] = useState(() => normalizeAlerts(readJson("ninopulse-alerts", DEFAULT_ALERTS)));

  useEffect(() => localStorage.setItem("ninopulse-favorites", JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem("ninopulse-alerts", JSON.stringify(alertSettings)), [alertSettings]);

  const setAlertSettings = (next) => setAlertSettingsState((current) => normalizeAlerts(typeof next === "function" ? next(current) : next));

  const value = useMemo(() => ({
    favorites,
    alertSettings,
    isFavorite: (id) => favorites.includes(id),
    toggleFavorite: (id) => setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]),
    setAlertSettings,
  }), [favorites, alertSettings]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside PreferencesProvider");
  return context;
}
