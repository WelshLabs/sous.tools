"use client";

import { useState } from "react";
import {
  type MenuItemStyles,
  type MenuItemStateStyle,
} from "@soustools/api-types";
import { StateTabBar, type ItemState } from "./state-tab-bar";
import { MenuItemPreviewCard, type AtomKey } from "./menu-item-preview-card";
import { AtomEditorPopover } from "./atom-editor-popover";

interface MenuItemStylesInspectorProps {
  styles: MenuItemStyles;
  onChange: (styles: MenuItemStyles) => void;
  googleFont?: string;
}

export const MenuItemStylesInspector: React.FC<
  MenuItemStylesInspectorProps
> = ({ styles, onChange, googleFont }) => {
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
      <div className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
        Menu Item Styles
      </div>

      <StateTabBar
        activeState={activeState}
        onChange={(s) => {
          setActiveState(s);
          setSelectedAtom(null);
        }}
        styles={styles}
      />

      <div className="bg-card/50 border-border flex justify-center rounded-xl border p-4">
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
        <div className="border-border bg-card/30 overflow-hidden rounded-xl border">
          <AtomEditorPopover
            atom={selectedAtom}
            activeState={activeState}
            style={styles[activeState]}
            onChange={handleAtomChange}
            onClose={() => setSelectedAtom(null)}
          />
        </div>
      ) : (
        <div className="border-border text-muted-foreground rounded-xl border border-dashed p-4 text-center text-[11px]">
          Click elements on the preview card above to edit colors, sizes,
          borders, and animations.
        </div>
      )}
    </div>
  );
};
