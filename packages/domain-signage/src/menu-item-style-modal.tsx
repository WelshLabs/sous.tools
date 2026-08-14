"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import {
  type MenuItemStyles,
  type MenuItemStateStyle,
} from "@soustools/api-types";
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
  open,
  onClose,
  styles,
  onChange,
  googleFont,
}) => {
  const [activeState, setActiveState] = useState<ItemState>("regular");
  const [selectedAtom, setSelectedAtom] = useState<AtomKey | null>(null);

  const handleEsc = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        if (selectedAtom) {
          setSelectedAtom(null);
        } else {
          onClose();
        }
      }
    },
    [onClose, selectedAtom],
  );

  useEffect(() => {
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, handleEsc]);

  if (!open) return null;

  const handleAtomChange = (updates: Partial<MenuItemStateStyle>): void => {
    onChange({
      ...styles,
      [activeState]: { ...styles[activeState], ...updates },
    });
  };

  const switchState = (state: ItemState): void => {
    setActiveState(state);
    setSelectedAtom(null);
  };

  return (
    <div
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border-border flex w-full max-w-4xl flex-col rounded-3xl border shadow-2xl"
        style={{ height: "min(90vh, 680px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-3.5">
          <div>
            <h2 className="text-foreground text-sm font-bold">
              Menu Item Styles
            </h2>
            <p className="text-muted-foreground mt-0.5 text-[10px]">
              Click any part of the preview to edit that element
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1.5 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* State tabs */}
        <StateTabBar
          activeState={activeState}
          onChange={switchState}
          styles={styles}
        />

        {/* Body — preview + editor side by side, fixed height, no overflow on the outer div */}
        <div className="flex min-h-0 flex-1">
          {/* Preview pane */}
          <div
            className="flex min-w-0 flex-1 items-start justify-center overflow-y-auto p-8"
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
          <div className="border-border flex w-72 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-l">
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
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                <div className="bg-secondary/60 border-border flex h-12 w-12 items-center justify-center rounded-2xl border">
                  <span className="text-2xl select-none">✦</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Click any highlighted element on the preview card to edit it
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex shrink-0 items-center justify-between border-t px-5 py-3">
          <p className="text-[10px] text-zinc-600">
            Changes apply live · ESC to close
          </p>
          <button
            onClick={onClose}
            className="bg-secondary border-border text-muted-foreground cursor-pointer rounded-xl border px-4 py-1.5 text-xs transition-all hover:border-white/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
