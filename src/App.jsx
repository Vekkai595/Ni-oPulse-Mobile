import React, { Suspense, lazy } from "react";
import { Capacitor } from "@capacitor/core";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { queryClientInstance } from "@/lib/query-client";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import Home from "@/pages/Home";
import MobileBottomNav from "@/components/elnino/MobileBottomNav";
import AppRuntime from "@/components/system/AppRuntime";
import ConnectivityBanner from "@/components/system/ConnectivityBanner";
import PwaUpdatePrompt from "@/components/system/PwaUpdatePrompt";

const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ResearchPage = lazy(() => import("@/pages/ResearchPage"));
const ApiDocsPage = lazy(() => import("@/pages/ApiDocsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const LocalWeatherPage = lazy(() => import("@/pages/LocalWeather"));

function PageLoader() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background px-4 text-sm text-muted-foreground" role="status">
      <span className="loading-pulse">NiñoPulse Global…</span>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LanguageProvider>
          <PreferencesProvider>
            <Router>
              <AppRuntime />
              <div id="app-scroll-root" className="app-viewport">
                <ConnectivityBanner />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/research" element={<ResearchPage />} />
                    <Route path="/api-docs" element={<ApiDocsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/local-weather" element={<LocalWeatherPage />} />
                    <Route path="*" element={<Home />} />
                  </Routes>
                </Suspense>
                {!Capacitor.isNativePlatform() && <PwaUpdatePrompt />}
                <MobileBottomNav />
              </div>
            </Router>
          </PreferencesProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
