"use client";

import React, { useEffect } from "react";
import { useDisplayPlayer } from "./use-display-player";
import { PairingScreen } from "./pairing-screen";
import { SlideCarousel } from "./slide-carousel";

interface DisplayPlayerProps {
  displayId: string;
}

export function DisplayPlayer({ displayId }: DisplayPlayerProps) {
  const { display, layout, items, loading, errorState } =
    useDisplayPlayer(displayId);

  useEffect(() => {
    const config = layout?.config;
    if (!config) return;

    if (config.googleFont) {
      const fontId = "signage-dynamic-font";
      document.getElementById(fontId)?.remove();
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${config.googleFont.replace(/\s+/g, "+")}&display=swap`;
      document.head.appendChild(link);
    }

    const styleId = "signage-custom-css";
    document.getElementById(styleId)?.remove();
    if (config.customCss) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = config.customCss;
      document.head.appendChild(style);
    }
  }, [layout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white">
        <div className="w-8 h-8 border-4 border-t-transparent border-[oklch(0.60_0.25_250)] rounded-full animate-spin" />
      </div>
    );
  }

  if (errorState && !display) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white p-6">
        <h2 className="text-2xl font-bold text-[oklch(0.60_0.25_25)] mb-2 font-brand">
          Display Load Failed
        </h2>
        <p className="text-zinc-400 font-sans">{errorState}</p>
      </div>
    );
  }

  if (display && !display.isPaired) {
    return <PairingScreen code={display.pairingCode || "PAIR"} />;
  }

  const slides = layout?.config?.slides || [];
  const soldOutBehavior = layout?.config?.soldOutBehavior || "LABEL";

  return (
    <main
      className="min-h-screen bg-[oklch(0.08_0.01_260)] text-white"
      style={{ fontFamily: layout?.config?.googleFont || "inherit" }}
    >
      <SlideCarousel
        slides={slides}
        items={items}
        soldOutBehavior={soldOutBehavior}
      />
    </main>
  );
}
