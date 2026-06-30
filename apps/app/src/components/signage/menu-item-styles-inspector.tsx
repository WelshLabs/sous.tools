"use client";

import React, { useState } from "react";
import { MenuItemStyles, MenuItemStateStyle } from "@soustools/api-types";
import { StateTabBar, ItemState } from "./state-tab-bar";
import { MenuItemPreviewCard, AtomKey } from "./menu-item-preview-card";
import { AtomEditorPopover } from "./atom-editor-popover";

interface MenuItemStylesInspectorProps {
  styles: MenuItemStyles;
  onChange: (styles: MenuItemStyles) => void;
  googleFont?: string;
}

export const MenuItemStylesInspector: React.FC<MenuItemStylesInspectorProps> = ({
  styles,
  onChange,
  googleFont,
}) => {
  const [activeState, setActiveState] = useState<ItemState>("regular");
  const [selectedAtom, setSelectedAtom] = useState<AtomKey | null>(null);

  const handleAtomChange = (updates: Partial<MenuItemStateStyle>): void => {
    onChange({
      ...styles,
      [activeState]: {
        ...styles[activeState],
        ...updates,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
        Menu Item Styles
      </div>
      
      <StateTabBar activeState={activeState} onChange={(s) => { setActiveState(s); setSelectedAtom(null); }} styles={styles} />

      <div className="flex justify-center p-4 bg-zinc-900/50 rounded-xl border border-black/5 dark:border-white/5">
        <div className="w-full max-w-[260px]">
          <MenuItemPreviewCard
            stateStyle={styles[activeState]}
            selectedAtom={selectedAtom}
            onSelectAtom={setSelectedAtom}
            googleFont={googleFont}
            scale={0.75}
          />
        </div>
      </div>

      {selectedAtom ? (
        <div className="border border-black/5 dark:border-white/5 rounded-xl bg-zinc-900/30 overflow-hidden">
          <AtomEditorPopover
            atom={selectedAtom}
            activeState={activeState}
            style={styles[activeState]}
            onChange={handleAtomChange}
            onClose={() => setSelectedAtom(null)}
          />
        </div>
      ) : (
        <div className="text-center p-4 rounded-xl border border-dashed border-black/10 dark:border-white/10 text-[11px] text-zinc-400 dark:text-zinc-500">
          Click elements on the preview card above to edit colors, sizes, borders, and animations.
        </div>
      )}
    </div>
  );
};
