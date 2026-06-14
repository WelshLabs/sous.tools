"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { CssHelper } from "./css-helper";

interface CssEditorModalProps {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}

/**
 * CssEditorModal renders the CssHelper in a spacious full-overlay modal
 * so editors have plenty of room to write custom CSS.
 */
export const CssEditorModal: React.FC<CssEditorModalProps> = ({ value, onChange, onClose }) => {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col"
        style={{ height: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Custom CSS Editor</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Styles are scoped to the signage canvas. Press ESC or click outside to close.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition cursor-pointer"
            aria-label="Close CSS editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editor body — CssHelper fills remaining height */}
        <div className="flex-1 p-4 overflow-hidden">
          <CssHelper value={value} onChange={onChange} />
        </div>
      </div>
    </div>
  );
};
