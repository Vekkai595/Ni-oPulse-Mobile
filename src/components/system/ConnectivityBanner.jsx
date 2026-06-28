import React, { useEffect, useState } from "react";
import { CheckCircle2, WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ConnectivityBanner() {
  const { language } = useLanguage();
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    let timer;
    const handleOnline = () => {
      setOnline(true);
      setRestored(true);
      timer = window.setTimeout(() => setRestored(false), 3200);
    };
    const handleOffline = () => {
      window.clearTimeout(timer);
      setRestored(false);
      setOnline(false);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(!online || restored) && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className={`app-status-banner ${online ? "app-status-online" : "app-status-offline"}`}
          role="status"
          aria-live="polite"
        >
          {online ? <CheckCircle2 className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span>{online
            ? (language === "pt" ? "Conexão restaurada. Os dados serão atualizados." : "Connection restored. Data will refresh.")
            : (language === "pt" ? "Você está offline. O último conteúdo salvo continua disponível." : "You are offline. The latest saved content remains available.")}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
