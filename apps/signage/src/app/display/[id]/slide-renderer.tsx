"use client";

import React from "react";
import { SignageSlide, PosItem, MenuItemStyles } from "@soustools/api-types";
import { ColumnLayoutRenderer } from "./column-layout-renderer";

const FALLBACK_STYLES: MenuItemStyles = {
  regular: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: "16px",
    titleColor: "#ffffff",
    priceColor: "oklch(0.70 0.25 150)",
    descriptionColor: "#94a3b8",
  },
  highlighted: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "oklch(0.60 0.25 250)",
    borderWidth: 1,
    shadow: "0 0 20px -3px oklch(0.60 0.25 250)",
    animation: "pulse-glow",
    icon: "\u2b50",
    iconPosition: "top-right-corner",
  },
  soldOut: {
    dimOpacity: 0.45,
    badge: {
      text: "SOLD OUT",
      color: "oklch(0.60 0.25 25)",
      textColor: "#ffffff",
      borderRadius: "4px",
    },
  },
};

interface SlideRendererProps {
  slide: SignageSlide;
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

export function SlideRenderer({
  slide,
  items,
  menuItemStyles,
}: SlideRendererProps) {
  switch (slide.type) {
    case "COLUMN_LAYOUT":
      return (
        <ColumnLayoutRenderer
          columns={slide.columns}
          splitRatio={slide.splitRatio}
          items={items}
          menuItemStyles={menuItemStyles ?? FALLBACK_STYLES}
        />
      );
    case "IMAGE": {
      const fitClass =
        slide.fit === "contain" ? "object-contain" : "object-cover";
      return (
        <div className="w-full h-full min-h-screen bg-black flex items-center justify-center">
          <img
            src={slide.imageUrl}
            alt="Signage Promo"
            className={`w-full h-full min-h-screen ${fitClass}`}
          />
        </div>
      );
    }
    case "VIDEO":
      return (
        <div className="w-full h-full min-h-screen bg-black">
          <video
            src={slide.videoUrl}
            autoPlay
            loop={slide.loop !== false}
            muted={slide.mute !== false}
            playsInline
            className="w-full h-full min-h-screen object-cover"
          />
        </div>
      );
    case "IFRAME":
      return (
        <div className="w-full h-full min-h-screen bg-black">
          <iframe
            src={slide.url}
            title="Google Slides or Web Content"
            className="w-full h-full min-h-screen border-none"
            allow="autoplay; encrypted-media"
          />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white font-sans">
          <p>Unsupported Slide Type</p>
        </div>
      );
  }
}
