import { Suspense, lazy } from "react";
import { Capacitor } from "@capacitor/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { queryClientInstance } from "@/lib/query-client";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { PlacesProvider } from "@/contexts/PlacesContext";
import MobileBottomNav from "@/components/elnino/MobileBottomNav";
import NavBar from "@/components/elnino/NavBar";
import WatchMonitor from "@/components/pulse/WatchMonitor";
import AppRuntime from "@/components/system/AppRuntime";
import ConnectivityBanner from "@/components/system/ConnectivityBanner";
import PwaUpdatePrompt from "@/components/system/PwaUpdatePrompt";
import Home from "@/pages/Home";

const About = lazy(() => import("@/pages/AboutPage"));
const Research = lazy(() => import("@/pages/ResearchPage"));
const Api = lazy(() => import("@/pages/ApiDocsPage"));
const Privacy = lazy(() => import("@/pages/PrivacyPage"));
const Earth = lazy(() => import("@/pages/EarthPage"));
const Enso = lazy(() => import("@/pages/EnsoPage"));
const Alerts = lazy(() => import("@/pages/AlertsPage"));
const Explore = lazy(() => import("@/pages/ExplorePage"));
const LocalWeather = lazy(() => import("@/pages/LocalWeather"));

export default function App() {
  return <QueryClientProvider client={queryClientInstance}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LanguageProvider><PreferencesProvider><PlacesProvider><BrowserRouter>
        <AppRuntime /><WatchMonitor />
        <div id="app-scroll-root" className="app-viewport">
          <NavBar />
          <ConnectivityBanner />
          <Suspense fallback={<div className="app-pages"><div className="np-content loading-pulse" role="status">NiñoPulse Global…</div></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route element={<div className="app-pages"><Outlet /></div>}>
                <Route path="/local-weather" element={<LocalWeather />} />
                <Route path="/map" element={<Earth />} />
                <Route path="/enso" element={<Enso />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/about" element={<About />} />
                <Route path="/research" element={<Research />} />
                <Route path="/api-docs" element={<Api />} />
                <Route path="/privacy" element={<Privacy />} />
              </Route>
              <Route path="/explore/regions" element={<Navigate to="/#paises" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          {!Capacitor.isNativePlatform() && <PwaUpdatePrompt />}
          <MobileBottomNav />
        </div>
      </BrowserRouter></PlacesProvider></PreferencesProvider></LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>;
}
