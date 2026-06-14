"use client";

import React, { useState } from "react";
import { ColumnConfig, PosItem } from "@soustools/api-types";
import { Trash2, Edit } from "lucide-react";
import { ColumnEmptyView } from "./column-empty-view";
import { ColumnContentView } from "./column-content-view";
import { ColumnPopoverEditor } from "./column-popover-editor";

interface PreviewColumnEditorProps {
  column: ColumnConfig;
  items: PosItem[];
  onUpdate: (updates: Partial<ColumnConfig>) => void;
  onClear: () => void;
}

export const PreviewColumnEditor: React.FC<PreviewColumnEditorProps> = ({
  column,
  items,
  onUpdate,
  onClear,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative group flex flex-col h-full bg-slate-950/40 rounded-lg border border-slate-800/80 overflow-hidden min-h-[200px]">
      <div className="flex-1 p-3 flex flex-col justify-center">
        {column.type === "EMPTY" ? (
          <ColumnEmptyView onUpdate={onUpdate} />
        ) : (
          <ColumnContentView column={column} items={items} />
        )}
      </div>

      {column.type !== "EMPTY" && !isEditing && (
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
