"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { SignageLayoutConfig, RawSignageLayoutConfig, SignageSlide, PosItem, SignageBlock } from "@soustools/api-types";
import { EditorTopBar } from "./editor-top-bar";
import { SlideFilmstrip } from "./slide-filmstrip";
import { RightSidePanel } from "./right-side-panel";
import { LayoutPreview } from "./layout-preview";
import { migrateConfig, DEFAULT_CONFIG } from "./config-migration";
import { useLayoutDraft } from "./use-layout-draft";
import { findBlockInTree, updateBlockInTree, removeBlockFromTree, insertBlockAt } from "./block-tree-utils";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

export interface LayoutBuilderProps {
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

export const LayoutBuilder: React.FC<LayoutBuilderProps> = ({
  initialConfig, onSave, layoutName = "TV Signage", items, saving = false, deckId, deckSlug, onRenameDeck,
  onFetchModifierGroups, onFetchModifierOptions, activeSocketConfig,
}) => {
  const [config, setConfig] = useState<SignageLayoutConfig>(initialConfig ? migrateConfig(initialConfig) : DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig] = useState<SignageLayoutConfig | null>(initialConfig ? migrateConfig(initialConfig) : DEFAULT_CONFIG);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"editor" | "preview" | "live">("editor");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showOutlines, setShowOutlines] = useState(false);

  useEffect(() => {
    if (activeSocketConfig) {
      setConfig(activeSocketConfig);
      setSavedConfig(activeSocketConfig);
    }
  }, [activeSocketConfig]);

  const { isDraft, discardDraft, clearDraftOnSave } = useLayoutDraft(deckId, config, setConfig, savedConfig);
  const updateConfig = useCallback((updates: Partial<SignageLayoutConfig>) => setConfig((p) => ({ ...p, ...updates })), []);
  const selectSlide = (idx: number) => { setActiveSlideIndex(idx); setIsPlaying(false); setSelectedBlockId(null); };

  const handleAddSlide = useCallback(() => {
    const newSlide: any = {
      id: `slide-${Date.now()}`,
      type: "COLUMN_LAYOUT",
      durationSeconds: 10,
      columns: [{
        type: "MENU",
        blocks: [{
          id: `block-root-${Date.now()}`,
          type: "ColumnBlock",
          blocks: []
        }]
      }]
    };
    updateConfig({ slides: [...config.slides, newSlide] });
    setActiveSlideIndex(config.slides.length);
  }, [config.slides, updateConfig]);

  const updateSlide = useCallback((idx: number, updates: Partial<SignageSlide>) => {
    const newSlides = [...config.slides];
    newSlides[idx] = { ...newSlides[idx], ...updates } as SignageSlide;
    updateConfig({ slides: newSlides });
  }, [config.slides, updateConfig]);

  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<SignageBlock>) => {
    const activeSlide = config.slides[activeSlideIndex];
    if (!activeSlide || activeSlide.type !== "COLUMN_LAYOUT") return;
    const newCols = activeSlide.columns.map(col => ({
      ...col,
      blocks: col.blocks?.map(b => updateBlockInTree(b, blockId, updates))
    }));
    updateSlide(activeSlideIndex, { columns: newCols });
  }, [config.slides, activeSlideIndex, updateSlide]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const activeSlide = config.slides[activeSlideIndex];
    if (!activeSlide || activeSlide.type !== "COLUMN_LAYOUT") return;

    const newCols = activeSlide.columns.map(col => {
      if (!col.blocks) return col;
      let newBlocks = [...col.blocks];
      
      if (source.droppableId === "sidebar-blocks") {
        const type = result.draggableId.replace("sidebar-add-", "");
        const newBlock: SignageBlock = type.endsWith("Block") 
          ? { id: `block-${Date.now()}`, type: type as any, blocks: [], cells: type === "GridBlock" ? [] : undefined } as any
          : { id: `block-${Date.now()}`, type: type as any } as any;
        newBlocks = newBlocks.map(root => insertBlockAt(root, destination.droppableId, destination.index, newBlock));
        return { ...col, blocks: newBlocks };
      }

      let movedBlock: SignageBlock | undefined;
      for (const root of newBlocks) {
        const sourceParent = findBlockInTree(root, source.droppableId);
        if (sourceParent) {
          if (sourceParent.type === "ColumnBlock" || sourceParent.type === "RowBlock" || sourceParent.type === "ExplodedItemBlock") {
            movedBlock = sourceParent.blocks[source.index];
          } else if (sourceParent.type === "GridBlock") {
            movedBlock = sourceParent.cells[source.index];
          }
          if (movedBlock) break;
        }
      }

      if (!movedBlock || !movedBlock.id) return col;

      if (source.droppableId === destination.droppableId) {
        const reorderInTree = (b: SignageBlock): SignageBlock => {
          if (b.id === source.droppableId) {
             if (b.type === "ColumnBlock" || b.type === "RowBlock" || b.type === "ExplodedItemBlock") {
               const blks = [...b.blocks];
               const [removed] = blks.splice(source.index, 1);
               blks.splice(destination.index, 0, removed);
               return { ...b, blocks: blks };
             }
             if (b.type === "GridBlock") {
               const cells = [...b.cells];
               const [removed] = cells.splice(source.index, 1);
               cells.splice(destination.index, 0, removed);
               return { ...b, cells };
             }
          }
          if (b.type === "ColumnBlock" || b.type === "RowBlock" || b.type === "ExplodedItemBlock") {
             return { ...b, blocks: b.blocks.map(child => reorderInTree(child)) };
          }
          if (b.type === "GridBlock") {
             return { ...b, cells: b.cells.map(child => reorderInTree(child)) };
          }
          return b;
        };
        newBlocks = newBlocks.map(root => reorderInTree(root));
      } else {
        newBlocks = newBlocks.map(root => removeBlockFromTree(root, movedBlock!.id!));
        newBlocks = newBlocks.map(root => insertBlockAt(root, destination.droppableId, destination.index, movedBlock!));
      }
      
      return { ...col, blocks: newBlocks };
    });

    updateSlide(activeSlideIndex, { columns: newCols });
  }, [config.slides, activeSlideIndex, updateSlide]);

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
    const timer = setTimeout(() => {
      setActiveSlideIndex((prev) => (prev + 1) % config.slides.length);
    }, ((config.slides[activeSlideIndex] as any)?.durationSeconds || 10) * 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, activeSlideIndex, config.slides]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && viewMode !== "editor") setViewMode("editor"); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewMode]);

  const activeBlock = getSelectedBlock();

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-slate-100">
      <EditorTopBar
        isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
        activeSlideIndex={activeSlideIndex} totalSlides={config.slides.length}
        onNextSlide={() => selectSlide((activeSlideIndex + 1) % Math.max(config.slides.length, 1))}
        onPrevSlide={() => selectSlide((activeSlideIndex - 1 + Math.max(config.slides.length, 1)) % Math.max(config.slides.length, 1))}
        isPreviewing={viewMode !== "editor"} onTogglePreview={() => setViewMode(viewMode === "editor" ? "preview" : "editor")}
        isStylesOpen={isWorkspaceOpen} onToggleStyles={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
        saving={saving} onSave={() => { onSave?.(config); clearDraftOnSave(); }}
        layoutName={layoutName} deckSlug={deckSlug} isDraft={isDraft} onDiscard={discardDraft} onRenameDeck={onRenameDeck}
      />
      <div className="flex-1 relative flex overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          {viewMode === "editor" && (
            <>
              <div className={`flex-1 min-h-0 w-full overflow-y-auto transition-all duration-300 ${isWorkspaceOpen ? "mr-96" : ""}`}>
                <LayoutPreview config={config} items={items} activeSlideIndex={activeSlideIndex} selectedBlockId={selectedBlockId} onSelectBlock={(id) => { setSelectedBlockId(id); setIsWorkspaceOpen(true); }} onFetchModifierOptions={onFetchModifierOptions} />
              </div>
              <RightSidePanel items={items} isOpen={isWorkspaceOpen} config={config} activeSlideIndex={activeSlideIndex} onUpdateConfig={updateConfig} onUpdateSlide={updateSlide} onClose={() => setIsWorkspaceOpen(false)} deckId={deckId} selectedBlockId={selectedBlockId} onSelectBlock={setSelectedBlockId} selectedBlock={activeBlock} onUpdateBlock={handleUpdateBlock} onFetchModifierGroups={onFetchModifierGroups} />
            </>
          )}
        </DragDropContext>
      </div>
      {viewMode === "editor" && (
        <SlideFilmstrip slides={config.slides} activeSlideIndex={activeSlideIndex} onSelectSlide={selectSlide} onAddSlide={handleAddSlide} onRemoveSlide={(i) => updateConfig({ slides: config.slides.filter((_, idx) => idx !== i) })} onReorderSlides={(slides) => updateConfig({ slides })} items={items} config={config} />
      )}
      
      {viewMode === "preview" && (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-white dark:bg-black flex items-center justify-center overflow-hidden">
          {showOutlines && (
            <style>{`
              .st-layout-column, .st-layout-row, .st-layout-grid {
                outline: 1px dashed rgba(255,255,255,0.3);
                outline-offset: -1px;
              }
            `}</style>
          )}
          <div className="w-full h-full flex items-center justify-center">
            <LayoutPreview config={config} items={items} activeSlideIndex={activeSlideIndex} isPreviewing onFetchModifierOptions={onFetchModifierOptions} />
          </div>
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-full bg-zinc-950/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl z-[60]">
             <button onClick={() => setShowOutlines(!showOutlines)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${showOutlines ? "bg-cyan-500 text-black" : "bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-black/10 dark:bg-white/10"}`}>
                {showOutlines ? "Hide Outlines" : "Show Outlines"}
             </button>
             <div className="w-px h-6 bg-black/10 dark:bg-white/10" />
             <button onClick={() => setViewMode("editor")} className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                Exit Preview
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutBuilder;
