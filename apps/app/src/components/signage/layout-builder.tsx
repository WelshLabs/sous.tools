"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SignageLayoutConfig, RawSignageLayoutConfig, SignageSlide, PosItem } from "@soustools/api-types";
import { EditorTopBar } from "./editor-top-bar";
import { LayoutPickerModal } from "./layout-picker-modal";
import { SlideFilmstrip } from "./slide-filmstrip";
import { RightSidePanel } from "./right-side-panel";
import { LayoutPreview } from "./layout-preview";
import { migrateConfig, DEFAULT_CONFIG } from "./config-migration";
import { useLayoutSocket } from "./use-layout-socket";
import { useLayoutDraft } from "./use-layout-draft";

export interface LayoutBuilderProps {
  initialConfig?: RawSignageLayoutConfig;
  onSave?: (config: SignageLayoutConfig) => void;
  layoutName?: string;
  items: PosItem[];
  saving?: boolean;
  deckId?: string;
  deckSlug?: string;
  onRenameDeck?: (name: string, slug: string) => void;
}

export const LayoutBuilder: React.FC<LayoutBuilderProps> = ({
  initialConfig, onSave, layoutName = "TV Signage", items, saving = false,
  deckId, deckSlug, onRenameDeck,
}) => {
  const [config, setConfig] = useState<SignageLayoutConfig>(
    initialConfig ? migrateConfig(initialConfig) : DEFAULT_CONFIG
  );
  const [savedConfig, setSavedConfig] = useState<SignageLayoutConfig | null>(
    initialConfig ? migrateConfig(initialConfig) : DEFAULT_CONFIG
  );

  useEffect(() => {
    if (initialConfig) {
      const parsed = migrateConfig(initialConfig);
      setSavedConfig(parsed);
      const localStorageKey = deckId ? `signage-draft-${deckId}` : "";
      const hasDraft = localStorageKey ? !!localStorage.getItem(localStorageKey) : false;
      if (!hasDraft) {
        setConfig(parsed);
      }
    }
  }, [initialConfig, deckId]);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<"styles" | "content" | null>(null);

  const updateConfig = useCallback((updates: Partial<SignageLayoutConfig>) => setConfig((p) => ({ ...p, ...updates })), []);
  const selectSlide = (idx: number) => { setActiveSlideIndex(idx); setIsPlaying(false); };
  const updateSlide = (idx: number, updates: Partial<SignageSlide>) => {
    const newSlides = [...config.slides];
    newSlides[idx] = { ...newSlides[idx], ...updates } as SignageSlide;
    updateConfig({ slides: newSlides });
  };

  useLayoutSocket(deckId, (c) => { setConfig(c); setSavedConfig(c); });
  const { isDraft, discardDraft, clearDraftOnSave } = useLayoutDraft(deckId, config, setConfig, savedConfig);

  useEffect(() => {
    if (!isPlaying || config.slides.length <= 1) return;
    const current = config.slides[activeSlideIndex] || config.slides[0];
    const timer = setTimeout(() => {
      setActiveSlideIndex((prev) => (prev + 1) % config.slides.length);
    }, (current?.durationSeconds || 10) * 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, activeSlideIndex, config.slides]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && isPreviewing) setIsPreviewing(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPreviewing]);

  const handleSave = () => {
    onSave?.(config);
    clearDraftOnSave();
  };

  const totalSlides = config.slides.length;
  const isStylesOpen = rightPanelMode === "styles";

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-slate-100">
      <EditorTopBar
        isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
        activeSlideIndex={activeSlideIndex} totalSlides={totalSlides}
        onNextSlide={() => selectSlide((activeSlideIndex + 1) % Math.max(totalSlides, 1))}
        onPrevSlide={() => selectSlide((activeSlideIndex - 1 + Math.max(totalSlides, 1)) % Math.max(totalSlides, 1))}
        isPreviewing={isPreviewing} onTogglePreview={() => setIsPreviewing(!isPreviewing)}
        isStylesOpen={isStylesOpen} onToggleStyles={() => setRightPanelMode(isStylesOpen ? null : "styles")}
        onAddSlide={() => setIsPickerOpen(true)} saving={saving} onSave={handleSave}
        layoutName={layoutName} deckSlug={deckSlug} isDraft={isDraft} onDiscard={discardDraft} onRenameDeck={onRenameDeck}
      />

      {!isPreviewing ? (
        <div className="flex-1 relative flex overflow-hidden">
          <div className={`flex-1 flex flex-col transition-all duration-300 ${rightPanelMode ? "mr-80" : ""}`}>
            <LayoutPreview config={config} items={items} activeSlideIndex={activeSlideIndex} onUpdateSlide={updateSlide} onOpenContentPanel={() => setRightPanelMode("content")} />
          </div>
          <RightSidePanel mode={rightPanelMode} config={config} activeSlideIndex={activeSlideIndex} onUpdateConfig={updateConfig} onUpdateSlide={(idx, updates) => updateSlide(idx, updates)} onClose={() => setRightPanelMode(null)} items={items} deckId={deckId} />
        </div>
      ) : (
        <div className="flex-1 relative">
          <LayoutPreview config={config} items={items} activeSlideIndex={activeSlideIndex} onUpdateSlide={updateSlide} isPreviewing />
          <button onClick={() => setIsPreviewing(false)} className="absolute top-4 right-4 z-50 px-4 py-2 bg-zinc-900/90 border border-white/10 rounded-xl text-sm text-slate-200 hover:bg-zinc-800 transition cursor-pointer">Exit Preview (ESC)</button>
        </div>
      )}

      {!isPreviewing && (
        <SlideFilmstrip
          slides={config.slides} activeSlideIndex={activeSlideIndex} onSelectSlide={selectSlide} onAddSlide={() => setIsPickerOpen(true)}
          onRemoveSlide={(i) => { const s = [...config.slides]; s.splice(i, 1); updateConfig({ slides: s }); }}
          onReorderSlides={(slides) => updateConfig({ slides })} items={items} config={config}
        />
      )}

      <LayoutPickerModal open={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={(slide) => updateConfig({ slides: [...config.slides, slide] })} />
    </div>
  );
};

export default LayoutBuilder;
