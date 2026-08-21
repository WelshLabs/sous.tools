/* eslint-disable max-lines */
"use client";

import { useState } from "react";
import {
  type SignageBlock,
  type PosItem,
  type MediaSlide,
} from "@soustools/api-types";
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Utensils,
} from "lucide-react";
import { PosItemPicker } from "../pos-item-picker";

export function MediaCarouselBlockConfig({
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
  items = [],
}: {
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: any) => void;
  items?: PosItem[];
}) {
  const [activeTab, setActiveTab] = useState<"slides" | "settings">("slides");

  if (selectedBlock.type !== "MediaCarouselBlock") return null;

  const slides: MediaSlide[] = (selectedBlock as any).slides || [];

  const handleUpdateSlide = (idx: number, updates: Partial<MediaSlide>) => {
    const newSlides = [...slides];
    newSlides[idx] = { ...newSlides[idx], ...updates };
    onUpdateBlock(selectedBlockId, { slides: newSlides });
  };

  const handleDeleteSlide = (idx: number) => {
    const newSlides = [...slides];
    newSlides.splice(idx, 1);
    onUpdateBlock(selectedBlockId, { slides: newSlides });
  };

  const handleMoveSlide = (idx: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= newSlides.length) return;
    const temp = newSlides[idx];
    newSlides[idx] = newSlides[target];
    newSlides[target] = temp;
    onUpdateBlock(selectedBlockId, { slides: newSlides });
  };

  const handleAddCustomSlide = () => {
    const newSlides: MediaSlide[] = [
      ...slides,
      {
        id: `slide-${Date.now()}`,
        imageUrl: "",
        captionTitle: "Featured Dish",
        captionSubtitle: "Crafted fresh daily with locally sourced ingredients",
        captionPrice: "$18.00",
        badge: "Special",
        layout: "overlay-card",
      },
    ];
    onUpdateBlock(selectedBlockId, { slides: newSlides });
  };

  const handleAddPosItemSlide = (itemId: string) => {
    const item = items.find((i) => i.id === itemId || i.externalId === itemId);
    if (!item) return;
    const newSlides: MediaSlide[] = [
      ...slides,
      {
        id: `slide-${Date.now()}`,
        posItemId: item.id,
        imageUrl:
          item.imageUrl ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80",
        captionTitle: item.name,
        captionSubtitle: item.description || "",
        captionPrice: `$${Number(item.price).toFixed(2)}`,
        badge: "Featured",
        layout: "overlay-card",
      },
    ];
    onUpdateBlock(selectedBlockId, { slides: newSlides });
  };

  return (
    <div className="space-y-4">
      <div className="border-border flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab("slides")}
          className={`flex-1 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors ${
            activeTab === "slides"
              ? "border-b-2 border-cyan-400 text-cyan-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Slides ({slides.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors ${
            activeTab === "settings"
              ? "border-b-2 border-cyan-400 text-cyan-400"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Settings
        </button>
      </div>

      {activeTab === "slides" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="bg-card/70 border-border space-y-2.5 rounded-xl border p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-cyan-950/80 font-mono text-[9px] font-bold text-cyan-400">
                      {idx + 1}
                    </span>
                    <span className="text-foreground max-w-[150px] truncate text-xs font-semibold">
                      {slide.captionTitle || "Untitled Slide"}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, "up")}
                      className="text-muted-foreground rounded p-1 hover:text-cyan-400 disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === slides.length - 1}
                      onClick={() => handleMoveSlide(idx, "down")}
                      className="text-muted-foreground rounded p-1 hover:text-cyan-400 disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(idx)}
                      className="ml-1 rounded p-1 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                      Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={slide.imageUrl || ""}
                      onChange={(e) =>
                        handleUpdateSlide(idx, { imageUrl: e.target.value })
                      }
                      className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                        Title
                      </label>
                      <input
                        type="text"
                        placeholder="Slide Title"
                        value={slide.captionTitle || ""}
                        onChange={(e) =>
                          handleUpdateSlide(idx, {
                            captionTitle: e.target.value,
                          })
                        }
                        className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                        Price
                      </label>
                      <input
                        type="text"
                        placeholder="$18.00"
                        value={slide.captionPrice || ""}
                        onChange={(e) =>
                          handleUpdateSlide(idx, {
                            captionPrice: e.target.value,
                          })
                        }
                        className="bg-background border-border w-full rounded border px-2 py-1 font-mono text-xs text-cyan-400 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                        Badge / Label
                      </label>
                      <input
                        type="text"
                        placeholder="Special / Featured"
                        value={slide.badge || ""}
                        onChange={(e) =>
                          handleUpdateSlide(idx, { badge: e.target.value })
                        }
                        className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                        Layout Format
                      </label>
                      <select
                        value={slide.layout || "overlay-card"}
                        onChange={(e) =>
                          handleUpdateSlide(idx, {
                            layout: e.target.value as any,
                          })
                        }
                        className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="overlay-card">
                          Floating Glass Card
                        </option>
                        <option value="bottom-bar">Bottom Glass Banner</option>
                        <option value="split">Split Side-by-Side</option>
                        <option value="minimal">Minimal Overlaid</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                      Description / Subtitle
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Dish description, ingredients, details..."
                      value={slide.captionSubtitle || slide.description || ""}
                      onChange={(e) =>
                        handleUpdateSlide(idx, {
                          captionSubtitle: e.target.value,
                          description: e.target.value,
                        })
                      }
                      className="bg-background border-border text-foreground w-full resize-none rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-border space-y-2 border-t pt-3">
            <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
              Add Slides
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleAddCustomSlide}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-cyan-500/50 p-2 text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/10"
              >
                <ImageIcon className="h-4 w-4" /> + Add Custom Image Slide
              </button>

              <div className="space-y-1 pt-1">
                <label className="text-muted-foreground flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase">
                  <Utensils className="h-3 w-3" /> Quick Add Slide From POS Item
                </label>
                <PosItemPicker
                  items={items}
                  value={undefined}
                  onChange={handleAddPosItemSlide}
                  placeholder="Select menu item to add as slide..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-wider uppercase">
              Slide Duration (ms)
            </label>
            <input
              type="number"
              min={1000}
              step={500}
              value={(selectedBlock as any).slideDuration || 5000}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, {
                  slideDuration: Number(e.target.value),
                })
              }
              className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-wider uppercase">
              Image Fit
            </label>
            <select
              value={(selectedBlock as any).objectFit || "cover"}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, { objectFit: e.target.value })
              }
              className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
            >
              <option value="cover">Cover (Fill & Crop)</option>
              <option value="contain">Contain (Show Entire Image)</option>
              <option value="fill">Fill (Stretch)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
