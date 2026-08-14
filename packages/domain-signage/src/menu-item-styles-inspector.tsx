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
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
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

      <div className="flex justify-center p-4 bg-card/50 rounded-xl border border-border">
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
        <div className="border border-border rounded-xl bg-card/30 overflow-hidden">
          <AtomEditorPopover
            atom={selectedAtom}
            activeState={activeState}
            style={styles[activeState]}
            onChange={handleAtomChange}
            onClose={() => setSelectedAtom(null)}
          />
        </div>
      ) : (
        <div className="text-center p-4 rounded-xl border border-dashed border-border text-[11px] text-muted-foreground">
          Click elements on the preview card above to edit colors, sizes,
          borders, and animations.
        </div>
      )}
    </div>
  );
};
