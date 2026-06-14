"use client";

import React from "react";
import { SignageSlide, PosItem } from "@soustools/api-types";
import { ColumnLayoutRenderer } from "./column-layout-renderer";

interface SlideRendererProps {
  slide: SignageSlide;
  items: PosItem[];
  soldOutBehavior: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
}

export function SlideRenderer({
  slide,
  items,
  soldOutBehavior,
}: SlideRendererProps) {
  switch (slide.type) {
    case "COLUMN_LAYOUT":
      return (
        <ColumnLayoutRenderer
          columns={slide.columns}
          splitRatio={slide.splitRatio}
          items={items}
          soldOutBehavior={soldOutBehavior}
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
