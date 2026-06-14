"use client";

import React, { useState } from "react";
import { ColumnLayoutSlide, ColumnConfig } from "@soustools/api-types";
import { X } from "lucide-react";
import { FullScreenIcon, ColumnsIcon, SplitIcon } from "./layout-icons";

export interface LayoutPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (slide: ColumnLayoutSlide) => void;
}

type SplitRatio = "50/50" | "60/40" | "40/60";

const emptyCol = (): ColumnConfig => ({ type: "EMPTY" });

const buildFullScreen = (): ColumnLayoutSlide => ({
  id: `slide-${Date.now()}`, type: "COLUMN_LAYOUT", durationSeconds: 10,
  columns: [emptyCol()],
});
const buildColumns = (count: number): ColumnLayoutSlide => ({
  id: `slide-${Date.now()}`, type: "COLUMN_LAYOUT", durationSeconds: 10,
  columns: Array.from({ length: count }, emptyCol),
});
const buildSplit = (ratio: SplitRatio): ColumnLayoutSlide => ({
  id: `slide-${Date.now()}`, type: "COLUMN_LAYOUT", durationSeconds: 10,
  splitRatio: ratio, columns: [emptyCol(), emptyCol()],
});

const cardCls = "flex flex-col items-center gap-3 p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 cursor-pointer transition-all duration-200";
const subBtnCls = (active: boolean) =>
  `px-2.5 py-1 rounded text-xs font-bold border transition-all cursor-pointer ${
    active ? "bg-primary text-white border-primary"
           : "bg-transparent border-white/15 text-slate-400 hover:border-white/30 hover:text-white"
  }`;

export const LayoutPickerModal: React.FC<LayoutPickerModalProps> = ({ open, onClose, onSelect }) => {
  const [colCount, setColCount] = useState<number>(2);
  const [splitRatio, setSplitRatio] = useState<SplitRatio>("60/40");

  const pick = (slide: ColumnLayoutSlide) => { onSelect(slide); onClose(); };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl mx-4 bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-200 ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button id="layout-picker-close" onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-bold text-white mb-5">Choose a Layout</h2>

        <div className="grid grid-cols-3 gap-3">
          {/* Full Screen */}
          <div id="layout-pick-fullscreen" className={cardCls} onClick={() => pick(buildFullScreen())}>
            <FullScreenIcon />
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Full Screen</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">One zone filling the whole screen</p>
            </div>
          </div>

          {/* Columns */}
          <div id="layout-pick-columns" className={cardCls} onClick={() => pick(buildColumns(colCount))}>
            <ColumnsIcon count={colCount} />
            <p className="text-sm font-semibold text-white">Columns</p>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {([2, 3, 4] as const).map((n) => (
                <button key={n} className={subBtnCls(colCount === n)} onClick={() => setColCount(n)}>{n}</button>
              ))}
            </div>
          </div>

          {/* Split */}
          <div id="layout-pick-split" className={cardCls} onClick={() => pick(buildSplit(splitRatio))}>
            <SplitIcon ratio={splitRatio} />
            <p className="text-sm font-semibold text-white">Split</p>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {(["50/50", "60/40", "40/60"] as const).map((r) => (
                <button key={r} className={subBtnCls(splitRatio === r)} onClick={() => setSplitRatio(r)}>{r}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutPickerModal;
