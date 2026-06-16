"use client";

import React from "react";
import { X } from "lucide-react";
import {
  SignageLayoutConfig,
  ColumnLayoutSlide,
  PosItem,
  MenuItemStyles,
} from "@soustools/api-types";
import { StylesPanel } from "./styles-panel";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";

export interface RightSidePanelProps {
  mode: "styles" | "content" | null;
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onUpdateConfig: (updates: Partial<SignageLayoutConfig>) => void;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
  onClose: () => void;
  items: PosItem[];
  deckId?: string;
}

/** Stub shown when mode='content'; real zone editors are handled via column popovers. */
const ContentZoneEditorStub: React.FC = () => (
  <div className="flex flex-1 items-center justify-center p-6 text-center">
    <p className="text-xs text-zinc-500 leading-relaxed">
      Content editor — select a zone on the canvas
    </p>
  </div>
);

/**
 * RightSidePanel is a fixed-width slide-in panel that hosts either the
 * StylesPanel (styles mode) or the ContentZoneEditor stub (content mode).
 * Animates in/out via CSS translate. Returns null when mode is null.
 */
export const RightSidePanel: React.FC<RightSidePanelProps> = ({
  mode, config, activeSlideIndex, onUpdateConfig, onUpdateSlide, onClose, deckId,
}) => {
  if (mode === null) return null;

  const isOpen = mode !== null;
  const title = mode === "styles" ? "Styles" : "Content";

  const handleUpdateMenuItemStyles = (s: MenuItemStyles): void => {
    onUpdateConfig({ menuItemStyles: s });
  };

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 z-30 w-80 flex flex-col
        bg-zinc-950 border-l border-white/5
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <span className="text-sm font-semibold text-zinc-200 tracking-wide">{title}</span>
        <button onClick={onClose} aria-label="Close panel"
          className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      {mode === "styles" ? (
        <StylesPanel
          config={config}
          activeSlideIndex={activeSlideIndex}
          onUpdateConfig={onUpdateConfig}
          onUpdateSlide={onUpdateSlide}
          menuItemStyles={config.menuItemStyles ?? DEFAULT_MENU_ITEM_STYLES}
          onUpdateMenuItemStyles={handleUpdateMenuItemStyles}
          deckId={deckId}
        />
      ) : (
        <ContentZoneEditorStub />
      )}
    </div>
  );
};
