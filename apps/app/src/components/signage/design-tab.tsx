"use client";

import React from "react";
import { SignageLayoutConfig } from "@soustools/api-types";

interface DesignTabProps {
  config: SignageLayoutConfig;
  onChange: (updates: Partial<SignageLayoutConfig>) => void;
}

const POPULAR_FONTS = [
  "Inter",
  "Outfit",
  "Roboto",
  "Montserrat",
  "Playfair Display",
  "Caveat",
  "Pacifico",
  "Bebas Neue",
  "Fredoka One",
  "Cinzel",
];

/**
 * DesignTab provides options to customize the fonts and sold-out behaviors of the signage board.
 *
 * @tenant-docs-export
 * Use the Design Tab to set the typography, select custom fonts, and configure how sold-out items behave.
 */
export const DesignTab: React.FC<DesignTabProps> = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Google Font Family
        </label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {POPULAR_FONTS.map((font) => (
            <button
              key={font}
              onClick={() => onChange({ googleFont: font })}
              className={`px-3 py-2 text-sm text-left rounded-lg border transition-all ${
                config.googleFont === font
                  ? "bg-primary/20 border-primary text-primary-foreground font-bold"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Or type custom Google Font name..."
          value={config.googleFont || ""}
          onChange={(e) => onChange({ googleFont: e.target.value })}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Sold Out Behavior
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["HIDE", "LABEL", "STRIKE", "GRAY_OUT"] as const).map(
            (behavior) => {
              const desc = {
                HIDE: "Remove the item completely from the display",
                LABEL: "Append a high-contrast 'SOLD OUT' overlay badge",
                STRIKE: "Apply line-through decoration and drop opacity to 40%",
                GRAY_OUT: "Reduce item opacity without a badge or strike",
              }[behavior];

              return (
                <button
                  key={behavior}
                  onClick={() => onChange({ soldOutBehavior: behavior })}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    config.soldOutBehavior === behavior
                      ? "bg-primary/20 border-primary text-slate-100"
                      : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="text-sm font-bold">{behavior}</div>
                  <div className="text-xs text-slate-400 mt-1">{desc}</div>
                </button>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
};
