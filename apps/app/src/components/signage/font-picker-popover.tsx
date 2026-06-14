"use client";

import React, { useEffect, useRef, useState } from "react";
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
      className="absolute z-50 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-4 w-72"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          {label}
        </span>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5 cursor-pointer"
          aria-label="Close font picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Font grid — 3 per row */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {FONTS.map((font) => {
          const isActive = currentFont === font;
          return (
            <button
              key={font}
              onClick={() => { onSelect(font); onClose(); }}
              style={{ fontFamily: font }}
              className={`px-2 py-2 text-[11px] rounded-lg border text-center truncate transition-all cursor-pointer ${
                isActive
                  ? "ring-2 ring-primary border-primary bg-primary/10 text-white"
                  : "border-white/10 bg-zinc-800 text-zinc-300 hover:border-white/25 hover:bg-zinc-700"
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
        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-primary/60 transition-colors"
      />
    </div>
  );
};
