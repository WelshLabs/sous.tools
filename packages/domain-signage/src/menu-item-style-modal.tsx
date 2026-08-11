"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { type MenuItemStyles, type MenuItemStateStyle } from "@soustools/api-types";
import { StateTabBar, type ItemState } from "./state-tab-bar";
import { MenuItemPreviewCard, type AtomKey } from "./menu-item-preview-card";
import { AtomEditorPopover } from "./atom-editor-popover";

export interface MenuItemStyleModalProps {
  open: boolean;
  onClose: () => void;
  styles: MenuItemStyles;
  onChange: (styles: MenuItemStyles) => void;
  googleFont?: string;
}

export const MenuItemStyleModal: React.FC<MenuItemStyleModalProps> = ({
  open, onClose, styles, onChange, googleFont,
}) => {
  const [activeState, setActiveState] = useState<ItemState>("regular");
  const [selectedAtom, setSelectedAtom] = useState<AtomKey | null>(null);

  const handleEsc = useCallback((e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      if (selectedAtom) { setSelectedAtom(null); } else { onClose(); }
    }
  }, [onClose, selectedAtom]);

  useEffect(() => {
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, handleEsc]);

  if (!open) return null;

  const handleAtomChange = (updates: Partial<MenuItemStateStyle>): void => {
    onChange({ ...styles, [activeState]: { ...styles[activeState], ...updates } });
  };

  const switchState = (state: ItemState): void => {
    setActiveState(state);
    setSelectedAtom(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col"
        style={{ height: "min(90vh, 680px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
          <div>
            <h2 className="text-sm font-bold text-foreground">Menu Item Styles</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Click any part of the preview to edit that element</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State tabs */}
        <StateTabBar activeState={activeState} onChange={switchState} styles={styles} />

        {/* Body — preview + editor side by side, fixed height, no overflow on the outer div */}
        <div className="flex flex-1 min-h-0">
          {/* Preview pane */}
          <div
            className="flex-1 min-w-0 overflow-y-auto p-8 flex items-start justify-center"
            onClick={() => setSelectedAtom(null)}
          >
            <div
              className="w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItemPreviewCard
                stateStyle={styles[activeState]}
                selectedAtom={selectedAtom}
                onSelectAtom={setSelectedAtom}
                googleFont={googleFont}
                scale={1}
              />
            </div>
          </div>

          {/* Atom editor pane — fixed width, scrolls independently, no horizontal overflow */}
          <div className="w-72 shrink-0 border-l border-border overflow-y-auto overflow-x-hidden flex flex-col">
            {selectedAtom ? (
              <div className="p-4">
                <AtomEditorPopover
                  atom={selectedAtom}
                  activeState={activeState}
                  style={styles[activeState]}
                  onChange={handleAtomChange}
                  onClose={() => setSelectedAtom(null)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-6 py-8">
                <div className="w-12 h-12 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center">
                  <span className="text-2xl select-none">✦</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click any highlighted element on the preview card to edit it
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border shrink-0">
          <p className="text-[10px] text-zinc-600">Changes apply live · ESC to close</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-secondary border border-border rounded-xl text-xs text-muted-foreground hover:border-white/20 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
