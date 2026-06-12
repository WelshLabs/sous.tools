"use client";

import React from "react";
import { SignageLayoutConfig } from "@soustools/api-types";
import { CssHelper } from "./css-helper";

interface StylingTabProps {
  config: SignageLayoutConfig;
  onChange: (updates: Partial<SignageLayoutConfig>) => void;
}

/**
 * StylingTab allows users to customize layout styling with raw CSS and helper options.
 *
 * @tenant-docs-export
 * Use the Styling Tab to enter custom CSS overrides, use class dictionaries, and select style presets.
 */
export const StylingTab: React.FC<StylingTabProps> = ({ config, onChange }) => {
  const handleCssChange = (val: string): void => {
    onChange({ customCss: val });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          Custom Styles & Animations
        </h3>
        <p className="text-xs text-slate-400">
          Inject raw CSS to customize your menu layout. Use the dictionary for
          reference or load a preset.
        </p>
      </div>
      <CssHelper value={config.customCss || ""} onChange={handleCssChange} />
    </div>
  );
};
