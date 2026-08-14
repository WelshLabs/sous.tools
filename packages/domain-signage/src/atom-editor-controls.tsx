"use client";

import { useState } from "react";
import {
  type MenuItemStateStyle,
  type MenuItemBadge,
} from "@soustools/api-types";
import { FontPickerPopover } from "./font-picker-popover";

export const ColorRow: React.FC<{
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-muted-foreground text-xs">{label}</span>
    <input
      type="color"
      value={value ?? "#ffffff"}
      onChange={(e) => onChange(e.target.value)}
      className="border-border bg-secondary h-7 w-8 cursor-pointer rounded border p-0.5"
    />
  </div>
);

export const FontRow: React.FC<{
  font: string | undefined;
  onChange: (f: string) => void;
}> = ({ font, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">Font</span>
        <button
          onClick={() => setOpen(!open)}
          className="bg-secondary border-border text-foreground cursor-pointer rounded-lg border px-2 py-1 text-xs hover:border-white/25"
          style={{ fontFamily: font ?? "inherit" }}
        >
          {font ?? "Default"}
        </button>
      </div>
      {open && (
        <FontPickerPopover
          label="Pick Font"
          currentFont={font}
          onSelect={(f) => {
            onChange(f);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export const SliderRow: React.FC<{
  label: string;
  value: number | undefined;
  min: number;
  max: number;
  step: number;
  def: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, def, onChange }) => (
  <div>
    <div className="text-muted-foreground mb-0.5 flex justify-between text-xs">
      <span>{label}</span>
      <span>{(value ?? def).toFixed(2)}rem</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value ?? def}
      onChange={(e) => onChange(Number(e.target.value))}
      className="accent-primary w-full"
    />
  </div>
);

export const WeightSelect: React.FC<{
  value: string | undefined;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-muted-foreground text-xs">Weight</span>
    <select
      value={value ?? "700"}
      onChange={(e) => onChange(e.target.value)}
      className="bg-secondary border-border text-foreground cursor-pointer rounded-lg border px-2 py-1 text-xs focus:outline-none"
    >
      <option value="400">Regular</option>
      <option value="700">Bold</option>
      <option value="900">Black</option>
    </select>
  </div>
);

export const BadgeControls: React.FC<{
  badge: MenuItemBadge | undefined;
  onChange: (updates: { badge: MenuItemBadge | undefined }) => void;
}> = ({ badge, onChange }) =>
  badge ? (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">Badge text</span>
        <input
          type="text"
          value={badge.text}
          onChange={(e) =>
            onChange({ badge: { ...badge, text: e.target.value } })
          }
          className="bg-secondary border-border text-foreground w-32 rounded-lg border px-2 py-1 text-xs focus:outline-none"
        />
      </div>
      <ColorRow
        label="Background"
        value={badge.color}
        onChange={(v) => onChange({ badge: { ...badge, color: v } })}
      />
      <ColorRow
        label="Text color"
        value={badge.textColor}
        onChange={(v) => onChange({ badge: { ...badge, textColor: v } })}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs">Border radius</span>
        <input
          type="text"
          value={badge.borderRadius ?? "4px"}
          onChange={(e) =>
            onChange({ badge: { ...badge, borderRadius: e.target.value } })
          }
          className="bg-secondary border-border text-foreground w-20 rounded-lg border px-2 py-1 text-xs focus:outline-none"
        />
      </div>
      <button
        onClick={() => onChange({ badge: undefined })}
        className="w-full cursor-pointer rounded-lg border border-red-700/30 bg-red-900/30 py-1.5 text-xs text-red-400 hover:bg-red-900/50"
      >
        Remove badge
      </button>
    </div>
  ) : (
    <button
      onClick={() =>
        onChange({
          badge: {
            text: "BADGE",
            color: "#f55",
            textColor: "#fff",
            borderRadius: "4px",
          },
        })
      }
      className="bg-secondary border-border text-muted-foreground w-full cursor-pointer rounded-lg border py-2 text-xs hover:border-white/25"
    >
      + Add badge
    </button>
  );

export const IconControls: React.FC<{
  style: Pick<MenuItemStateStyle, "icon" | "iconPosition">;
  onChange: (updates: Partial<MenuItemStateStyle>) => void;
}> = ({ style, onChange }) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-xs">Emoji</span>
      <input
        type="text"
        value={style.icon ?? ""}
        maxLength={2}
        onChange={(e) => onChange({ icon: e.target.value || undefined })}
        className="bg-secondary border-border text-foreground w-16 rounded-lg border px-2 py-1 text-center text-sm focus:outline-none"
      />
    </div>
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground text-xs">Position</span>
      <select
        value={style.iconPosition ?? "top-right-corner"}
        onChange={(e) =>
          onChange({
            iconPosition: e.target.value as MenuItemStateStyle["iconPosition"],
          })
        }
        className="bg-secondary border-border text-foreground cursor-pointer rounded-lg border px-2 py-1 text-xs focus:outline-none"
      >
        <option value="before-title">Before title</option>
        <option value="after-title">After title</option>
        <option value="top-right-corner">Corner badge</option>
      </select>
    </div>
    <button
      onClick={() => onChange({ icon: undefined, iconPosition: undefined })}
      className="w-full cursor-pointer rounded-lg border border-red-700/30 bg-red-900/30 py-1.5 text-xs text-red-400 hover:bg-red-900/50"
    >
      Remove icon
    </button>
  </div>
);
