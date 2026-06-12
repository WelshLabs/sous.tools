"use client";

import React, { useState } from "react";
import { SignageLayoutConfig } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { PlaylistTab } from "./playlist-tab";
import { DesignTab } from "./design-tab";
import { StylingTab } from "./styling-tab";
import { OverlaysTab } from "./overlays-tab";
import { LayoutPreview } from "./layout-preview";
import {
  Save,
  Palette,
  ListOrdered,
  Settings,
  Layers,
} from "lucide-react";

/**
 * Props for the LayoutBuilder component.
 */
export interface LayoutBuilderProps {
  /** Initial layout configuration payload. */
  initialConfig?: SignageLayoutConfig;
  /** Callback triggered when layout updates are saved. */
  onSave?: (config: SignageLayoutConfig) => void;
  /** Name of the layout being edited. */
  layoutName?: string;
}

const DEFAULT_CONFIG: SignageLayoutConfig = {
  googleFont: "Outfit",
  soldOutBehavior: "LABEL",
  slides: [],
  overlays: [],
  customCss: "",
};

/**
 * LayoutBuilder component provides the core design and tab environment to build signage screen layouts.
 *
 * @tenant-docs-export
 * Use the Layout Builder to configure menu slides, styles, custom fonts, overlays, and live layouts.
 */
export const LayoutBuilder: React.FC<LayoutBuilderProps> = ({
  initialConfig,
  onSave,
  layoutName = "Digital Menu Layout",
}) => {
  const [config, setConfig] = useState<SignageLayoutConfig>(
    initialConfig || DEFAULT_CONFIG,
  );
  const [activeTab, setActiveTab] = useState<
    "playlist" | "design" | "styling" | "overlays"
  >("playlist");

  const updateConfig = (updates: Partial<SignageLayoutConfig>): void => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = (): void => {
    if (onSave) {
      onSave(config);
    } else {
      alert("Layout configuration saved successfully!");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 bg-[oklch(0.12_0.02_180)] text-slate-100 rounded-2xl border border-[oklch(0.22_0.02_180)] max-w-7xl mx-auto">
      <div className="xl:col-span-7 space-y-6">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{layoutName}</h2>
            <p className="text-xs text-slate-400">
              Configure layouts, playlist, fonts and overlays.
            </p>
          </div>
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-1.5 inline" /> Save Changes
          </Button>
        </header>

        <nav className="flex gap-2 border-b border-slate-800 pb-2">
          {(["playlist", "design", "styling", "overlays"] as const).map(
            (tab) => {
              const Icon = {
                playlist: ListOrdered,
                design: Settings,
                styling: Palette,
                overlays: Layers,
              }[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize cursor-pointer ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {tab}
                </button>
              );
            },
          )}
        </nav>

        <main className="bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] rounded-xl p-4">
          {activeTab === "playlist" && (
            <PlaylistTab
              slides={config.slides}
              onChange={(slides) => updateConfig({ slides })}
            />
          )}
          {activeTab === "design" && (
            <DesignTab config={config} onChange={updateConfig} />
          )}
          {activeTab === "styling" && (
            <StylingTab config={config} onChange={updateConfig} />
          )}
          {activeTab === "overlays" && (
            <OverlaysTab
              overlays={config.overlays || []}
              onChange={(overlays) => updateConfig({ overlays })}
            />
          )}
        </main>
      </div>

      <LayoutPreview config={config} />
    </div>
  );
};

/**
 * Default export of the LayoutBuilder component.
 *
 * @tenant-docs-export
 * Use the Layout Builder to configure menu slides, styles, custom fonts, overlays, and live layouts.
 */
export default LayoutBuilder;
