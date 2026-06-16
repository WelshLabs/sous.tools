"use client";

import React from "react";
import { MenuItemStyles } from "@soustools/api-types";

export type ItemState = "regular" | "highlighted" | "soldOut";

export interface StateTabBarProps {
  activeState: ItemState;
  onChange: (state: ItemState) => void;
  styles: MenuItemStyles;
}

interface TabDef {
  key: ItemState;
  label: string;
  sub: string;
}

const TABS: TabDef[] = [
  { key: "regular", label: "Regular", sub: "Default display" },
  { key: "highlighted", label: "Highlighted", sub: "Featured items" },
  { key: "soldOut", label: "Sold Out", sub: "Unavailable items" },
];

export const StateTabBar: React.FC<StateTabBarProps> = ({ activeState, onChange, styles }) => (
  <div className="flex gap-1.5 px-4 py-2 border-b border-white/5 shrink-0">
    {TABS.map(({ key, label, sub }) => {
      const isActive = activeState === key;
      const bg = styles[key].backgroundColor ?? (key === "highlighted" ? "#3b5" : key === "soldOut" ? "#f55" : "#888");
      return (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl border text-center transition-all cursor-pointer ${
            isActive
              ? "bg-primary/20 border-primary text-white"
              : "bg-zinc-800 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="rounded-sm shrink-0"
              style={{ width: 12, height: 12, backgroundColor: bg, display: "inline-block" }}
            />
            <span className="text-xs font-semibold">{label}</span>
          </div>
          <span className="text-[9px] text-zinc-500 leading-none">{sub}</span>
        </button>
      );
    })}
  </div>
);
