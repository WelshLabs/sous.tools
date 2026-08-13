import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  type SignageLayoutConfig,
  type RawSignageLayoutConfig,
  type SignageSlide,
  type PosItem,
  type SignageBlock,
} from "@soustools/api-types";
import { migrateConfig, DEFAULT_CONFIG } from "../../config-migration";
import { useLayoutDraft } from "../../use-layout-draft";
import { findBlockInTree, updateBlockInTree } from "../../block-tree-utils";
import { handleLayoutDragEnd } from "../../layout-drag-logic";
import { type DropResult } from "@hello-pangea/dnd";
import { SignageEditorView } from "./SignageEditor.view";

export interface SignageEditorProps {
  initialConfig?: RawSignageLayoutConfig;
  onSave?: (config: SignageLayoutConfig) => void;
  layoutName?: string;
  items: PosItem[];
  saving?: boolean;
  deckId?: string;
  deckSlug?: string;
  onRenameDeck?: (name: string, slug: string) => void;
  onFetchModifierGroups?: (posItemId: string) => Promise<any[]>;
  onFetchModifierOptions?: (modifierGroupId: string) => Promise<any[]>;
  activeSocketConfig?: SignageLayoutConfig | null;
}

export const SignageEditor: React.FC<SignageEditorProps> = ({
  initialConfig,
  onSave,
  layoutName = "TV Signage",
  items,
  saving = false,
  deckId,
  deckSlug,
  onRenameDeck,
  onFetchModifierGroups,
  onFetchModifierOptions,
  activeSocketConfig,
}) => {
  const [config, setConfig] = useState<SignageLayoutConfig>(
    initialConfig ? migrateConfig(initialConfig) : DEFAULT_CONFIG,
  );
  const [savedConfig, setSavedConfig] = useState<SignageLayoutConfig | null>(
    initialConfig ? migrateConfig(initialConfig) : DEFAULT_CONFIG,
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"editor" | "preview" | "live">(
    "editor",
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showOutlines, setShowOutlines] = useState(false);

  useEffect(() => {
    if (activeSocketConfig) {
      setConfig(activeSocketConfig);
      setSavedConfig(activeSocketConfig);
    }
  }, [activeSocketConfig]);

  const { isDraft, discardDraft, clearDraftOnSave } = useLayoutDraft(
    deckId,
    config,
    setConfig,
    savedConfig,
  );
  const updateConfig = useCallback(
    (updates: Partial<SignageLayoutConfig>) =>
      setConfig((p) => ({ ...p, ...updates })),
    [],
  );
  const selectSlide = (idx: number) => {
    setActiveSlideIndex(idx);
    setIsPlaying(false);
    setSelectedBlockId(null);
  };

  const handleAddSlide = useCallback(() => {
    const newSlide: any = {
      id: `slide-${Date.now()}`,
      type: "COLUMN_LAYOUT",
      durationSeconds: 10,
      columns: [
        {
          type: "MENU",
          blocks: [
            {
              id: `block-root-${Date.now()}`,
              type: "ColumnBlock",
              blocks: [],
            },
          ],
        },
      ],
    };
    updateConfig({ slides: [...config.slides, newSlide] });
    setActiveSlideIndex(config.slides.length);
  }, [config.slides, updateConfig]);

  const updateSlide = useCallback(
    (idx: number, updates: Partial<SignageSlide>) => {
      const newSlides = [...config.slides];
      newSlides[idx] = { ...newSlides[idx], ...updates } as SignageSlide;
      updateConfig({ slides: newSlides });
    },
    [config.slides, updateConfig],
  );

  const handleUpdateBlock = useCallback(
    (blockId: string, updates: Partial<SignageBlock>) => {
      const activeSlide = config.slides[activeSlideIndex];
      if (!activeSlide || activeSlide.type !== "COLUMN_LAYOUT") return;
      const newCols = activeSlide.columns.map((col) => ({
        ...col,
        blocks: col.blocks?.map((b) => updateBlockInTree(b, blockId, updates)),
      }));
      updateSlide(activeSlideIndex, { columns: newCols });
    },
    [config.slides, activeSlideIndex, updateSlide],
  );

  const handleDragEnd = (result: DropResult) => {
    handleLayoutDragEnd(result, config, activeSlideIndex, updateSlide);
  };

  const getSelectedBlock = (): SignageBlock | null => {
    if (!selectedBlockId) return null;
    const activeSlide = config.slides[activeSlideIndex];
    if (!activeSlide || activeSlide.type !== "COLUMN_LAYOUT") return null;
    for (const col of activeSlide.columns) {
      if (!col.blocks) continue;
      for (const block of col.blocks) {
        const found = findBlockInTree(block, selectedBlockId);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!isPlaying || config.slides.length <= 1) return;
    const timer = setTimeout(
      () => {
        setActiveSlideIndex((prev) => (prev + 1) % config.slides.length);
      },
      ((config.slides[activeSlideIndex] as any)?.durationSeconds || 10) * 1000,
    );
    return () => clearTimeout(timer);
  }, [isPlaying, activeSlideIndex, config.slides]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && viewMode !== "editor") setViewMode("editor");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewMode]);

  const activeBlock = getSelectedBlock();

  return (
    <SignageEditorView
      config={config}
      items={items}
      activeSlideIndex={activeSlideIndex}
      isPlaying={isPlaying}
      setIsPlaying={setIsPlaying}
      isWorkspaceOpen={isWorkspaceOpen}
      setIsWorkspaceOpen={setIsWorkspaceOpen}
      viewMode={viewMode}
      setViewMode={setViewMode}
      selectedBlockId={selectedBlockId}
      setSelectedBlockId={setSelectedBlockId}
      showOutlines={showOutlines}
      setShowOutlines={setShowOutlines}
      containerRef={containerRef}
      isDraft={isDraft}
      discardDraft={discardDraft}
      clearDraftOnSave={clearDraftOnSave}
      updateConfig={updateConfig}
      updateSlide={updateSlide}
      selectSlide={selectSlide}
      handleAddSlide={handleAddSlide}
      handleUpdateBlock={handleUpdateBlock}
      handleDragEnd={handleDragEnd}
      activeBlock={activeBlock}
      saving={saving}
      onSave={onSave}
      layoutName={layoutName}
      deckId={deckId}
      deckSlug={deckSlug}
      onRenameDeck={onRenameDeck}
      onFetchModifierGroups={onFetchModifierGroups}
      onFetchModifierOptions={onFetchModifierOptions}
    />
  );
};
