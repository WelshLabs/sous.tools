"use client";

import React, { useState, useCallback } from "react";
import { ColumnConfig } from "@soustools/api-types";
import { Menu, Image as ImageIcon, Type } from "lucide-react";

interface ColumnEmptyViewProps {
  onUpdate: (updates: Partial<ColumnConfig>) => void;
  /** Called after the 300ms flash to auto-open the popover editor */
  onOpenEditor?: () => void;
}

type AddAction = () => Partial<ColumnConfig>;

const ACTIONS: { label: string; icon: React.ReactNode; color: string; action: AddAction }[] = [
  {
    label: "Add Menu",
    icon: <Menu className="w-3 h-3" />,
    color: "bg-blue-600 hover:bg-blue-500",
    action: () => ({ type: "MENU", itemIds: [], highlightItems: [] }),
  },
  {
    label: "Add Image",
    icon: <ImageIcon className="w-3 h-3" />,
    color: "bg-purple-600 hover:bg-purple-500",
    action: () => ({ type: "IMAGE", imageUrl: "", fit: "cover" }),
  },
  {
    label: "Add Text",
    icon: <Type className="w-3 h-3" />,
    color: "bg-emerald-600 hover:bg-emerald-500",
    action: () => ({ type: "TEXT", title: "Specials", content: "Description" }),
  },
];

/**
 * ColumnEmptyView renders type-picker buttons for an empty column zone.
 * After selection, briefly flashes green then auto-opens the popover editor.
 */
export const ColumnEmptyView: React.FC<ColumnEmptyViewProps> = ({ onUpdate, onOpenEditor }) => {
  const [isFlashing, setIsFlashing] = useState(false);

  const handleSelect = useCallback((updates: Partial<ColumnConfig>) => {
    onUpdate(updates);
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      onOpenEditor?.();
    }, 300);
  }, [onUpdate, onOpenEditor]);

  return (
    <div className={`flex flex-col gap-2 items-center text-center rounded-lg transition-all duration-150 ${isFlashing ? "ring-2 ring-green-400 ring-offset-1 ring-offset-slate-950" : ""}`}>
      <span className="text-[10px] text-slate-500 font-mono">Empty Column</span>
      <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
        {ACTIONS.map(({ label, icon, color, action }) => (
          <button
            key={label}
            onClick={() => handleSelect(action())}
            className={`flex items-center justify-center gap-1 px-2 py-1 text-[10px] ${color} text-white rounded font-medium transition cursor-pointer`}
          >
            {icon} {label}
          </button>
        ))}
      </div>
    </div>
  );
};
