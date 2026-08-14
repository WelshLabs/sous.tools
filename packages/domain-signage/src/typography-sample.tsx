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
  {
    key: "menuItemTitle",
    colorKey: "menuItemTitleColor",
    label: "Title",
    sample: "Burger & Fries",
  },
  {
    key: "menuItemPrice",
    colorKey: "menuItemPriceColor",
    label: "Price",
    sample: "$12.99",
  },
  {
    key: "menuItemDescription",
    colorKey: "menuItemDescriptionColor",
    label: "Description",
    sample: "Hand-crafted with care",
  },
  {
    key: "marketingText",
    colorKey: "marketingTextColor",
    label: "Promo",
    sample: "Chef's Special",
  },
];

export const TypographySample: React.FC<{
  sample: {
    key: TypographyKey;
    colorKey: keyof TypographyConfig;
    label: string;
    sample: string;
  };
  font: string | undefined;
  color: string | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (font: string) => void;
  onColorChange: (color: string) => void;
  onClose: () => void;
}> = ({
  sample,
  font,
  color,
  isOpen,
  onToggle,
  onSelect,
  onColorChange,
  onClose,
}) => (
  <div className="relative flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <p className="text-muted-foreground text-[10px]">{sample.label}</p>
      <input
        type="color"
        value={color || "#ffffff"}
        onChange={(e) => onColorChange(e.target.value)}
        className="border-border bg-secondary h-5 w-5 cursor-pointer rounded border p-0"
      />
    </div>
    <button
      onClick={onToggle}
      className="bg-secondary border-border w-full cursor-pointer rounded-lg border px-2 py-1.5 text-left transition-all hover:border-white/20"
      style={{ fontFamily: font ?? "inherit", color: color || "inherit" }}
    >
      <span className="block truncate text-[10px] font-bold">
        {sample.sample}
      </span>
      <span className="text-muted-foreground block text-[8px]">
        {font ?? "inherit"}
      </span>
    </button>
    {isOpen && (
      <FontPickerPopover
        label={sample.label}
        currentFont={font}
        onSelect={onSelect}
        onClose={onClose}
      />
    )}
  </div>
);
