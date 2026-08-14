"use client";

import React from "react";
import { useState } from "react";
import {
  type SignageLayoutConfig,
  type ColumnLayoutSlide,
} from "@soustools/api-types";
import { Code2 } from "lucide-react";
import { CssEditorModal } from "./css-editor-modal";
import { DisplayPicker } from "./components/DisplayManager/DisplayManager.container";
import { BodyPortal } from "./body-portal";

export interface StylesPanelProps {
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onUpdateConfig: (updates: Partial<SignageLayoutConfig>) => void;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
  deckId?: string;
}

const DIVIDER = <div className="border-border my-3 border-t" />;

export const StylesPanel: React.FC<StylesPanelProps> = ({
  config,
  activeSlideIndex,
  onUpdateConfig,
  onUpdateSlide,
  deckId,
}) => {
  const [cssModalOpen, setCssModalOpen] = useState(false);

  const activeSlide = config.slides[activeSlideIndex] as
    ColumnLayoutSlide | undefined;

  return (
    <>
      <div className="text-muted-foreground flex-1 space-y-1 overflow-y-auto px-4 py-3">
        <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest uppercase">
          Slide Settings
        </p>
        <div className="flex items-center justify-between gap-3">
          <label className="text-muted-foreground text-xs">Duration (s)</label>
          <input
            type="number"
            min={1}
            max={600}
            value={activeSlide?.durationSeconds ?? 10}
            onChange={(e) =>
              onUpdateSlide(activeSlideIndex, {
                durationSeconds: Number(e.target.value),
              })
            }
            className="bg-secondary border-border text-foreground focus:border-primary/60 w-20 rounded-lg border px-2 py-1 text-xs focus:outline-none"
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <label className="text-muted-foreground text-xs">
            Background Color
          </label>
          <input
            type="color"
            value={activeSlide?.backgroundColor ?? "#000000"}
            onChange={(e) =>
              onUpdateSlide(activeSlideIndex, {
                backgroundColor: e.target.value,
              })
            }
            className="border-border bg-secondary h-7 w-8 cursor-pointer rounded border p-0.5"
          />
        </div>
        <div className="mt-2">
          <label className="text-muted-foreground mb-1 block text-xs">
            Background Image URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={activeSlide?.backgroundImageUrl ?? ""}
            onChange={(e) =>
              onUpdateSlide(activeSlideIndex, {
                backgroundImageUrl: e.target.value || undefined,
              })
            }
            className="bg-secondary border-border text-foreground focus:border-primary/60 w-full rounded-lg border px-2 py-1.5 text-xs placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {DIVIDER}

        <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest uppercase">
          Layout Sizing
        </p>
        <p className="text-muted-foreground mb-2 text-[10px] leading-tight">
          This dictates the targeted display output for hardware players. The
          editor canvas remains responsive for ease of use.
        </p>
        <div className="mt-1 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-muted-foreground text-xs">
              Aspect Ratio
            </label>
            <select
              value={config.aspectRatio ?? "16:9"}
              onChange={(e) =>
                onUpdateConfig({
                  aspectRatio: e.target.value as "16:9" | "responsive",
                })
              }
              className="bg-secondary border-border text-foreground focus:border-primary/60 rounded-lg border px-2 py-1 text-xs focus:outline-none"
            >
              <option value="16:9">Fixed 16:9 (1920x1080)</option>
              <option value="responsive">Responsive</option>
            </select>
          </div>
          {config.aspectRatio !== "responsive" && (
            <div className="flex items-center justify-between gap-3">
              <label className="text-muted-foreground text-xs">
                Scale to Fit
              </label>
              <input
                type="checkbox"
                checked={config.scaleToFit !== false}
                onChange={(e) =>
                  onUpdateConfig({ scaleToFit: e.target.checked })
                }
                className="border-border bg-secondary h-4 w-4 cursor-pointer rounded focus:ring-0"
              />
            </div>
          )}
        </div>

        {/* Base Font section removed - now handled by Global Design Tokens */}

        {DIVIDER}

        <DisplayPicker
          deckId={deckId}
          displays={[]}
          onToggleDisplay={async () => {}}
        />

        {DIVIDER}

        <button
          onClick={() => setCssModalOpen(true)}
          className="bg-secondary border-border flex w-full cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all hover:border-white/20"
        >
          <Code2 className="h-4 w-4 shrink-0 text-blue-400" />
          <div>
            <div className="text-foreground text-xs font-semibold">
              Custom CSS
            </div>
            <div className="text-muted-foreground text-[10px]">
              {config.customCss?.trim()
                ? "CSS applied — click to edit"
                : "Click to open CSS editor"}
            </div>
          </div>
        </button>
      </div>

      {cssModalOpen && (
        <BodyPortal>
          <CssEditorModal
            value={config.customCss ?? ""}
            onChange={(v) => onUpdateConfig({ customCss: v })}
            onClose={() => setCssModalOpen(false)}
          />
        </BodyPortal>
      )}
    </>
  );
};
