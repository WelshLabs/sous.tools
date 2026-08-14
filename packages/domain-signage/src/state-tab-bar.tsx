"use client";

import { type MenuItemStyles } from "@soustools/api-types";

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

export const StateTabBar: React.FC<StateTabBarProps> = ({
  activeState,
  onChange,
  styles,
}) => (
  <div className="border-border flex shrink-0 gap-1.5 border-b px-4 py-2">
    {TABS.map(({ key, label, sub }) => {
      const isActive = activeState === key;
      const bg =
        styles[key].backgroundColor ??
        (key === "highlighted" ? "#3b5" : key === "soldOut" ? "#f55" : "#888");
      return (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-center transition-all ${
            isActive
              ? "bg-primary/20 border-primary text-foreground"
              : "bg-secondary border-border text-muted-foreground hover:text-muted-foreground hover:border-white/20"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="shrink-0 rounded-sm"
              style={{
                width: 12,
                height: 12,
                backgroundColor: bg,
                display: "inline-block",
              }}
            />
            <span className="text-xs font-semibold">{label}</span>
          </div>
          <span className="text-muted-foreground text-[9px] leading-none">
            {sub}
          </span>
        </button>
      );
    })}
  </div>
);
