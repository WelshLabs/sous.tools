"use client";

import { type TypographyConfig } from "@soustools/api-types";
import { FontPickerPopover } from "./font-picker-popover";

export type TypographyKey = keyof TypographyConfig;

export const TYPOGRAPHY_SAMPLES: {
  key: TypographyKey;
  colorKey: keyof TypographyConfig;
  label: string;
  sample: string;
}[] = [
  { key: "menuItemTitle", colorKey: "menuItemTitleColor", label: "Title", sample: "Burger & Fries" },
  { key: "menuItemPrice", colorKey: "menuItemPriceColor", label: "Price", sample: "$12.99" },
  { key: "menuItemDescription", colorKey: "menuItemDescriptionColor", label: "Description", sample: "Hand-crafted with care" },
  { key: "marketingText", colorKey: "marketingTextColor", label: "Promo", sample: "Chef's Special" },
];

export const TypographySample: React.FC<{
  sample: { key: TypographyKey; colorKey: keyof TypographyConfig; label: string; sample: string };
  font: string | undefined;
  color: string | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (font: string) => void;
  onColorChange: (color: string) => void;
  onClose: () => void;
}> = ({ sample, font, color, isOpen, onToggle, onSelect, onColorChange, onClose }) => (
  <div className="relative flex flex-col gap-1">
    <div className="flex justify-between items-center">
      <p className="text-[10px] text-muted-foreground">{sample.label}</p>
      <input
        type="color"
        value={color || "#ffffff"}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-5 h-5 rounded cursor-pointer border border-border bg-secondary p-0"
      />
    </div>
    <button
      onClick={onToggle}
      className="w-full text-left px-2 py-1.5 bg-secondary border border-border rounded-lg hover:border-white/20 transition-all cursor-pointer"
      style={{ fontFamily: font ?? "inherit", color: color || "inherit" }}
    >
      <span className="text-[10px] font-bold truncate block">{sample.sample}</span>
      <span className="text-[8px] text-muted-foreground block">{font ?? "inherit"}</span>
    </button>
    {isOpen && (
      <FontPickerPopover label={sample.label} currentFont={font} onSelect={onSelect} onClose={onClose} />
    )}
  </div>
);
