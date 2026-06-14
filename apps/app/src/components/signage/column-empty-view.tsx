"use client";

import React from "react";
import { ColumnConfig } from "@soustools/api-types";
import { Menu, Image as ImageIcon, Type } from "lucide-react";

interface ColumnEmptyViewProps {
  onUpdate: (updates: Partial<ColumnConfig>) => void;
}

export const ColumnEmptyView: React.FC<ColumnEmptyViewProps> = ({ onUpdate }) => (
  <div className="flex flex-col gap-2 items-center text-center">
    <span className="text-[10px] text-slate-500 font-mono">Empty Column</span>
    <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
      <button
        onClick={() => onUpdate({ type: "MENU", itemIds: [], highlightItems: [] })}
        className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition cursor-pointer"
      >
        <Menu className="w-3 h-3" /> Add Menu
      </button>
      <button
        onClick={() => onUpdate({ type: "IMAGE", imageUrl: "", fit: "cover" })}
        className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] bg-purple-600 hover:bg-purple-500 text-white rounded font-medium transition cursor-pointer"
      >
        <ImageIcon className="w-3 h-3" /> Add Image
      </button>
      <button
        onClick={() => onUpdate({ type: "TEXT", title: "Specials", content: "Description" })}
        className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition cursor-pointer"
      >
        <Type className="w-3 h-3" /> Add Text
      </button>
    </div>
  </div>
);
