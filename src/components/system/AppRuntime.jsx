import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Keyboard } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";
import { useLocation, useNavigate } from "react-router-dom";
import { queryClientInstance } from "@/lib/query-client";

function getScrollRoot() {
  return document.getElementById("app-scroll-root") || document.scrollingElement || document.documentElement;
}

function setViewportVariables() {
  const viewport = window.visualViewport;
  const height = viewport?.height || window.innerHeight;
  const offsetTop = viewport?.offsetTop || 0;
  document.documentElement.style.setProperty("--app-height", `${Math.round(height)}px`);
  document.documentElement.style.setProperty("--viewport-offset-top", `${Math.round(offsetTop)}px`);
}

export default function AppRuntime() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setViewportVariables();
    window.addEventListener("resize", setViewportVariables, { passive: true });
    window.addEventListener("orientationchange", setViewportVariables, { passive: true });
    window.visualViewport?.addEventListener("resize", setViewportVariables, { passive: true });
    window.visualViewport?.addEventListener("scroll", setViewportVariables, { passive: true });

    if (Capacitor.isNativePlatform()) {
      document.documentElement.classList.add("native-platform", `${Capacitor.getPlatform()}-platform`);
    }

    return () => {
      window.removeEventListener("resize", setViewportVariables);
      window.removeEventListener("orientationchange", setViewportVariables);
      window.visualViewport?.removeEventListener("resize", setViewportVariables);
      window.visualViewport?.removeEventListener("scroll", setViewportVariables);
    };
  }, []);

  useEffect(() => {
    getScrollRoot()?.scrollTo?.({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    let active = true;
    const handles = [];

    const setup = async () => {
      handles.push(await Keyboard.addListener("keyboardWillShow", (info) => {
        if (!active) return;
        document.documentElement.classList.add("keyboard-open");
        document.documentElement.style.setProperty("--keyboard-height", `${Math.max(0, info.keyboardHeight || 0)}px`);
        window.setTimeout(() => document.activeElement?.scrollIntoView?.({ block: "center", behavior: "smooth" }), 120);
      }));
      handles.push(await Keyboard.addListener("keyboardWillHide", () => {
        if (!active) return;
        document.documentElement.classList.remove("keyboard-open");
        document.documentElement.style.setProperty("--keyboard-height", "0px");
      }));
      handles.push(await CapacitorApp.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          setViewportVariables();
          queryClientInstance.invalidateQueries({ refetchType: "active" });
        }
      }));
      handles.push(await CapacitorApp.addListener("backButton", () => {
        const detail = { handled: false };
        window.dispatchEvent(new CustomEvent("ninopulse:native-back", { detail }));
        if (detail.handled) return;
        if (location.hash) {
          navigate(location.pathname, { replace: true });
          return;
        }
        if (location.pathname !== "/") {
          navigate(-1);
          return;
        }
        const scrollRoot = getScrollRoot();
        if ((scrollRoot?.scrollTop || window.scrollY) > 120) {
          scrollRoot?.scrollTo?.({ top: 0, behavior: "smooth" });
          return;
        }
        CapacitorApp.exitApp();
      }));

      window.requestAnimationFrame(() => {
        window.setTimeout(() => SplashScreen.hide().catch(() => undefined), 120);
      });
    };

    setup().catch((error) => console.warn("Native runtime setup failed", error));
    return () => {
      active = false;
      handles.forEach((handle) => handle?.remove?.());
      document.documentElement.classList.remove("keyboard-open");
    };
  }, [location.hash, location.pathname, navigate]);

  return null;
}
