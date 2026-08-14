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
      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
    ) : saveState === "saved" ? (
      <Check className="h-3.5 w-3.5 text-green-400" />
    ) : (
      <Save className="h-3.5 w-3.5" />
    );

  return (
    <div className="flex items-center gap-1.5">
      {isDraft && (
        <>
          <div className="flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
              Draft
            </span>
          </div>
          {onDiscard && (
            <button
              onClick={onDiscard}
              className="text-muted-foreground hover:text-foreground border-border flex cursor-pointer items-center gap-1 rounded-md border bg-transparent px-2.5 py-1 text-xs font-semibold transition-colors hover:border-white/20"
              title="Discard unsaved changes"
            >
              <RefreshCcw className="h-3 w-3" /> Discard
            </button>
          )}
        </>
      )}
      <button
        id="editor-top-bar-styles"
        onClick={onToggleStyles}
        className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
          isStylesOpen
            ? "bg-background/10 dark:bg-background/10 text-foreground border-white/20"
            : "border-border text-muted-foreground hover:text-foreground bg-transparent"
        }`}
      >
        <Palette className="h-3.5 w-3.5" /> Slide Workspace
      </button>
      <button
        id="editor-top-bar-preview"
        onClick={onTogglePreview}
        className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
          isPreviewing
            ? "bg-background/10 dark:bg-background/10 text-foreground border-white/20"
            : "border-border text-muted-foreground hover:text-foreground bg-transparent"
        }`}
      >
        <Eye className="h-3.5 w-3.5" /> Preview
      </button>
      <button
        id="editor-top-bar-save"
        onClick={onSave}
        disabled={saving}
        className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-60 ${
          saveState === "saved"
            ? "border-green-500/40 bg-green-500/10 text-green-400"
            : "border-border bg-card hover:bg-secondary text-muted-foreground"
        }`}
      >
        {SaveIcon}{" "}
        {saveState === "saving"
          ? "Saving…"
          : saveState === "saved"
            ? "Saved"
            : "Save"}
      </button>
    </div>
  );
}
