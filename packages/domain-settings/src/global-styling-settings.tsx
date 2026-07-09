"use client";

import React, { useState } from "react";
import { Button } from "@soustools/design-system";
import { Type, Code, Save, Loader2 } from "lucide-react";
import { type GlobalDesignTokens } from "@soustools/api-types";
import { StyleColorsSection } from "./styling-colors-section";
import { TypographySection } from "./styling-typography-section";

export interface GlobalStylingSettingsProps {
  initialTokens: GlobalDesignTokens;
  onSave: (tokens: GlobalDesignTokens) => Promise<void>;
}

/** Container: Global design token form (colors, typography, custom CSS). */
export function GlobalStylingSettings({ initialTokens, onSave }: GlobalStylingSettingsProps) {
  const [tokens, setTokens] = useState<GlobalDesignTokens>(initialTokens || {});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTokenChange = (key: keyof GlobalDesignTokens, value: string) => {
    setTokens((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await onSave(tokens);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save tokens", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl animate-in fade-in">
      {success && (
        <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-400 text-sm">
          Global styling settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        <StyleColorsSection tokens={tokens} onChange={handleTokenChange} />

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
            <Type className="w-4 h-4 text-cyan-400" />
            Global Typography
          </h3>
          <TypographySection tokens={tokens} onChange={handleTokenChange} />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
            <Code className="w-4 h-4 text-cyan-400" />
            Global Custom CSS
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
            Write raw CSS to define utility classes (e.g., .ambient-wrapper,
            .glass-panel, .menu-glow-text) that can be attached to layout
            containers and blocks in the signage editor.
          </p>
          <div className="space-y-1">
            <textarea
              rows={8}
              placeholder=".glass-panel { backdrop-filter: blur(10px); }"
              value={tokens.globalCss ?? ""}
              onChange={(e) => handleTokenChange("globalCss", e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-sky-400 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-y"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold px-6"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Design Tokens"}
        </Button>
      </div>
    </form>
  );
}
