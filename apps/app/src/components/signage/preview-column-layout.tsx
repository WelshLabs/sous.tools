"use client";

import React from "react";
import { ColumnLayoutSlide, PosItem, SignageSlide } from "@soustools/api-types";
import { PreviewColumnEditor } from "./preview-column-editor";

interface PreviewColumnLayoutProps {
  activeSlide: ColumnLayoutSlide;
  items: PosItem[];
  activeSlideIndex: number;
  onUpdateSlide: (index: number, updates: Partial<SignageSlide>) => void;
}

export const PreviewColumnLayout: React.FC<PreviewColumnLayoutProps> = ({
  activeSlide,
  items,
  activeSlideIndex,
  onUpdateSlide,
}) => {
  const columns = activeSlide.columns || [];

  return (
    <div className="flex flex-col h-full w-full p-2 bg-[oklch(0.08_0.01_260)] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between mb-1 border-b border-white/5">
        <span className="text-[9px] font-bold text-slate-400">COLUMN LAYOUT</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-slate-400">Columns:</span>
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => {
                let newCols = [...columns];
                if (newCols.length < num) {
                  while (newCols.length < num) newCols.push({ type: "EMPTY" });
                } else {
                  newCols = newCols.slice(0, num);
                }
                onUpdateSlide(activeSlideIndex, { columns: newCols });
              }}
              className={`px-1 py-0.2 text-[9px] rounded font-bold transition ${
                columns.length === num
                  ? "bg-primary text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
      <div
        className="grid gap-1.5 h-full items-stretch"
        style={{
          gridTemplateColumns: `repeat(${columns.length || 1}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((col, idx) => (
          <PreviewColumnEditor
            key={idx}
            column={col}
            items={items}
            onUpdate={(updates) => {
              const newCols = [...columns];
              newCols[idx] = { ...newCols[idx], ...updates };
              onUpdateSlide(activeSlideIndex, { columns: newCols });
            }}
            onClear={() => {
              const newCols = [...columns];
              newCols[idx] = { type: "EMPTY" };
              onUpdateSlide(activeSlideIndex, { columns: newCols });
            }}
          />
        ))}
      </div>
    </div>
  );
};
