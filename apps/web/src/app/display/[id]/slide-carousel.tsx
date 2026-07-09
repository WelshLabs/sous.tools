"use client";

import React, { useEffect, useState } from "react";
import { type SignageSlide, type PosItem, type ColumnLayoutSlide, type MenuItemStyles } from "@soustools/api-types";
import { SlideRenderer } from "./slide-renderer";

interface SlideCarouselProps {
  slides: SignageSlide[];
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

export function SlideCarousel({
  slides,
  items,
  menuItemStyles,
}: SlideCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!slides || slides.length <= 1) {
      setVisibleIndex(0);
      setOpacity(1);
      return;
    }

    const currentSlide = slides[currentIndex];
    const durationMs = (currentSlide.durationSeconds || 5) * 1000;

    const transitionStartMs = Math.max(durationMs - 500, 100);
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, transitionStartMs);

    const slideChangeTimer = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setCurrentIndex(nextIndex);
      setVisibleIndex(nextIndex);
      setOpacity(1);
    }, durationMs);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(slideChangeTimer);
    };
  }, [currentIndex, slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white font-sans">
        <p className="text-xl text-zinc-500 dark:text-muted-foreground">
          No slides configured for this display.
        </p>
      </div>
    );
  }

  const activeSlide = slides[visibleIndex];
  const columnSlide = activeSlide?.type === "COLUMN_LAYOUT" ? (activeSlide as ColumnLayoutSlide) : null;

  const bgStyle: React.CSSProperties = {
    opacity,
    backgroundColor: columnSlide?.backgroundColor || "oklch(0.08 0.01 260)",
  };
  if (columnSlide?.backgroundImageUrl) {
    bgStyle.backgroundImage = `url(${columnSlide.backgroundImageUrl})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

  return (
    <div
      className="w-full h-full min-h-screen transition-opacity duration-500 ease-in-out"
      style={bgStyle}
    >
      <SlideRenderer
        slide={activeSlide}
        items={items}
        menuItemStyles={menuItemStyles}
      />
    </div>
  );
}
