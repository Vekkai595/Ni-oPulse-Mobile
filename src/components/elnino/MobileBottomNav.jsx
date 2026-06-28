import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Download, Home, Languages, Laptop, Map, Moon, Settings, Sun, X, MapPin, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export default function MobileBottomNav() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { canInstall, install } = usePwaInstall();

  useEffect(() => {
    if (location.pathname !== "/" || location.hash !== "#mapa") return;
    const timer = window.setTimeout(() => {
      document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!settingsOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    const onNativeBack = (event) => {
      event.detail.handled = true;
      setSettingsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("ninopulse:native-back", onNativeBack);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("ninopulse:native-back", onNativeBack);
    };
  }, [settingsOpen]);

  function openMap() {
    if (location.pathname === "/" && location.hash === "#mapa") {
      document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate({ pathname: "/", hash: "#mapa" });
  }

  const isHome = location.pathname === "/" && location.hash !== "#mapa";
  const isMap = location.pathname === "/" && location.hash === "#mapa";
  const isResearch = location.pathname === "/research";
  const isLocalWeather = location.pathname === "/local-weather";

  return (
    <>
      <nav className="mobile-bottom-nav md:hidden" aria-label={language === "pt" ? "Navegação inferior" : "Bottom navigation"}>
        <Link to="/" className={`mobile-bottom-item ${isHome ? "mobile-bottom-item-active" : ""}`} aria-current={isHome ? "page" : undefined}>
          <Home className="h-5 w-5" />
          <span>{t("nav.home")}</span>
        </Link>
        <button type="button" onClick={openMap} className={`mobile-bottom-item ${isMap ? "mobile-bottom-item-active" : ""}`} aria-current={isMap ? "page" : undefined}>
          <Map className="h-5 w-5" />
          <span>{t("nav.map")}</span>
        </button>
        <Link to="/research" className={`mobile-bottom-item ${isResearch ? "mobile-bottom-item-active" : ""}`} aria-current={isResearch ? "page" : undefined}>
          <BarChart3 className="h-5 w-5" />
          <span>{t("nav.research")}</span>
        </Link>
        <Link to="/local-weather" className={`mobile-bottom-item ${isLocalWeather ? "mobile-bottom-item-active" : ""}`} aria-current={isLocalWeather ? "page" : undefined}>
          <MapPin className="h-5 w-5" />
          <span>{t("nav.localWeather", language === "pt" ? "Clima" : "Weather")}</span>
        </Link>
        <button type="button" onClick={() => setSettingsOpen(true)} className={`mobile-bottom-item ${settingsOpen ? "mobile-bottom-item-active" : ""}`} aria-expanded={settingsOpen}>
          <Settings className="h-5 w-5" />
          <span>{t("common.settings", language === "pt" ? "Ajustes" : "Settings")}</span>
        </button>
      </nav>

      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t("common.close")}
              className="fixed inset-0 z-[1450] bg-black/50 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-settings-title"
              className="mobile-settings-sheet md:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/25" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">NiñoPulse</p>
                  <h2 id="mobile-settings-title" className="mt-1 font-display text-2xl font-bold">
                    {t("common.settings", language === "pt" ? "Ajustes" : "Settings")}
                  </h2>
                </div>
                <button ref={closeButtonRef} type="button" className="control-button h-11 w-11 px-0" onClick={() => setSettingsOpen(false)} aria-label={t("common.close")}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("common.language")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setLanguage("pt")} className={`mobile-setting-option ${language === "pt" ? "mobile-setting-option-active" : ""}`} aria-pressed={language === "pt"}>
                      <Languages className="h-5 w-5" /> Português
                    </button>
                    <button type="button" onClick={() => setLanguage("en")} className={`mobile-setting-option ${language === "en" ? "mobile-setting-option-active" : ""}`} aria-pressed={language === "en"}>
                      <Languages className="h-5 w-5" /> English
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("common.theme")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setTheme("light")} className={`mobile-setting-option flex-col gap-1 px-2 text-xs ${theme === "light" ? "mobile-setting-option-active" : ""}`} aria-pressed={theme === "light"}>
                      <Sun className="h-5 w-5" /> {t("common.light")}
                    </button>
                    <button type="button" onClick={() => setTheme("dark")} className={`mobile-setting-option flex-col gap-1 px-2 text-xs ${theme === "dark" ? "mobile-setting-option-active" : ""}`} aria-pressed={theme === "dark"}>
                      <Moon className="h-5 w-5" /> {t("common.dark")}
                    </button>
                    <button type="button" onClick={() => setTheme("system")} className={`mobile-setting-option flex-col gap-1 px-2 text-xs ${theme === "system" ? "mobile-setting-option-active" : ""}`} aria-pressed={theme === "system"}>
                      <Laptop className="h-5 w-5" /> {t("common.system")}
                    </button>
                  </div>
                </div>

                <Link to="/privacy" onClick={() => setSettingsOpen(false)} className="mobile-setting-option justify-start">
                  <ShieldCheck className="h-5 w-5" /> {t("nav.privacy")}
                </Link>

                {canInstall && (
                  <button type="button" onClick={install} className="primary-action w-full">
                    <Download className="h-5 w-5" /> {t("common.install")}
                  </button>
                )}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
