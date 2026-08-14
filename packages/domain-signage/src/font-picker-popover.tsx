"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export interface FontPickerPopoverProps {
  currentFont: string | undefined;
  onSelect: (font: string) => void;
  onClose: () => void;
  label: string;
}

const FONTS = [
  "Inter",
  "Outfit",
  "Roboto",
  "Montserrat",
  "Playfair Display",
  "Caveat",
  "Pacifico",
  "Bebas Neue",
  "Fredoka One",
  "Cinzel",
  "Oswald",
  "Lato",
];

/**
 * FontPickerPopover renders an absolute-positioned card with a font grid
 * and a custom-entry input. Closes on outside click.
 */
export const FontPickerPopover: React.FC<FontPickerPopoverProps> = ({
  currentFont,
  onSelect,
  onClose,
  label,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [customFont, setCustomFont] = useState("");

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const commitCustomFont = (): void => {
    const trimmed = customFont.trim();
    if (trimmed) {
      onSelect(trimmed);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") commitCustomFont();
  };

  return (
    <div
      ref={ref}
      className="bg-card border-border absolute z-50 w-72 rounded-2xl border p-4 shadow-2xl"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 transition-colors"
          aria-label="Close font picker"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Font grid — 3 per row */}
      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {FONTS.map((font) => {
          const isActive = currentFont === font;
          return (
            <button
              key={font}
              onClick={() => {
                onSelect(font);
                onClose();
              }}
              style={{ fontFamily: font }}
              className={`cursor-pointer truncate rounded-lg border px-2 py-2 text-center text-[11px] transition-all ${
                isActive
                  ? "ring-primary border-primary bg-primary/10 text-foreground ring-2"
                  : "border-border bg-secondary text-muted-foreground hover:border-white/25 hover:bg-zinc-700"
              }`}
            >
              {font}
            </button>
          );
        })}
      </div>

      {/* Custom font input */}
      <input
        type="text"
        value={customFont}
        onChange={(e) => setCustomFont(e.target.value)}
        onBlur={commitCustomFont}
        onKeyDown={handleKeyDown}
        placeholder="Or type any Google Font name..."
        className="bg-secondary border-border text-foreground focus:border-primary/60 w-full rounded-lg border px-3 py-2 text-xs placeholder-zinc-500 transition-colors focus:outline-none"
      />
    </div>
  );
};
