import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("NiñoPulse interface error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-[100dvh] place-items-center bg-background px-5 text-foreground">
        <section className="surface-card w-full max-w-lg p-6 text-center sm:p-8" role="alert">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">A interface encontrou um erro</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Seus favoritos e preferências continuam salvos neste dispositivo. Recarregue o app para tentar novamente.
          </p>
          <button type="button" className="primary-action mt-6 w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" /> Recarregar NiñoPulse
          </button>
        </section>
      </main>
    );
  }
}
