"use client";
import * as React from "react";

import {
  X,
  Settings,
  LayoutTemplate,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import {
  type SignageLayoutConfig,
  type ColumnLayoutSlide,
  type SignageBlock,
} from "@soustools/api-types";
import { StylesPanel } from "./styles-panel";
import { AddBlocksPalette } from "./add-blocks-palette";
import { LayersTree } from "./layers-tree";
import { BlockSettingsPanel } from "./block-settings-panel";
import { type PosItem } from "@soustools/api-types";
import { removeBlockFromTree } from "./block-tree-utils";

export interface RightSidePanelProps {
  isOpen: boolean;
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onUpdateConfig: (updates: Partial<SignageLayoutConfig>) => void;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
  onClose: () => void;
  deckId?: string;
  selectedBlockId?: string | null;
  selectedBlock?: SignageBlock;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlock?: (blockId: string, updates: Partial<SignageBlock>) => void;
  items?: PosItem[];
  onFetchModifierGroups?: (
    posItemId: string,
  ) => Promise<Array<{ id: string; name: string }>>;
}

const TABS = [
  { id: "settings", label: "Slide", icon: Settings },
  { id: "blocks", label: "Blocks", icon: LayoutTemplate },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "block-settings", label: "Config", icon: SlidersHorizontal },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Container: Collapsible right sidebar for the signage layout editor. */
export const RightSidePanel: React.FC<RightSidePanelProps> = ({
  isOpen,
  config,
  activeSlideIndex,
  onUpdateConfig,
  onUpdateSlide,
  onClose,
  deckId,
  selectedBlockId,
  selectedBlock,
  onSelectBlock,
  onUpdateBlock,
  items,
  onFetchModifierGroups,
}) => {
  const [activeTab, setActiveTab] = React.useState<TabId>("settings");

  React.useEffect(() => {
    if (selectedBlockId) setActiveTab("block-settings");
    else setActiveTab("settings");
  }, [selectedBlockId]);

  const handleDeleteBlock = () => {
    if (!selectedBlockId) return;
    const activeSlide = config.slides[activeSlideIndex];
    if (activeSlide.type !== "COLUMN_LAYOUT") return;
    const newCols = (activeSlide as ColumnLayoutSlide).columns.map((col) => ({
      ...col,
      blocks: col.blocks
        ? col.blocks
            .filter((b) => b.id !== selectedBlockId)
            .map((b) => removeBlockFromTree(b, selectedBlockId))
        : [],
    }));
    onUpdateSlide(activeSlideIndex, { columns: newCols });
    onSelectBlock(null);
  };

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 z-30 w-96 flex flex-col bg-card border-l border-border shadow-2xl h-full overflow-hidden transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/40">
        <span className="text-sm font-semibold text-foreground tracking-wide">
          Workspace Inspector
        </span>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-border shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 border-b-2 transition-colors ${activeTab === tab.id ? "border-primary text-primary bg-muted/50" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 relative">
        {activeTab === "settings" && (
          <StylesPanel
            config={config}
            activeSlideIndex={activeSlideIndex}
            onUpdateConfig={onUpdateConfig}
            onUpdateSlide={onUpdateSlide}
            deckId={deckId}
          />
        )}
        {activeTab === "blocks" && (
          <AddBlocksPalette
            selectedBlockId={selectedBlockId}
            selectedBlock={selectedBlock}
            onUpdateSlide={onUpdateSlide}
            activeSlideIndex={activeSlideIndex}
            config={config}
          />
        )}
        {activeTab === "layers" && (
          <LayersTree
            activeSlide={config.slides[activeSlideIndex] as ColumnLayoutSlide}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
          />
        )}
        {activeTab === "block-settings" &&
          (selectedBlockId && selectedBlock && onUpdateBlock ? (
            <BlockSettingsPanel
              selectedBlockId={selectedBlockId}
              selectedBlock={selectedBlock}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={handleDeleteBlock}
              items={items}
              config={config}
              activeSlideIndex={activeSlideIndex}
              onFetchModifierGroups={onFetchModifierGroups}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-muted-foreground">
              Select a block to configure
            </div>
          ))}
      </div>
    </div>
  );
};
