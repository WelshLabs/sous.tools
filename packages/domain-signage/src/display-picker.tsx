"use client";

import React from "react";
import { SignageDisplay } from "@soustools/api-types";
import { Monitor } from "lucide-react";

export interface DisplayPickerProps {
  deckId?: string;
  displays: SignageDisplay[];
  onToggleDisplay: (displayId: string, isAssigned: boolean) => Promise<void>;
}

export const DisplayPicker: React.FC<DisplayPickerProps> = ({ deckId, displays, onToggleDisplay }) => {
  if (!deckId || displays.length === 0) return null;

  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
        <Monitor className="w-3 h-3" /> Assign Displays
      </p>
      <div className="space-y-1.5">
        {displays.map((disp) => {
          const isAssigned = disp.deckId === deckId;
          return (
            <label key={disp.id} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={isAssigned}
                onChange={(e) => onToggleDisplay(disp.id, e.target.checked)}
                className="accent-primary w-3.5 h-3.5" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{disp.name}</span>
            </label>
          );
        })}
      </div>
    </>
  );
};
