"use client";

import React, { useState } from "react";
import { ColumnConfig, PosItem, MenuItemStyles } from "@soustools/api-types";
import { Trash2, Edit } from "lucide-react";
import { ColumnEmptyView } from "./column-empty-view";
import { ColumnContentView } from "./column-content-view";
import { ColumnPopoverEditor } from "./column-popover-editor";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";

interface PreviewColumnEditorProps {
  column: ColumnConfig;
  items: PosItem[];
  onUpdate: (updates: Partial<ColumnConfig>) => void;
  onClear: () => void;
  menuItemStyles?: MenuItemStyles;
  isPreviewing?: boolean;
}

export const PreviewColumnEditor: React.FC<PreviewColumnEditorProps> = ({
  column,
  items,
  onUpdate,
  onClear,
  menuItemStyles,
  isPreviewing = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={`relative group flex flex-col h-full overflow-hidden ${
      isPreviewing
        ? "bg-transparent border-none"
        : "bg-transparent border border-dashed border-white/10 hover:border-white/20 min-h-[200px]"
    }`}>
      <div className={`flex-1 flex flex-col justify-center ${isPreviewing ? "p-0" : "p-3"}`}>
        {column.type === "EMPTY" ? (
          <ColumnEmptyView onUpdate={onUpdate} onOpenEditor={() => setIsEditing(true)} />
        ) : (
          <ColumnContentView column={column} items={items} menuItemStyles={menuItemStyles ?? DEFAULT_MENU_ITEM_STYLES} />
        )}
      </div>

      {column.type !== "EMPTY" && !isEditing && !isPreviewing && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded transition cursor-pointer"
            title="Edit Column"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClear}
            className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded transition cursor-pointer"
            title="Clear Column"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isEditing && (
        <ColumnPopoverEditor
          column={column}
          items={items}
          onUpdate={onUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};
