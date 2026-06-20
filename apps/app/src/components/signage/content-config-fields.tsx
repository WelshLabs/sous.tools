"use client";

import React, { useState } from "react";
import { SignageBlock, PosItem } from "@soustools/api-types";
import { Search } from "lucide-react";

interface ContentConfigFieldsProps {
  block: SignageBlock;
  items: PosItem[];
  onChange: (updates: Partial<SignageBlock>) => void;
}

export function ContentConfigFields({
  block,
  items,
  onChange,
}: ContentConfigFieldsProps): React.JSX.Element {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.externalId?.toLowerCase().includes(search.toLowerCase())
  );

  const renderPosItemBinding = () => {
    const activeId = (block as any).posItemId || (block as any).basePosItemId || "";
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-300 block">POS Item Selection</label>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-cyan-500 text-zinc-100"
          />
        </div>
        <div className="max-h-40 overflow-y-auto border border-white/5 rounded-xl bg-zinc-950 p-2 space-y-1">
          {filteredItems.slice(0, 15).map((item) => (
            <button
              key={item.id}
              onClick={() => onChange({ [block.type === "PosItemBlock" ? "posItemId" : "basePosItemId"]: item.id } as any)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                activeId === item.id ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-zinc-400 hover:bg-white/5 border border-transparent"
              }`}
            >
              {item.name} (${Number(item.price).toFixed(2)})
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderKenBurnsParams = () => {
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-300 block">Ken Burns Settings</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Zoom Speed (s)</label>
            <input
              type="number"
              min={1}
              max={60}
              placeholder="10"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
              onChange={(e) => onChange({ carouselSettings: { ...((block as any).carouselSettings || {}), speed: Number(e.target.value) } } as any)}
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Max Zoom Scale</label>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="2.0"
              placeholder="1.2"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
              onChange={(e) => onChange({ carouselSettings: { ...((block as any).carouselSettings || {}), maxScale: Number(e.target.value) } } as any)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderOosModifiers = () => {
    const oosBehavior = (block as any).oosBehavior || "GrayOut";
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-300 block">Out-of-Stock Modifier Behavior</label>
        <div className="grid grid-cols-3 gap-2">
          {["Hide", "GrayOut", "Badge"].map((mode) => (
            <button
              key={mode}
              onClick={() => onChange({ oosBehavior: mode } as any)}
              className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition border ${
                oosBehavior === mode
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/20"
              }`}
            >
              {mode === "GrayOut" ? "Gray Out" : mode}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 py-2">
      {(block.type === "PosItemBlock" || block.type === "NestedItemBlock") && renderPosItemBinding()}
      {block.type === "MediaCarouselBlock" && renderKenBurnsParams()}
      {(block.type === "PosItemBlock" || block.type === "NestedItemBlock" || block.type === "ExplodedItemBlock") && renderOosModifiers()}
    </div>
  );
}
