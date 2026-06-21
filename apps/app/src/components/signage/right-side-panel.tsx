"use client";

import React from "react";
import { X, Settings, LayoutTemplate, Layers, SlidersHorizontal, Trash2 } from "lucide-react";
import { SignageLayoutConfig, ColumnLayoutSlide, MenuItemStyles, SignageBlock } from "@soustools/api-types";
import { StylesPanel } from "./styles-panel";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";
import { AddBlocksPalette } from "./add-blocks-palette";
import { LayersTree } from "./layers-tree";
import { MenuItemStylesInspector } from "./menu-item-styles-inspector";
import { PosItem } from "@soustools/api-types";
import { findBlockInTree, removeBlockFromTree } from "./block-tree-utils";
import { supabase } from "../../lib/supabase";
import { PosItemPicker, PosItemMultiPicker } from "./pos-item-picker";
import { MenuListModifierSettings } from "./menu-list-modifier-settings";
import { LayoutControls } from "./editor-controls/LayoutControls";
import { TypographyControls } from "./editor-controls/TypographyControls";
import { BackgroundControls } from "./editor-controls/BackgroundControls";
import { BorderControls } from "./editor-controls/BorderControls";

export interface RightSidePanelProps {
  isOpen: boolean;
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onUpdateConfig: (updates: Partial<SignageLayoutConfig>) => void;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
  onClose: () => void;
  deckId?: string;
  selectedBlockId?: string | null;
  onSelectBlock: (id: string | null) => void;
  selectedBlock?: SignageBlock | null;
  onUpdateBlock?: (blockId: string, updates: Partial<SignageBlock>) => void;
  items?: PosItem[];
}

// Legacy LayoutContainerSettings removed in favor of generic LayoutControls



function ModifierGroupSettings({
  posItemId,
  selectedBlock,
  selectedBlockId,
  onUpdateBlock
}: {
  posItemId: string;
  selectedBlock: any;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: any) => void;
}) {
  const [groups, setGroups] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pos_item_modifier_groups')
          .select(`
            modifier_group_id,
            pos_modifier_groups (
              id,
              name
            )
          `)
          .eq('pos_item_id', posItemId);
        
        if (!error && data) {
           setGroups(data.map((d: any) => d.pos_modifier_groups).filter(Boolean));
        }
      } catch (err) {}
      setLoading(false);
    }
    load();
  }, [posItemId]);

  if (loading) return <div className="text-xs text-zinc-500 italic p-2 bg-zinc-900/50 rounded border border-white/5 animate-pulse">Loading modifier groups...</div>;
  if (groups.length === 0) return <div className="text-xs text-zinc-500 italic p-2 bg-zinc-900/50 rounded border border-white/5">This item has no modifier groups configured.</div>;

  return (
    <div className="flex flex-col gap-2">
      {groups.map(g => {
        const isSelected = selectedBlock.modifierGroupId === g.id;
        return (
          <label key={g.id} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? "bg-cyan-900/30 border-cyan-500/50" : "bg-zinc-900 border-white/5 hover:border-cyan-500/30"}`}>
            <input type="radio" name="modifierGroupSelect" checked={isSelected} onChange={(e) => {
              if (e.target.checked) onUpdateBlock(selectedBlockId, { modifierGroupId: g.id });
            }} className="w-4 h-4 text-cyan-500 bg-zinc-900 border-white/10" />
            <div className="flex flex-col">
              <span className="text-xs text-zinc-200 font-medium">{g.name}</span>
            </div>
          </label>
        );
      })}
    </div>
  );
}

export const RightSidePanel: React.FC<RightSidePanelProps> = ({
  isOpen, config, activeSlideIndex, onUpdateConfig, onUpdateSlide, onClose, deckId,
  selectedBlockId, onSelectBlock, selectedBlock, onUpdateBlock, items = []
}) => {
  const [activeTab, setActiveTab] = React.useState<"settings" | "blocks" | "layers" | "block-settings">("settings");

  React.useEffect(() => {
    if (selectedBlockId) {
      if (selectedBlock && ["ColumnBlock", "RowBlock", "GridBlock"].includes(selectedBlock.type)) {
        const hasChildren = (selectedBlock as any).blocks?.length > 0 || (selectedBlock as any).cells?.length > 0;
        if (!hasChildren) {
          setActiveTab("blocks");
        } else {
          setActiveTab("block-settings");
        }
      } else {
        setActiveTab("block-settings");
      }
    } else {
      setActiveTab("settings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlockId]);

  if (!isOpen) return null;

  const activeSlide = config.slides[activeSlideIndex];

  function findParentExplodedItem(root: SignageBlock, childId: string): SignageBlock | null {
    if (root.type === "ExplodedItemBlock") {
      if (root.id === childId) return root;
      if (root.blocks) {
        for (const b of root.blocks) {
          if (findBlockInTree(b, childId)) return root;
        }
      }
    }
    if (root.type === "ColumnBlock" || root.type === "RowBlock" || root.type === "ExplodedItemBlock") {
      if (root.blocks) {
        for (const b of root.blocks) {
           const found = findParentExplodedItem(b, childId);
           if (found) return found;
        }
      }
    }
    if (root.type === "GridBlock") {
      if (root.cells) {
        for (const b of root.cells) {
           const found = findParentExplodedItem(b, childId);
           if (found) return found;
        }
      }
    }
    return null;
  }

  const tabs = [
    { id: "settings", icon: Settings, label: "Slide Settings" },
    { id: "blocks", icon: LayoutTemplate, label: "Add Blocks" },
    { id: "layers", icon: Layers, label: "Layers Tree" },
    { id: "block-settings", icon: SlidersHorizontal, label: "Block Settings" },
  ] as const;

  const handleUpdateBlockStyles = (s: MenuItemStyles): void => {
    if (selectedBlockId && onUpdateBlock) {
      onUpdateBlock(selectedBlockId, { styles: s });
    }
  };

  const handleDeleteBlock = () => {
    if (!selectedBlockId) return;
    const activeSlide = config.slides[activeSlideIndex];
    if (activeSlide.type !== "COLUMN_LAYOUT") return;
    const newCols = activeSlide.columns.map(col => ({
      ...col,
      blocks: col.blocks ? col.blocks.filter(b => b.id !== selectedBlockId).map(b => removeBlockFromTree(b, selectedBlockId)) : []
    }));
    onUpdateSlide(activeSlideIndex, { columns: newCols });
    onSelectBlock(null);
  };

  return (
    <div className={`absolute right-0 top-0 bottom-0 z-30 w-96 flex flex-col bg-zinc-950 border-l border-white/5 shadow-2xl h-full overflow-hidden transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0 bg-zinc-900/50">
        <span className="text-sm font-semibold text-zinc-200 tracking-wide">Workspace Inspector</span>
        <button onClick={onClose} aria-label="Close panel" className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-white/5 shrink-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 border-b-2 transition-colors ${activeTab === tab.id ? "border-cyan-400 text-cyan-400 bg-white/5" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}>
            <tab.icon className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 relative">
        {activeTab === "settings" && (
          <StylesPanel config={config} activeSlideIndex={activeSlideIndex} onUpdateConfig={onUpdateConfig} onUpdateSlide={onUpdateSlide} deckId={deckId} />
        )}
        {activeTab === "blocks" && (
          <AddBlocksPalette selectedBlockId={selectedBlockId} selectedBlock={selectedBlock} onUpdateSlide={onUpdateSlide} activeSlideIndex={activeSlideIndex} config={config} />
        )}
        {activeTab === "layers" && (
          <LayersTree activeSlide={config.slides[activeSlideIndex] as ColumnLayoutSlide} selectedBlockId={selectedBlockId} onSelectBlock={onSelectBlock} />
        )}
        {activeTab === "block-settings" && (
          selectedBlockId && selectedBlock && onUpdateBlock ? (
             <div className="flex-1 overflow-y-auto flex flex-col min-h-0 relative">
               <div className="px-4 py-3 flex justify-end border-b border-white/5 bg-zinc-900/20">
                 <button onClick={handleDeleteBlock} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 rounded-lg transition-colors">
                   <Trash2 className="w-3.5 h-3.5" />
                   Delete Block
                 </button>
               </div>
               <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 space-y-6">
                  {/* Generic Layout Controls */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-1">Layout</label>
                    <LayoutControls block={selectedBlock} onUpdate={(u) => onUpdateBlock(selectedBlockId, u)} />
                  </div>
                  {/* Generic Typography Controls */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-1">Typography</label>
                    <TypographyControls block={selectedBlock} onUpdate={(u) => onUpdateBlock(selectedBlockId, u)} />
                  </div>
                  {/* Generic Background Controls */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-1">Background</label>
                    <BackgroundControls block={selectedBlock} onUpdate={(u) => onUpdateBlock(selectedBlockId, u)} />
                  </div>
                  {/* Generic Border Controls */}
                  <div className="space-y-3">
                    <BorderControls block={selectedBlock} onUpdate={(u) => onUpdateBlock(selectedBlockId, u)} />
                  </div>
                  <div className="h-px bg-white/5 w-full my-6" />
                  {/* MenuList Data Source */}
                  {selectedBlock.type === "MenuListBlock" && (
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <input type="checkbox" checked={(selectedBlock as any).hideDescriptions || false} onChange={(e) => onUpdateBlock(selectedBlockId, { hideDescriptions: e.target.checked } as any)} className="w-4 h-4 rounded border-white/10 bg-black text-cyan-500 focus:ring-cyan-500" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Hide Item Descriptions</span>
                      </label>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">Data Source (POS Items)</label>
                      <PosItemMultiPicker
                        items={items}
                        selectedIds={selectedBlock.itemIds || []}
                        onChange={(ids) => onUpdateBlock(selectedBlockId, { itemIds: ids })}
                        placeholder="Search items..."
                      />
                      <MenuListModifierSettings
                        items={items}
                        selectedItemIds={selectedBlock.itemIds || []}
                        itemModifiers={(selectedBlock as any).itemModifiers || {}}
                        modifierLayout={(selectedBlock as any).modifierLayout || "stacked"}
                        onChangeLayout={(layout) => onUpdateBlock(selectedBlockId, { modifierLayout: layout } as any)}
                        onChangeModifiers={(modifiers) => onUpdateBlock(selectedBlockId, { itemModifiers: modifiers } as any)}
                      />
                    </div>
                  )}

                  {/* Category Header */}
                  {selectedBlock.type === "CategoryHeaderBlock" && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Header Details</label>
                      <input type="text" value={selectedBlock.title || ""} placeholder="Title"
                        onChange={(e) => onUpdateBlock(selectedBlockId, { title: e.target.value } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                      <input type="text" value={selectedBlock.subtitle || ""} placeholder="Subtitle"
                        onChange={(e) => onUpdateBlock(selectedBlockId, { subtitle: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                      <input type="text" value={selectedBlock.badge || ""} placeholder="Badge (Optional)"
                        onChange={(e) => onUpdateBlock(selectedBlockId, { badge: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={(selectedBlock as any).animateBadge || false} onChange={(e) => onUpdateBlock(selectedBlockId, { animateBadge: e.target.checked } as any)} className="w-4 h-4 rounded border-white/10 bg-black text-cyan-500 focus:ring-cyan-500" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Animate Badge Pulse</span>
                      </label>
                      <select value={(selectedBlock as any).icon || "none"} onChange={(e) => onUpdateBlock(selectedBlockId, { icon: e.target.value } as any)} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100">
                        <option value="none">No Icon</option>
                        <option value="CheckCircle">Check Circle</option>
                        <option value="ChefHat">Chef Hat</option>
                        <option value="Star">Star</option>
                        <option value="Bell">Bell</option>
                        <option value="Flame">Flame</option>
                      </select>
                      <label className="flex items-center gap-3 cursor-pointer mt-2">
                        <input type="checkbox" checked={(selectedBlock as any).accentBorder || false} onChange={(e) => onUpdateBlock(selectedBlockId, { accentBorder: e.target.checked } as any)} className="w-4 h-4 rounded border-white/10 bg-black text-cyan-500 focus:ring-cyan-500" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Accent Border</span>
                      </label>
                    </div>
                  )}

                  {/* Modifier Group */}
                  {selectedBlock.type === "ModifierGroupBlock" && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Contextual Modifiers</label>
                      {(() => {
                        let parentExplodedItem = null;
                        if (activeSlide && activeSlide.type === "COLUMN_LAYOUT") {
                          for (const col of activeSlide.columns) {
                            if (col.blocks) {
                              for (const root of col.blocks) {
                                const found = findParentExplodedItem(root, selectedBlockId);
                                if (found) parentExplodedItem = found;
                              }
                            }
                          }
                        }
                        if (!parentExplodedItem || parentExplodedItem.type !== "ExplodedItemBlock" || !parentExplodedItem.menuItemId) {
                          return <div className="text-xs text-zinc-500 p-2 italic bg-zinc-900/50 rounded border border-white/5">This block must be placed inside an Exploded Item container with a Base POS Item selected.</div>;
                        }
                        return (
                          <ModifierGroupSettings 
                            posItemId={parentExplodedItem.menuItemId} 
                            selectedBlock={selectedBlock} 
                            selectedBlockId={selectedBlockId} 
                            onUpdateBlock={onUpdateBlock} 
                          />
                        );
                      })()}
                    </div>
                  )}

                  {/* Image Block */}
                  {selectedBlock.type === "ImageBlock" && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Image Source</label>
                      <input type="text" value={(selectedBlock as any).imageUrl || ""} placeholder="https://..."
                        onChange={(e) => onUpdateBlock(selectedBlockId, { imageUrl: e.target.value } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                      
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mt-3">Object Fit</label>
                      <select 
                        value={(selectedBlock as any).objectFit || "contain"}
                        onChange={(e) => onUpdateBlock(selectedBlockId, { objectFit: e.target.value } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                      >
                        <option value="contain">Contain</option>
                        <option value="cover">Cover</option>
                        <option value="fill">Fill</option>
                      </select>
                    </div>
                  )}

                  {/* Video Block */}
                  {selectedBlock.type === "VideoBlock" && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Video Source (MP4)</label>
                      <input type="text" value={(selectedBlock as any).videoUrl || ""} placeholder="https://..."
                        onChange={(e) => onUpdateBlock(selectedBlockId, { videoUrl: e.target.value } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                    </div>
                  )}

                  {/* Timeline Block */}
                  {selectedBlock.type === "TimelineBlock" && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Timeline Steps</label>
                      <div className="space-y-2">
                        {((selectedBlock as any).steps || []).map((step: any, idx: number) => (
                           <div key={step.id} className="flex gap-2">
                             <div className="flex-1 flex flex-col gap-1">
                               <input type="text" value={step.text} 
                                 onChange={(e) => {
                                   const newSteps = [...((selectedBlock as any).steps || [])];
                                   newSteps[idx].text = e.target.value;
                                   onUpdateBlock(selectedBlockId, { steps: newSteps } as any);
                                 }}
                                 className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                               <input type="text" value={step.subtitle || ""} placeholder="Subtitle (Optional)"
                                 onChange={(e) => {
                                   const newSteps = [...((selectedBlock as any).steps || [])];
                                   newSteps[idx].subtitle = e.target.value;
                                   onUpdateBlock(selectedBlockId, { steps: newSteps } as any);
                                 }}
                                 className="w-full bg-zinc-950 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-zinc-300" />
                             </div>
                             <button onClick={() => {
                               const newSteps = [...((selectedBlock as any).steps || [])];
                               newSteps.splice(idx, 1);
                               onUpdateBlock(selectedBlockId, { steps: newSteps } as any);
                             }} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded border border-transparent hover:border-red-500/30">
                               <Trash2 className="w-3 h-3" />
                             </button>
                           </div>
                        ))}
                        <button onClick={() => {
                          const newSteps = [...((selectedBlock as any).steps || []), { id: `step-${Date.now()}`, text: "New Step" }];
                          onUpdateBlock(selectedBlockId, { steps: newSteps } as any);
                        }} className="w-full p-2 text-xs text-cyan-400 border border-dashed border-cyan-500/50 rounded hover:bg-cyan-500/10 transition-colors">
                          + Add Step
                        </button>
                      </div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mt-3">Marker Type</label>
                      <select 
                        value={(selectedBlock as any).markerType || "bullets"}
                        onChange={(e) => onUpdateBlock(selectedBlockId, { markerType: e.target.value } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100"
                      >
                        <option value="bullets">Bullets</option>
                        <option value="numbers">Numbers</option>
                      </select>
                    </div>
                  )}

                  {/* NestedItemBlock */}
                  {selectedBlock.type === "NestedItemBlock" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Base POS Item</label>
                        <PosItemPicker items={items} value={(selectedBlock as any).basePosItemId} onChange={(id) => onUpdateBlock(selectedBlockId, { basePosItemId: id } as any)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Base Description Override</label>
                        <input type="text" value={(selectedBlock as any).baseDescriptionOverride || ""} placeholder="Custom description..."
                          onChange={(e) => onUpdateBlock(selectedBlockId, { baseDescriptionOverride: e.target.value } as any)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Child Upgrades (Multiselect)</label>
                         <PosItemMultiPicker 
                           items={items} 
                           selectedIds={((selectedBlock as any).upgradeItems || []).map((u: any) => u.posItemId)} 
                           onChange={(ids) => {
                             const current = ((selectedBlock as any).upgradeItems || []) as any[];
                             const newItems = ids.map(id => {
                               const existing = current.find(c => c.posItemId === id);
                               return existing ? existing : { posItemId: id };
                             });
                             onUpdateBlock(selectedBlockId, { upgradeItems: newItems } as any);
                           }} 
                           renderExtra={(item, isSelected) => isSelected ? (
                             <input type="text" placeholder="Upgrade description override..." 
                               value={((selectedBlock as any).upgradeItems || []).find((u: any) => u.posItemId === item.id)?.overrideDescription || ""}
                               onChange={(e) => {
                                 let current = [...((selectedBlock as any).upgradeItems || [])];
                                 const idx = current.findIndex((u: any) => u.posItemId === item.id);
                                 if (idx !== -1) {
                                   current[idx] = { ...current[idx], overrideDescription: e.target.value };
                                   onUpdateBlock(selectedBlockId, { upgradeItems: current } as any);
                                 }
                               }}
                               className="ml-6 mt-1 bg-zinc-950 border border-white/10 rounded px-2 py-1 text-[10px] text-zinc-200" />
                           ) : null}
                         />
                      </div>
                    </div>
                  )}

                  {/* Media Carousel */}
                  {selectedBlock.type === "MediaCarouselBlock" && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Carousel Images</label>
                      <div className="space-y-2">
                        {((selectedBlock as any).slides || []).map((slide: any, idx: number) => (
                           <div key={idx} className="flex gap-2">
                             <input type="text" value={slide.imageUrl || ""} placeholder="https://..."
                               onChange={(e) => {
                                 const newSlides = [...((selectedBlock as any).slides || [])];
                                 newSlides[idx].imageUrl = e.target.value;
                                 onUpdateBlock(selectedBlockId, { slides: newSlides } as any);
                               }}
                               className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                             <button onClick={() => {
                               const newSlides = [...((selectedBlock as any).slides || [])];
                               newSlides.splice(idx, 1);
                               onUpdateBlock(selectedBlockId, { slides: newSlides } as any);
                             }} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded">
                               <Trash2 className="w-3 h-3" />
                             </button>
                           </div>
                        ))}
                        <button onClick={() => {
                          const newSlides = [...((selectedBlock as any).slides || []), { type: "image", imageUrl: "" }];
                          onUpdateBlock(selectedBlockId, { slides: newSlides } as any);
                        }} className="w-full p-2 text-xs text-cyan-400 border border-dashed border-cyan-500/50 rounded hover:bg-cyan-500/10">
                          + Add Image
                        </button>
                      </div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mt-3">Carousel Settings</label>
                      <input type="number" value={(selectedBlock as any).slideDuration || 5000} placeholder="Slide Duration (ms)"
                        onChange={(e) => onUpdateBlock(selectedBlockId, { slideDuration: Number(e.target.value) } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                      <select
                        value={(selectedBlock as any).objectFit || "cover"}
                        onChange={(e) => onUpdateBlock(selectedBlockId, { objectFit: e.target.value } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100"
                      >
                        <option value="cover">Cover (Fill & Crop)</option>
                        <option value="contain">Contain (Show All)</option>
                        <option value="fill">Fill (Stretch)</option>
                      </select>
                    </div>
                  )}

                  {/* CalloutBlock */}
                  {selectedBlock.type === "CalloutBlock" && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Callout Content</label>
                      <input type="text" value={(selectedBlock as any).title || ""} placeholder="Title"
                        onChange={(e) => onUpdateBlock(selectedBlockId, { title: e.target.value } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                      <input type="text" value={(selectedBlock as any).message || ""} placeholder="Message"
                        onChange={(e) => onUpdateBlock(selectedBlockId, { message: e.target.value } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100" />
                      <select
                        value={(selectedBlock as any).iconName || "Info"}
                        onChange={(e) => onUpdateBlock(selectedBlockId, { iconName: e.target.value } as any)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100"
                      >
                        <option value="Info">Info</option>
                        <option value="AlertTriangle">Alert Triangle</option>
                        <option value="CheckCircle">Check Circle</option>
                        <option value="ChefHat">Chef Hat</option>
                        <option value="Star">Star</option>
                        <option value="Flame">Flame</option>
                        <option value="Utensils">Utensils</option>
                      </select>
                      <label className="flex items-center gap-3 cursor-pointer mt-2">
                        <input type="checkbox" checked={(selectedBlock as any).accentBorder || false} onChange={(e) => onUpdateBlock(selectedBlockId, { accentBorder: e.target.checked } as any)} className="w-4 h-4 rounded border-white/10 bg-black text-cyan-500 focus:ring-cyan-500" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Accent Border</span>
                      </label>
                      <div className="pt-2 border-t border-white/5 space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Typography & Colors</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase block mb-1">Text Color</label>
                            <input type="color" value={(selectedBlock as any).textColor || "#ffffff"} onChange={(e) => onUpdateBlock(selectedBlockId, { textColor: e.target.value } as any)} className="w-full h-8 bg-zinc-900 border border-white/10 rounded cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase block mb-1">Font Size</label>
                            <select value={(selectedBlock as any).fontSize || ""} onChange={(e) => onUpdateBlock(selectedBlockId, { fontSize: e.target.value } as any)} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500">
                              <option value="">Default</option>
                              <option value="12px">12px</option>
                              <option value="16px">16px</option>
                              <option value="24px">24px</option>
                              <option value="32px">32px</option>
                              <option value="48px">48px</option>
                              <option value="64px">64px</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase block mb-1">Background Opacity</label>
                          <input type="range" min="0" max="1" step="0.1" value={(selectedBlock as any).backgroundOpacity ?? 1} onChange={(e) => onUpdateBlock(selectedBlockId, { backgroundOpacity: Number(e.target.value) } as any)} className="w-full accent-cyan-500" />
                          <div className="text-[10px] text-zinc-400 text-right">{Math.round(((selectedBlock as any).backgroundOpacity ?? 1) * 100)}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedBlock.type === "MenuListBlock" || selectedBlock.type === "NestedItemBlock") && (
                    <div className="pt-4 border-t border-white/5">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Item Styles</div>
                      <MenuItemStylesInspector 
                        styles={selectedBlock.styles ?? config.menuItemStyles ?? DEFAULT_MENU_ITEM_STYLES} 
                        onChange={handleUpdateBlockStyles} 
                        googleFont={config.googleFont} 
                      />
                    </div>
                  )}
                </div>
              </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-zinc-500">
              Select a block to configure
            </div>
          )
        )}
      </div>
    </div>
  );
};
