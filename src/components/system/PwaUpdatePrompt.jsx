import React, { useEffect } from "react";
import { Download, RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PwaUpdatePrompt() {
  const { language } = useLanguage();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisterError(error) {
      console.warn("Service worker registration failed", error);
    },
  });

  useEffect(() => {
    if (!offlineReady) return undefined;
    const timer = window.setTimeout(() => setOfflineReady(false), 4500);
    return () => window.clearTimeout(timer);
  }, [offlineReady, setOfflineReady]);

  const visible = offlineReady || needRefresh;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="pwa-update-toast"
          role="status"
          aria-live="polite"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            {needRefresh ? <RefreshCw className="h-5 w-5" /> : <Download className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{needRefresh
              ? (language === "pt" ? "Nova versão disponível" : "New version available")
              : (language === "pt" ? "Pronto para uso offline" : "Ready for offline use")}</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{needRefresh
              ? (language === "pt" ? "Atualize para receber as melhorias mais recentes." : "Update to receive the latest improvements.")
              : (language === "pt" ? "O conteúdo essencial foi salvo neste dispositivo." : "Essential content was saved on this device.")}</p>
          </div>
          {needRefresh ? (
            <button type="button" className="control-button shrink-0 text-primary" onClick={() => updateServiceWorker(true)}>
              {language === "pt" ? "Atualizar" : "Update"}
            </button>
          ) : (
            <button type="button" className="control-button h-10 w-10 shrink-0 px-0" aria-label="Fechar" onClick={() => setOfflineReady(false)}>
              <X className="h-4 w-4" />
            </button>
          )}
          {needRefresh && (
            <button type="button" className="control-button h-10 w-10 shrink-0 px-0" aria-label="Fechar" onClick={() => setNeedRefresh(false)}>
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
