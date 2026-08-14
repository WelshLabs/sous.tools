"use client";

import { X } from "lucide-react";
import { type MenuItemStateStyle } from "@soustools/api-types";
import { BadgeControls, IconControls } from "./atom-editor-controls";
import {
  AtomEditorCardSettings,
  AtomEditorTitleSettings,
  AtomEditorPriceSettings,
  AtomEditorDescriptionSettings,
} from "./atom-editor-settings";
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
  card: "Card",
  title: "Title",
  price: "Price",
  description: "Description",
  badge: "Badge",
  icon: "Icon",
};

export const AtomEditorPopover: React.FC<AtomEditorPopoverProps> = ({
  atom,
  activeState,
  style,
  onChange,
  onClose,
}) => {
  const inner = (() => {
    switch (atom) {
      case "card":
        return (
          <AtomEditorCardSettings
            style={style}
            activeState={activeState}
            onChange={onChange}
          />
        );
      case "title":
        return <AtomEditorTitleSettings style={style} onChange={onChange} />;
      case "price":
        return <AtomEditorPriceSettings style={style} onChange={onChange} />;
      case "description":
        return (
          <AtomEditorDescriptionSettings style={style} onChange={onChange} />
        );
      case "badge":
        return (
          <BadgeControls badge={style.badge} onChange={(u) => onChange(u)} />
        );
      case "icon":
        return <IconControls style={style} onChange={onChange} />;
    }
  })();

  return (
    <div className="bg-card border-border w-72 rounded-2xl border p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-foreground text-xs font-semibold tracking-wider uppercase">
          {ATOM_LABELS[atom]}
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {inner}
    </div>
  );
};
