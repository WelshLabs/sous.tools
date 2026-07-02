"use client";

import React, { useEffect } from "react";
import { useDisplayPlayer } from "./use-display-player";
import { PairingScreen } from "./pairing-screen";
import { SlideCarousel } from "./slide-carousel";
import { buildAllAnimationCss } from "@soustools/domain-signage";
import { SignageDisplay } from "@soustools/api-types";
import { RawDbPosItem } from "./helpers";

interface DisplayPlayerProps {
  displayId: string;
  initialDisplay?: SignageDisplay | null;
  initialLayout?: any | null;
  initialItems?: RawDbPosItem[];
  initialErrorState?: string | null;
}

export function DisplayPlayer({ displayId, initialDisplay, initialLayout, initialItems, initialErrorState }: DisplayPlayerProps) {
  const { display, layout, items, loading, errorState } =
    useDisplayPlayer(displayId, initialDisplay, initialLayout, initialItems, initialErrorState);

  useEffect(() => {
    const config = layout?.config;
    if (!config) return;

    // Aggregate all unique Google Fonts to load
    const fontsToLoad = new Set<string>();
    if (config.googleFont) fontsToLoad.add(config.googleFont);

    // Clean up existing dynamic font links
    document.querySelectorAll("[id^='signage-dynamic-font']").forEach((el) => el.remove());
    Array.from(fontsToLoad).forEach((font, idx) => {
      const link = document.createElement("link");
      link.id = `signage-dynamic-font-${idx}`;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}&display=swap`;
      document.head.appendChild(link);
    });

    // Inject custom CSS
    document.getElementById("signage-custom-css")?.remove();
    if (config.customCss) {
      const style = document.createElement("style");
      style.id = "signage-custom-css";
      style.textContent = config.customCss;
      document.head.appendChild(style);
    }

    // Inject animation keyframes from menuItemStyles
    document.getElementById("signage-item-animations")?.remove();
    if (config.menuItemStyles) {
      const animCss = buildAllAnimationCss(config.menuItemStyles);
      if (animCss) {
        const style = document.createElement("style");
        style.id = "signage-item-animations";
        style.textContent = animCss;
        document.head.appendChild(style);
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
        <p className="text-zinc-500 dark:text-zinc-400 font-sans">{errorState}</p>
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
        menuItemStyles={menuItemStyles}
      />
    </main>
  );
}
