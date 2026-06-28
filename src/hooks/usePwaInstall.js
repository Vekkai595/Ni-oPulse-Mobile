import { useEffect, useState } from "react";

export function usePwaInstall() {
  const [promptEvent, setPromptEvent] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setPromptEvent(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!promptEvent) return false;
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    setPromptEvent(null);
    return result.outcome === "accepted";
  }

  return { canInstall: Boolean(promptEvent), install };
}
