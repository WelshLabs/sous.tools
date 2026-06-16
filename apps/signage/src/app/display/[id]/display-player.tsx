"use client";

import React, { useEffect } from "react";
import { useDisplayPlayer } from "./use-display-player";
import { PairingScreen } from "./pairing-screen";
import { SlideCarousel } from "./slide-carousel";
import { buildAllAnimationCss } from "./menu-item-style-utils";

interface DisplayPlayerProps {
  displayId: string;
}

export function DisplayPlayer({ displayId }: DisplayPlayerProps) {
  const { display, layout, items, loading, errorState } =
    useDisplayPlayer(displayId);

  useEffect(() => {
    const config = layout?.config;
    if (!config) return;

    const fontsToLoad = new Set<string>();
    if (config.googleFont) fontsToLoad.add(config.googleFont);
    if (config.typography) {
      const { menuItemTitle, menuItemPrice, menuItemDescription, marketingText } = config.typography;
      if (menuItemTitle) fontsToLoad.add(menuItemTitle);
      if (menuItemPrice) fontsToLoad.add(menuItemPrice);
      if (menuItemDescription) fontsToLoad.add(menuItemDescription);
      if (marketingText) fontsToLoad.add(marketingText);
    }

    const fontIdPrefix = "signage-dynamic-font";
    document.querySelectorAll(`[id^='${fontIdPrefix}']`).forEach((el) => el.remove());

    Array.from(fontsToLoad).forEach((font, idx) => {
      const link = document.createElement("link");
      link.id = `${fontIdPrefix}-${idx}`;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}&display=swap`;
      document.head.appendChild(link);
    });

    const styleId = "signage-custom-css";
    document.getElementById(styleId)?.remove();
    if (config.customCss) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = config.customCss;
      document.head.appendChild(style);
    }

    const animStyleId = "signage-item-animations";
    document.getElementById(animStyleId)?.remove();
    if (config.menuItemStyles) {
      const animCss = buildAllAnimationCss(config.menuItemStyles);
      if (animCss) {
        const animStyle = document.createElement("style");
        animStyle.id = animStyleId;
        animStyle.textContent = animCss;
        document.head.appendChild(animStyle);
      }
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

  if (display && !display.deckId) {
    return <PairingScreen code={display.id.slice(0, 8).toUpperCase()} />;
  }

  const slides = layout?.config?.slides || [];
  const menuItemStyles = layout?.config?.menuItemStyles;

  return (
    <main
      className="min-h-screen bg-[oklch(0.08_0.01_260)] text-white"
      style={{ fontFamily: layout?.config?.googleFont || "inherit" }}
    >
      <SlideCarousel
        slides={slides}
        items={items}
        menuItemStyles={menuItemStyles}
      />
    </main>
  );
}
