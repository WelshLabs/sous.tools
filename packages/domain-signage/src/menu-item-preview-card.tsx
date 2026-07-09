"use client";

import React from "react";
import { type MenuItemStateStyle } from "@soustools/api-types";
import {
  buildCardStyle,
  buildTitleStyle,
  buildPriceStyle,
  buildDescriptionStyle,
} from "./menu-item-style-utils";

export type AtomKey = "card" | "title" | "price" | "description" | "badge" | "icon";

export interface MenuItemPreviewCardProps {
  stateStyle: MenuItemStateStyle;
  selectedAtom: AtomKey | null;
  onSelectAtom: (atom: AtomKey) => void;
  googleFont?: string;
  scale?: number;
  stateLabel?: string;
}

const MOCK = {
  name: "Truffle Wagyu Burger",
  price: 28.0,
  description: "8oz wagyu patty, black truffle aioli, aged gruyère, brioche bun",
};

const Tooltip: React.FC<{ label: string }> = ({ label }) => (
  <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-2 py-0.5 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-full text-[9px] text-zinc-700 dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
    {label}
  </span>
);

interface AtomWrapProps {
  atomKey: AtomKey;
  selected: boolean;
  onSelect: (a: AtomKey) => void;
  className?: string;
  children: React.ReactNode;
  tooltip: string;
}

const AtomWrap: React.FC<AtomWrapProps> = ({ atomKey, selected, onSelect, className = "", children, tooltip }) => (
  <div
    className={`cursor-pointer relative group ring-2 rounded transition-all ${
      selected
        ? "ring-primary ring-offset-1 ring-offset-zinc-900"
        : "ring-transparent hover:ring-primary/40"
    } ${className}`}
    onClick={(e) => { e.stopPropagation(); onSelect(atomKey); }}
  >
    <Tooltip label={tooltip} />
    {children}
  </div>
);

export const MenuItemPreviewCard: React.FC<MenuItemPreviewCardProps> = ({
  stateStyle, selectedAtom, onSelectAtom, googleFont, scale = 1, stateLabel,
}) => {
  const s = stateStyle;
  const cardStyle: React.CSSProperties = {
    ...buildCardStyle(s),
    borderStyle: "solid",
    borderWidth: s.borderWidth ? `${s.borderWidth}px` : "1px",
    padding: s.cardPadding ?? "16px",
  };
  if (googleFont) cardStyle.fontFamily = googleFont;

  const iconBefore = s.icon && s.iconPosition === "before-title";
  const iconAfter = s.icon && s.iconPosition === "after-title";
  const iconCorner = s.icon && s.iconPosition === "top-right-corner";

  return (
    // Extra padding around the card so box-shadows are never clipped
    <div style={{ transform: `scale(${scale})`, transformOrigin: "top center", padding: "16px", margin: "-16px" }}>
      {stateLabel && (
        <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-500 mb-2 font-medium uppercase tracking-widest">{stateLabel}</p>
      )}
      {/* overflow:visible so box-shadow is never clipped by parent */}
      <AtomWrap atomKey="card" selected={selectedAtom === "card"} onSelect={onSelectAtom} tooltip="Card">
        <div className="relative rounded-2xl" style={{ ...cardStyle, overflow: "visible" }}>
          {iconCorner && s.icon && (
            <AtomWrap atomKey="icon" selected={selectedAtom === "icon"} onSelect={onSelectAtom} className="absolute top-2 right-2" tooltip="Icon">
              <span className="text-xl">{s.icon}</span>
            </AtomWrap>
          )}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {iconBefore && s.icon && (
                <AtomWrap atomKey="icon" selected={selectedAtom === "icon"} onSelect={onSelectAtom} tooltip="Icon">
                  <span className="text-lg">{s.icon}</span>
                </AtomWrap>
              )}
              <AtomWrap atomKey="title" selected={selectedAtom === "title"} onSelect={onSelectAtom} className="min-w-0 flex-1" tooltip="Title">
                <span className="text-base font-bold truncate block" style={buildTitleStyle(s)}>
                  {MOCK.name}
                </span>
              </AtomWrap>
              {iconAfter && s.icon && (
                <AtomWrap atomKey="icon" selected={selectedAtom === "icon"} onSelect={onSelectAtom} tooltip="Icon">
                  <span className="text-lg">{s.icon}</span>
                </AtomWrap>
              )}
            </div>
            <AtomWrap atomKey="price" selected={selectedAtom === "price"} onSelect={onSelectAtom} tooltip="Price">
              <span className="font-bold text-sm shrink-0" style={buildPriceStyle(s)}>
                ${MOCK.price.toFixed(2)}
              </span>
            </AtomWrap>
          </div>
          <AtomWrap atomKey="description" selected={selectedAtom === "description"} onSelect={onSelectAtom} tooltip="Description">
            <p className="text-xs leading-relaxed" style={buildDescriptionStyle(s)}>{MOCK.description}</p>
          </AtomWrap>
          {s.badge && (
            <div className="mt-2">
              <AtomWrap atomKey="badge" selected={selectedAtom === "badge"} onSelect={onSelectAtom} tooltip="Badge">
                <span
                  className="inline-block px-2 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: s.badge.color, color: s.badge.textColor, borderRadius: s.badge.borderRadius ?? "4px" }}
                >
                  {s.badge.text}
                </span>
              </AtomWrap>
            </div>
          )}
        </div>
      </AtomWrap>
    </div>
  );
};
