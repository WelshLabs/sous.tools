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
    <span className="text-xs text-muted-foreground">{label}</span>
    <input
      type="color"
      value={value ?? "#ffffff"}
      onChange={(e) => onChange(e.target.value)}
      className="w-8 h-7 rounded cursor-pointer border border-border bg-secondary p-0.5"
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
        <span className="text-xs text-muted-foreground">Font</span>
        <button
          onClick={() => setOpen(!open)}
          className="px-2 py-1 bg-secondary border border-border rounded-lg text-xs text-foreground hover:border-white/25 cursor-pointer"
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
    <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
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
      className="w-full accent-primary"
    />
  </div>
);

export const WeightSelect: React.FC<{
  value: string | undefined;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs text-muted-foreground">Weight</span>
    <select
      value={value ?? "700"}
      onChange={(e) => onChange(e.target.value)}
      className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground cursor-pointer focus:outline-none"
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
        <span className="text-xs text-muted-foreground">Badge text</span>
        <input
          type="text"
          value={badge.text}
          onChange={(e) =>
            onChange({ badge: { ...badge, text: e.target.value } })
          }
          className="w-32 bg-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
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
        <span className="text-xs text-muted-foreground">Border radius</span>
        <input
          type="text"
          value={badge.borderRadius ?? "4px"}
          onChange={(e) =>
            onChange({ badge: { ...badge, borderRadius: e.target.value } })
          }
          className="w-20 bg-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
        />
      </div>
      <button
        onClick={() => onChange({ badge: undefined })}
        className="w-full py-1.5 bg-red-900/30 border border-red-700/30 rounded-lg text-xs text-red-400 hover:bg-red-900/50 cursor-pointer"
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
      className="w-full py-2 bg-secondary border border-border rounded-lg text-xs text-muted-foreground hover:border-white/25 cursor-pointer"
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
      <span className="text-xs text-muted-foreground">Emoji</span>
      <input
        type="text"
        value={style.icon ?? ""}
        maxLength={2}
        onChange={(e) => onChange({ icon: e.target.value || undefined })}
        className="w-16 bg-secondary border border-border rounded-lg px-2 py-1 text-sm text-center text-foreground focus:outline-none"
      />
    </div>
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">Position</span>
      <select
        value={style.iconPosition ?? "top-right-corner"}
        onChange={(e) =>
          onChange({
            iconPosition: e.target.value as MenuItemStateStyle["iconPosition"],
          })
        }
        className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground cursor-pointer focus:outline-none"
      >
        <option value="before-title">Before title</option>
        <option value="after-title">After title</option>
        <option value="top-right-corner">Corner badge</option>
      </select>
    </div>
    <button
      onClick={() => onChange({ icon: undefined, iconPosition: undefined })}
      className="w-full py-1.5 bg-red-900/30 border border-red-700/30 rounded-lg text-xs text-red-400 hover:bg-red-900/50 cursor-pointer"
    >
      Remove icon
    </button>
  </div>
);
