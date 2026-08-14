"use client";

import React from "react";
import {
  type SignageSlide,
  type PosItem,
  type MenuItemStyles,
} from "@soustools/api-types";
import { ColumnLayoutRenderer } from "./column-layout-renderer";

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
          menuItemStyles={menuItemStyles}
        />
      );
    case "IMAGE": {
      const fitClass =
        slide.fit === "contain" ? "object-contain" : "object-cover";
      return (
        <div className="w-full h-full min-h-screen bg-white dark:bg-black flex items-center justify-center">
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
        <div className="w-full h-full min-h-screen bg-white dark:bg-black">
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
        <div className="w-full h-full min-h-screen bg-white dark:bg-black">
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
        <div className="flex items-center justify-center min-h-screen bg-zinc-100 dark:bg-card text-white font-sans">
          <p>Unsupported Slide Type</p>
        </div>
      );
  }
}
