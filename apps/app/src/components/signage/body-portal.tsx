"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into document.body via a React portal.
 * Ensures modals escape any overflow:hidden / stacking context ancestors.
 */
export function BodyPortal({ children }: { children: React.ReactNode }) {
  const elRef = useRef<HTMLDivElement | null>(null);

  if (!elRef.current && typeof document !== "undefined") {
    elRef.current = document.createElement("div");
    elRef.current.setAttribute("data-portal", "signage-modal");
  }

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    document.body.appendChild(el);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  if (typeof document === "undefined" || !elRef.current) return null;
  return createPortal(children, elRef.current);
}
