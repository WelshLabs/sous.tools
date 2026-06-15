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

    // Aggregate all unique Google Fonts to load
    const fontsToLoad = new Set<string>();
    if (config.googleFont) {
      fontsToLoad.add(config.googleFont);
    }
    if (config.typography) {
      const {
        menuItemTitle,
        menuItemPrice,
        menuItemDescription,
        marketingText,
      } = config.typography;
      if (menuItemTitle) fontsToLoad.add(menuItemTitle);
      if (menuItemPrice) fontsToLoad.add(menuItemPrice);
      if (menuItemDescription) fontsToLoad.add(menuItemDescription);
      if (marketingText) fontsToLoad.add(marketingText);
    }

    // Clean up existing dynamic font links
    const fontIdPrefix = "signage-dynamic-font";
    const existingLinks = document.querySelectorAll(`[id^='${fontIdPrefix}']`);
    existingLinks.forEach((el) => el.remove());

    // Inject links for all unique fonts
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
  const soldOutBehavior = layout?.config?.soldOutBehavior || "LABEL";

  return (
    <main
      className="min-h-screen bg-[oklch(0.08_0.01_260)] text-white"
      style={{
        fontFamily: layout?.config?.googleFont || "inherit",
        // CSS variables for typography overrides
        ["--menu-title-font" as any]: layout?.config?.typography?.menuItemTitle || "inherit",
        ["--menu-price-font" as any]: layout?.config?.typography?.menuItemPrice || "inherit",
        ["--menu-description-font" as any]: layout?.config?.typography?.menuItemDescription || "inherit",
        ["--marketing-text-font" as any]: layout?.config?.typography?.marketingText || "inherit",
        ["--menu-title-color" as any]: layout?.config?.typography?.menuItemTitleColor || "inherit",
        ["--menu-price-color" as any]: layout?.config?.typography?.menuItemPriceColor || "inherit",
        ["--menu-desc-color" as any]: layout?.config?.typography?.menuItemDescriptionColor || "inherit",
        ["--marketing-text-color" as any]: layout?.config?.typography?.marketingTextColor || "inherit",
      }}
    >
      <SlideCarousel
        slides={slides}
        items={items}
        soldOutBehavior={soldOutBehavior}
      />
    </main>
  );
}
