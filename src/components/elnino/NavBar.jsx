import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Bell, BookOpen, Download, Globe2, Home, Languages, Laptop, Map, MapPin, Menu, Moon, Sun, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { canInstall, install } = usePwaInstall();

  useEffect(() => {
    const root = document.getElementById("app-scroll-root");
    const handler = () => setScrolled((root?.scrollTop || window.scrollY) > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    root?.addEventListener("scroll", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
      root?.removeEventListener("scroll", handler);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onNativeBack = (event) => {
      event.detail.handled = true;
      setMobileOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("ninopulse:native-back", onNativeBack);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("ninopulse:native-back", onNativeBack);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const items = [
    { label: t("nav.home"), to: "/", icon: Home },
    { label: t("nav.localWeather"), to: "/local-weather", icon: MapPin },
    { label: t("nav.map"), to: "/map", icon: Map },
    { label: t("nav.enso"), to: "/enso", icon: BarChart3 },
    { label: t("nav.alerts"), to: "/alerts", icon: Bell },
    { label: t("nav.explore"), to: "/explore", icon: BookOpen },
  ];

  const controls = (
    <>
      <button
        type="button"
        onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
        className="control-button"
        aria-label={t("common.language")}
        title={t("common.language")}
      >
        <Languages className="h-4 w-4" />
        <span>{language === "pt" ? "EN" : "PT"}</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="control-button"
        aria-label={t("common.theme")}
        title={t("common.theme")}
      >
        {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {theme && theme !== "system" && (
        <button type="button" onClick={() => setTheme("system")} className="control-button" aria-label={t("common.systemTheme")} title={t("common.systemTheme")}>
          <Laptop className="h-4 w-4" />
        </button>
      )}
      {canInstall && (
        <button type="button" onClick={install} className="control-button text-primary" title={t("common.install")}>
          <Download className="h-4 w-4" />
          <span className="hidden lg:inline">{t("common.install")}</span>
        </button>
      )}
    </>
  );

  return (
    <>
      <a href="#main-content" className="sr-only fixed left-3 top-3 z-[2000] rounded-lg bg-background px-3 py-2 text-sm focus:not-sr-only">{t("common.skip")}</a>
      <motion.header
        initial={{ y: -72 }}
        animate={{ y: 0 }}
        className={`safe-top fixed inset-x-0 top-0 z-[1000] border-b transition-all ${scrolled || mobileOpen ? "border-border/70 bg-background/95 shadow-sm backdrop-blur-xl" : "border-transparent bg-background/60 backdrop-blur-md"}`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 rounded-xl" onClick={() => setMobileOpen(false)}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Globe2 className="h-5 w-5" />
            </span>
            <span className="truncate font-display text-sm font-bold sm:text-base">NiñoPulse Global</span>
          </Link>

          <nav className="hidden shrink-0 items-center gap-1 lg:flex" aria-label={language === "pt" ? "Navegação principal" : "Primary navigation"}>
            {items.map(({ label, to, icon: Icon }) => (
              <Link key={to} to={to} className={`nav-link ${pathname === to ? "nav-link-active" : ""}`} aria-current={pathname === to ? "page" : undefined}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">{controls}</div>

          <button type="button" className="control-button h-11 w-11 shrink-0 px-0 lg:hidden" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-controls="mobile-primary-menu" aria-label={t("common.menu")}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div id="mobile-primary-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
              <nav aria-label={language === "pt" ? "Navegação principal" : "Primary navigation"} className="mx-auto max-h-[65dvh] max-w-7xl space-y-2 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
                {items.map(({ label, to, icon: Icon }) => (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${pathname === to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`} aria-current={pathname === to ? "page" : undefined}>
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                ))}
                <div className="flex flex-wrap gap-2 border-t border-border pt-3">{controls}</div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
