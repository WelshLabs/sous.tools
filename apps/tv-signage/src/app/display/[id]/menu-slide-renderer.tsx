"use client";

import React from "react";
import { MenuSlide, PosItem } from "@soustools/api-types";

interface MenuSlideRendererProps {
  slide: MenuSlide;
  items: PosItem[];
  soldOutBehavior: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
}

export function MenuSlideRenderer({
  slide,
  items,
  soldOutBehavior,
}: MenuSlideRendererProps) {
  const activeItems = items.filter(
    (item) => !(item.isSoldOut && soldOutBehavior === "HIDE"),
  );

  const renderMenuItem = (item: PosItem) => {
    const isHighlighted = slide.highlightItems?.some(
      (h) =>
        h === item.id ||
        h === item.squareId ||
        h.toLowerCase() === item.name.toLowerCase(),
    );

    let itemClasses =
      "p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between ";
    if (isHighlighted) {
      itemClasses +=
        "glass-card border-[oklch(0.60_0.25_250)]/40 shadow-[0_0_20px_-3px_oklch(0.60_0.25_250)] scale-[1.02] ";
    } else {
      itemClasses += "bg-white/5 border border-white/5 ";
    }

    if (item.isSoldOut) {
      if (soldOutBehavior === "STRIKE") {
        itemClasses += "line-through opacity-40 ";
      } else if (soldOutBehavior === "GRAY_OUT") {
        itemClasses += "grayscale opacity-50 ";
      }
    }

    if (slide.customClassOverrides) {
      const override =
        slide.customClassOverrides[item.id] ||
        slide.customClassOverrides[item.squareId];
      if (override) {
        itemClasses += ` ${override}`;
      }
    }

    return (
      <div key={item.id} className={itemClasses}>
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-xl font-bold tracking-tight text-white">
              {item.name}
            </h3>
            <span className="text-lg font-extrabold text-[oklch(0.70_0.25_150)] whitespace-nowrap">
              ${Number(item.price).toFixed(2)}
            </span>
          </div>
          {item.description && (
            <p className="text-sm text-zinc-400 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
        {item.isSoldOut && soldOutBehavior === "LABEL" && (
          <div className="mt-4 flex">
            <span className="bg-[oklch(0.60_0.25_25)] text-white text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>
    );
  };

  if (slide.layoutTemplate === "SPLIT") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 w-full h-full min-h-screen p-8 gap-8 bg-[oklch(0.08_0.01_260)]">
        <div className="md:col-span-1 flex flex-col justify-center items-center text-center p-8 rounded-3xl glass-panel relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-[oklch(0.60_0.25_250)] rounded-full blur-[100px] opacity-20" />
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4 font-brand">
            Today's Selection
          </h2>
          <div className="w-12 h-1 bg-[oklch(0.60_0.25_250)] rounded-full" />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max overflow-y-auto max-h-[90vh] pr-2">
          {activeItems.map(renderMenuItem)}
        </div>
      </div>
    );
  }

  if (slide.layoutTemplate === "COLUMNS") {
    return (
      <div className="w-full h-full min-h-screen p-12 bg-[oklch(0.08_0.01_260)] flex flex-col justify-start">
        <h2 className="text-3xl font-extrabold tracking-tight text-center mb-8 font-brand text-zinc-200">
          Our Menu
        </h2>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {activeItems.map((item) => (
            <div key={item.id} className="break-inside-avoid">
              {renderMenuItem(item)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen p-12 bg-[oklch(0.08_0.01_260)] flex flex-col justify-start">
      <h2 className="text-3xl font-extrabold tracking-tight text-center mb-10 font-brand text-zinc-200">
        Menu Highlights
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[80vh] overflow-y-auto pr-2">
        {activeItems.map(renderMenuItem)}
      </div>
    </div>
  );
}
