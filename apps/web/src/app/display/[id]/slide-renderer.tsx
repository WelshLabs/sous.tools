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
        <div className="flex h-full min-h-screen w-full items-center justify-center bg-white dark:bg-black">
          <img
            src={slide.imageUrl}
            alt="Signage Promo"
            className={`h-full min-h-screen w-full ${fitClass}`}
          />
        </div>
      );
    }
    case "VIDEO":
      return (
        <div className="h-full min-h-screen w-full bg-white dark:bg-black">
          <video
            src={slide.videoUrl}
            autoPlay
            loop={slide.loop !== false}
            muted={slide.mute !== false}
            playsInline
            className="h-full min-h-screen w-full object-cover"
          />
        </div>
      );
    case "IFRAME":
      return (
        <div className="h-full min-h-screen w-full bg-white dark:bg-black">
          <iframe
            src={slide.url}
            title="Google Slides or Web Content"
            className="h-full min-h-screen w-full border-none"
            allow="autoplay; encrypted-media"
          />
        </div>
      );
    default:
      return (
        <div className="dark:bg-card flex min-h-screen items-center justify-center bg-zinc-100 font-sans text-white">
          <p>Unsupported Slide Type</p>
        </div>
      );
  }
}
