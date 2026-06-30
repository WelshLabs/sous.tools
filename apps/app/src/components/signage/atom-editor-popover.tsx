"use client";

import React from "react";
import { X } from "lucide-react";
import { MenuItemStateStyle } from "@soustools/api-types";
import { ColorRow, FontRow, SliderRow, WeightSelect, BadgeControls, IconControls } from "./atom-editor-controls";
import type { AtomKey } from "./menu-item-preview-card";
import type { ItemState } from "./state-tab-bar";

export interface AtomEditorPopoverProps {
  atom: AtomKey;
  activeState: ItemState;
  style: MenuItemStateStyle;
  onChange: (updates: Partial<MenuItemStateStyle>) => void;
  onClose: () => void;
}

const ATOM_LABELS: Record<AtomKey, string> = {
  card: "Card", title: "Title", price: "Price",
  description: "Description", badge: "Badge", icon: "Icon",
};

const ANIMATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "pulse-glow", label: "Pulse Glow" },
  { value: "shimmer", label: "Shimmer" },
  { value: "bounce-scale", label: "Bounce Scale" },
  { value: "border-flash", label: "Border Flash" },
] as const;

export const AtomEditorPopover: React.FC<AtomEditorPopoverProps> = ({ atom, activeState, style, onChange, onClose }) => {
  const inner = (() => {
    switch (atom) {
      case "card": return (
        <div className="space-y-2.5">
          <ColorRow label="Background" value={style.backgroundColor} onChange={(v) => onChange({ backgroundColor: v })} />
          <ColorRow label="Border color" value={style.borderColor} onChange={(v) => onChange({ borderColor: v })} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Border width</span>
            <input type="number" min={0} max={8} value={style.borderWidth ?? 1}
              onChange={(e) => onChange({ borderWidth: Number(e.target.value) })}
              className="w-16 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Border radius</span>
            <input type="text" value={style.borderRadius ?? "12px"}
              onChange={(e) => onChange({ borderRadius: e.target.value })}
              className="w-24 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Box shadow</span>
            <input type="text" value={style.shadow ?? ""}
              onChange={(e) => onChange({ shadow: e.target.value || undefined })}
              className="w-36 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Card padding</span>
            <input type="text" value={style.cardPadding ?? "16px"}
              onChange={(e) => onChange({ cardPadding: e.target.value })}
              placeholder="16px"
              className="w-24 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Animation</span>
            <select value={style.animation ?? "none"}
              onChange={(e) => onChange({ animation: e.target.value as typeof style.animation })}
              className="bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 cursor-pointer focus:outline-none">
              {ANIMATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Dim opacity</span>
            <input type="number" min={0} max={1} step={0.05} value={style.dimOpacity ?? 1}
              onChange={(e) => onChange({ dimOpacity: Number(e.target.value) })}
              className="w-16 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={style.grayscale ?? false}
                onChange={(e) => onChange({ grayscale: e.target.checked })} className="accent-primary" />Grayscale
            </label>
            <label className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={style.strikethrough ?? false}
                onChange={(e) => onChange({ strikethrough: e.target.checked })} className="accent-primary" />Strikethrough
            </label>
            {activeState === "soldOut" && (
              <label className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={style.hidden ?? false}
                  onChange={(e) => onChange({ hidden: e.target.checked })} className="accent-primary" />Hidden
              </label>
            )}
          </div>
        </div>
      );
      case "title": return (
        <div className="space-y-2.5">
          <FontRow font={style.titleFont} onChange={(f) => onChange({ titleFont: f })} />
          <ColorRow label="Color" value={style.titleColor} onChange={(v) => onChange({ titleColor: v })} />
          <SliderRow label="Size" value={style.titleSize} min={0.8} max={2.0} step={0.05} def={1.25} onChange={(v) => onChange({ titleSize: v })} />
          <WeightSelect value={style.titleWeight} onChange={(v) => onChange({ titleWeight: v })} />
        </div>
      );
      case "price": return (
        <div className="space-y-2.5">
          <FontRow font={style.priceFont} onChange={(f) => onChange({ priceFont: f })} />
          <ColorRow label="Color" value={style.priceColor} onChange={(v) => onChange({ priceColor: v })} />
          <SliderRow label="Size" value={style.priceSize} min={0.8} max={1.8} step={0.05} def={1.0} onChange={(v) => onChange({ priceSize: v })} />
          <WeightSelect value={style.priceWeight} onChange={(v) => onChange({ priceWeight: v })} />
        </div>
      );
      case "description": return (
        <div className="space-y-2.5">
          <FontRow font={style.descriptionFont} onChange={(f) => onChange({ descriptionFont: f })} />
          <ColorRow label="Color" value={style.descriptionColor} onChange={(v) => onChange({ descriptionColor: v })} />
          <SliderRow label="Size" value={style.descriptionSize} min={0.7} max={1.2} step={0.05} def={0.875} onChange={(v) => onChange({ descriptionSize: v })} />
        </div>
      );
      case "badge": return (
        <BadgeControls badge={style.badge} onChange={(u) => onChange(u)} />
      );
      case "icon": return (
        <IconControls style={style} onChange={onChange} />
      );
    }
  })();

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{ATOM_LABELS[atom]}</span>
        <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:text-zinc-200 transition-colors p-0.5 cursor-pointer" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
      {inner}
    </div>
  );
};
