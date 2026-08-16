/* eslint-disable max-lines */
import React from "react";
import {
  type SignageLayoutConfig,
  type PosItem,
  type SignageBlock,
  type SignageSlide,
} from "@soustools/api-types";
import { DragDropContext } from "@hello-pangea/dnd";
import { EditorTopBar } from "../../editor-top-bar";
import { RightSidePanel } from "../../right-side-panel";
import { LayoutPreview } from "../../layout-preview";
import { SlideFilmstrip } from "../../slide-filmstrip";

export interface SignageEditorViewProps {
  config: SignageLayoutConfig;
  items: PosItem[];
  activeSlideIndex: number;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  isWorkspaceOpen: boolean;
  setIsWorkspaceOpen: (v: boolean) => void;
  viewMode: "editor" | "preview" | "live";
  setViewMode: (v: "editor" | "preview" | "live") => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (v: string | null) => void;
  showOutlines: boolean;
  setShowOutlines: (v: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDraft: boolean;
  discardDraft: () => void;
  clearDraftOnSave: () => void;
  updateConfig: (updates: Partial<SignageLayoutConfig>) => void;
  updateSlide: (idx: number, updates: Partial<SignageSlide>) => void;
  selectSlide: (idx: number) => void;
  handleAddSlide: () => void;
  handleUpdateBlock: (blockId: string, updates: Partial<SignageBlock>) => void;
  handleDragEnd: (result: any) => void;
  activeBlock: SignageBlock | null;
  saving: boolean;
  onSave?: (config: SignageLayoutConfig) => void;
  layoutName: string;
  deckId?: string;
  deckSlug?: string;
  onRenameDeck?: (name: string, slug: string) => void;
  onFetchModifierGroups?: (posItemId: string) => Promise<any[]>;
  onFetchModifierOptions?: (modifierGroupId: string) => Promise<any[]>;
}

export const SignageEditorView: React.FC<SignageEditorViewProps> = ({
  config,
  items,
  activeSlideIndex,
  isPlaying,
  setIsPlaying,
  isWorkspaceOpen,
  setIsWorkspaceOpen,
  viewMode,
  setViewMode,
  selectedBlockId,
  setSelectedBlockId,
  showOutlines,
  setShowOutlines,
  containerRef,
  isDraft,
  discardDraft,
  clearDraftOnSave,
  updateConfig,
  updateSlide,
  selectSlide,
  handleAddSlide,
  handleUpdateBlock,
  handleDragEnd,
  activeBlock,
  saving,
  onSave,
  layoutName,
  deckId,
  deckSlug,
  onRenameDeck,
  onFetchModifierGroups,
  onFetchModifierOptions,
}) => {
  return (
    <div className="bg-background text-foreground flex h-full flex-col">
      <EditorTopBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        activeSlideIndex={activeSlideIndex}
        totalSlides={config.slides.length}
        onNextSlide={() =>
          selectSlide(
            (activeSlideIndex + 1) % Math.max(config.slides.length, 1),
          )
        }
        onPrevSlide={() =>
          selectSlide(
            (activeSlideIndex - 1 + Math.max(config.slides.length, 1)) %
              Math.max(config.slides.length, 1),
          )
        }
        isPreviewing={viewMode !== "editor"}
        onTogglePreview={() =>
          setViewMode(viewMode === "editor" ? "preview" : "editor")
        }
        isStylesOpen={isWorkspaceOpen}
        onToggleStyles={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
        saving={saving}
        onSave={() => {
          onSave?.(config);
          clearDraftOnSave();
        }}
        layoutName={layoutName}
        deckSlug={deckSlug}
        isDraft={isDraft}
        onDiscard={discardDraft}
        onRenameDeck={onRenameDeck}
      />
      <div className="relative flex flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          {viewMode === "editor" && (
            <>
              <div
                className={`min-h-0 w-full flex-1 overflow-y-auto transition-all duration-300 ${isWorkspaceOpen ? "mr-96" : ""}`}
              >
                <LayoutPreview
                  config={config}
                  items={items}
                  activeSlideIndex={activeSlideIndex}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={(id) => {
                    setSelectedBlockId(id);
                    setIsWorkspaceOpen(true);
                  }}
                  onFetchModifierOptions={onFetchModifierOptions}
                />
              </div>
              <RightSidePanel
                items={items}
                isOpen={isWorkspaceOpen}
                config={config}
                activeSlideIndex={activeSlideIndex}
                onUpdateConfig={updateConfig}
                onUpdateSlide={updateSlide}
                onClose={() => setIsWorkspaceOpen(false)}
                deckId={deckId}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                selectedBlock={activeBlock || undefined}
                onUpdateBlock={handleUpdateBlock}
                onFetchModifierGroups={onFetchModifierGroups}
              />
            </>
          )}
        </DragDropContext>
      </div>
      {viewMode === "editor" && (
        <SlideFilmstrip
          slides={config.slides}
          activeSlideIndex={activeSlideIndex}
          onSelectSlide={selectSlide}
          onAddSlide={handleAddSlide}
          onRemoveSlide={(i) =>
            updateConfig({
              slides: config.slides.filter((_, idx) => idx !== i),
            })
          }
          onReorderSlides={(slides) => updateConfig({ slides })}
          items={items}
          config={config}
        />
      )}

      {viewMode === "preview" && (
        <div
          ref={containerRef}
          className="bg-background dark:bg-background fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {showOutlines && (
            <style>{`
              .st-layout-column, .st-layout-row, .st-layout-grid {
                outline: 1px dashed rgba(255,255,255,0.3);
                outline-offset: -1px;
              }
            `}</style>
          )}
          <div className="flex h-full w-full items-center justify-center">
            <LayoutPreview
              config={config}
              items={items}
              activeSlideIndex={activeSlideIndex}
              isPreviewing
              onFetchModifierOptions={onFetchModifierOptions}
            />
          </div>

          <div className="bg-background/80 border-border absolute bottom-8 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-4 rounded-full border px-6 py-3 shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => setShowOutlines(!showOutlines)}
              className={`rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${showOutlines ? "text-foreground bg-cyan-500" : "bg-muted/50 text-muted-foreground hover:bg-background/10 dark:bg-background/10"}`}
            >
              {showOutlines ? "Hide Outlines" : "Show Outlines"}
            </button>
            <div className="bg-background/10 dark:bg-background/10 h-6 w-px" />
            <button
              onClick={() => setViewMode("editor")}
              className="rounded-full bg-red-500/20 px-4 py-2 text-xs font-bold tracking-wider text-red-400 uppercase transition-colors hover:bg-red-500/30"
            >
              Exit Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
