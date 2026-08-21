"use client";

import { useEffect } from "react";
import { useDisplayPlayer } from "./use-display-player";
import { PairingScreen } from "./pairing-screen";
import { SlideCarousel } from "./slide-carousel";
import { buildAllAnimationCss } from "./menu-item-style-utils";
import { type SignageDisplay } from "@soustools/api-types";
import { type RawDbPosItem } from "./helpers";

interface DisplayPlayerProps {
  displayId: string;
  initialDisplay?: SignageDisplay | null;
  initialLayout?: any | null;
  initialItems?: RawDbPosItem[];
  initialErrorState?: string | null;
}

export function DisplayPlayer({
  displayId,
  initialDisplay,
  initialLayout,
  initialItems,
  initialErrorState,
}: DisplayPlayerProps) {
  const { display, layout, items, loading, errorState } = useDisplayPlayer(
    displayId,
    initialDisplay,
    initialLayout,
    initialItems,
    initialErrorState,
  );

  useEffect(() => {
    const config = layout?.config;
    if (!config) return;

    // Aggregate all unique Google Fonts to load
    const fontsToLoad = new Set<string>();
    if (config.googleFont) fontsToLoad.add(config.googleFont);

    // Clean up existing dynamic font links
    document
      .querySelectorAll("[id^='signage-dynamic-font']")
      .forEach((el) => el.remove());
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
      <div className="flex min-h-screen items-center justify-center bg-[oklch(0.08_0.01_260)] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[oklch(0.60_0.25_250)] border-t-transparent" />
      </div>
    );
  }

  if (errorState && !display) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[oklch(0.08_0.01_260)] p-6 text-white">
        <h2 className="font-brand mb-2 text-2xl font-bold text-[oklch(0.60_0.25_25)]">
          Display Load Failed
        </h2>
        <p className="dark:text-muted-foreground font-sans text-zinc-500">
          {errorState}
        </p>
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
        ["--menu-title-font" as any]:
          layout?.config?.typography?.menuItemTitle || "inherit",
        ["--menu-price-font" as any]:
          layout?.config?.typography?.menuItemPrice || "inherit",
        ["--menu-description-font" as any]:
          layout?.config?.typography?.menuItemDescription || "inherit",
        ["--marketing-text-font" as any]:
          layout?.config?.typography?.marketingText || "inherit",
        ["--menu-title-color" as any]:
          layout?.config?.typography?.menuItemTitleColor || "inherit",
        ["--menu-price-color" as any]:
          layout?.config?.typography?.menuItemPriceColor || "inherit",
        ["--menu-desc-color" as any]:
          layout?.config?.typography?.menuItemDescriptionColor || "inherit",
        ["--marketing-text-color" as any]:
          layout?.config?.typography?.marketingTextColor || "inherit",
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
