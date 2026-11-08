import { ArrowUpRight, CircleAlert, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function useCopy() {
  const { language, t } = useLanguage();
  return { language, t, copy: (pt, en) => language === "pt" ? pt : en };
}

/** @param {{title: string, description: string, children?: import("react").ReactNode}} props */
export function PageHeading({ title, description, children }) {
  return <header className="np-heading"><div><h1>{title}</h1><p>{description}</p></div>{children}</header>;
}

/** @param {{icon?: import("lucide-react").LucideIcon, title: string, description?: string, action?: import("react").ReactNode}} props */
export function SectionTitle({ icon: Icon, title, description, action }) {
  return <div className="np-section-title">
    <div><h2>{Icon && <Icon size={19} aria-hidden="true" />}{title}</h2>{description && <p>{description}</p>}</div>{action}
  </div>;
}

export function SourceLink({ href, children }) {
  return <a className="np-link" href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={14} aria-hidden="true" /></a>;
}

export function Refresh({ onClick, busy = false, disabled = false }) {
  const { copy } = useCopy();
  return <button className="np-button np-icon" type="button" onClick={onClick} disabled={busy || disabled} aria-label={copy("Atualizar dados", "Refresh data")}>
    <RefreshCw size={17} className={busy ? "animate-spin" : ""} aria-hidden="true" />
  </button>;
}

export function Note({ children, warning = false }) {
  return <p className={`np-note${warning ? " np-note-warn" : ""}`} role="status">{warning && <CircleAlert size={16} aria-hidden="true" />}{children}</p>;
}
