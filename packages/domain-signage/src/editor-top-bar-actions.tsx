"use client";

import { RefreshCw, Check, Save, Palette, Eye, RefreshCcw } from "lucide-react";

type SaveState = "idle" | "saving" | "saved";

interface EditorTopBarActionsProps {
  saving: boolean;
  saveState: SaveState;
  isPreviewing: boolean;
  isStylesOpen: boolean;
  isDraft?: boolean;
  onSave: () => void;
  onTogglePreview: () => void;
  onToggleStyles: () => void;
  onDiscard?: () => void;
}

/** Molecule: Right-side action buttons for the signage editor top bar (draft/discard/styles/preview/save). */
export function EditorTopBarActions({
  saving,
  saveState,
  isPreviewing,
  isStylesOpen,
  isDraft,
  onSave,
  onTogglePreview,
  onToggleStyles,
  onDiscard,
}: EditorTopBarActionsProps) {
  const SaveIcon =
    saveState === "saving" ? (
      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
    ) : saveState === "saved" ? (
      <Check className="w-3.5 h-3.5 text-green-400" />
    ) : (
      <Save className="w-3.5 h-3.5" />
    );

  return (
    <div className="flex items-center gap-1.5">
      {isDraft && (
        <>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/25 rounded-md">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Draft</span>
          </div>
          {onDiscard && (
            <button
              onClick={onDiscard}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground bg-transparent border border-border hover:border-white/20 rounded-md cursor-pointer transition-colors"
              title="Discard unsaved changes"
            >
              <RefreshCcw className="w-3 h-3" /> Discard
            </button>
          )}
        </>
      )}
      <button
        id="editor-top-bar-styles"
        onClick={onToggleStyles}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border transition-colors ${
          isStylesOpen
            ? "bg-background/10 dark:bg-background/10 border-white/20 text-foreground"
            : "bg-transparent border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Palette className="w-3.5 h-3.5" /> Slide Workspace
      </button>
      <button
        id="editor-top-bar-preview"
        onClick={onTogglePreview}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border transition-colors ${
          isPreviewing
            ? "bg-background/10 dark:bg-background/10 border-white/20 text-foreground"
            : "bg-transparent border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        <Eye className="w-3.5 h-3.5" /> Preview
      </button>
      <button
        id="editor-top-bar-save"
        onClick={onSave}
        disabled={saving}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border transition-all disabled:opacity-60 ${
          saveState === "saved"
            ? "border-green-500/40 bg-green-500/10 text-green-400"
            : "border-border bg-card hover:bg-secondary text-muted-foreground"
        }`}
      >
        {SaveIcon}{" "}
        {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save"}
      </button>
    </div>
  );
}
