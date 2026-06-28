import React, { useEffect, useRef, useState } from "react";

export default function DeferredSection({ children, minHeight = 280, rootMargin = "700px 0px", label = "NiñoPulse…" }) {
  const [ready, setReady] = useState(false);
  const anchorRef = useRef(null);

  useEffect(() => {
    if (ready) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setReady(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setReady(true);
      observer.disconnect();
    }, { rootMargin });

    if (anchorRef.current) observer.observe(anchorRef.current);
    return () => observer.disconnect();
  }, [ready, rootMargin]);

  return (
    <div ref={anchorRef} style={!ready ? { minHeight } : undefined}>
      {ready ? children : (
        <div className="mx-auto grid max-w-7xl place-items-center px-4 text-xs text-muted-foreground" style={{ minHeight }} aria-hidden="true">
          {label}
        </div>
      )}
    </div>
  );
}
