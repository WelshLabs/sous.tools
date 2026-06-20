"use client";

import React, { useEffect } from "react";
import { useDisplayPlayer } from "./use-display-player";
import { PairingScreen } from "./pairing-screen";
import { SlideCarousel } from "./slide-carousel";
import { buildAllAnimationCss } from "./menu-item-style-utils";
import { MenuItemStyles } from "@soustools/api-types";
import { ScaleWrapper } from "./scale-wrapper";
import { injectSignageHead } from "./helpers";

const defaultMenuItemStyles: MenuItemStyles = {
  regular: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    titleColor: "#f8fafc",
    priceColor: "#00f0ff",
    descriptionColor: "#94a3b8",
  },
  highlighted: {
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    borderColor: "#00f0ff",
    borderWidth: 1,
    titleColor: "#f8fafc",
    priceColor: "#00f0ff",
    descriptionColor: "#94a3b8",
  },
  soldOut: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    titleColor: "#f8fafc",
    priceColor: "#00f0ff",
    descriptionColor: "#94a3b8",
    dimOpacity: 0.4,
    strikethrough: true,
  },
};


interface DisplayPlayerProps {
  displayId: string;
}

export function DisplayPlayer({ displayId }: DisplayPlayerProps) {
  const { display, layout, items, loading, errorState } =
    useDisplayPlayer(displayId);

  useEffect(() => {
    const config = layout?.config;
    if (!config) return;
    const resolvedStyles = config.menuItemStyles || defaultMenuItemStyles;
    const animCss = buildAllAnimationCss(resolvedStyles);
    injectSignageHead(config, animCss);
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

  const config = layout?.config;
  const slides = config?.slides || [];
  const menuItemStyles = config?.menuItemStyles || defaultMenuItemStyles;
  const isResponsive = config?.aspectRatio === "responsive";
  const scaleToFit = config?.scaleToFit !== false;

  const content = (
    <SlideCarousel
      slides={slides}
      items={items}
      menuItemStyles={menuItemStyles}
    />
  );

  if (!isResponsive && scaleToFit) {
    return (
      <ScaleWrapper>
        <div className="w-full h-full st-layout-background relative overflow-hidden" style={{ fontFamily: config?.googleFont || "inherit" }}>
          {content}
        </div>
      </ScaleWrapper>
    );
  }

  return (
    <main
      className="min-h-screen bg-[oklch(0.08_0.01_260)] text-white st-layout-background relative overflow-hidden"
      style={{ fontFamily: config?.googleFont || "inherit" }}
    >
      {content}
    </main>
  );
}
