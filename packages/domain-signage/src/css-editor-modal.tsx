"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { CssReferencePanel } from "./css-reference-panel";

interface CssEditorModalProps {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}

/**
 * CssEditorModal renders a two-pane CSS editor modal.
 * Left: textarea editor. Right: collapsible class dictionary + presets.
 */
export const CssEditorModal: React.FC<CssEditorModalProps> = ({
  value,
  onChange,
  onClose,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const insertText = useCallback(
    (text: string) => {
      const ta = textareaRef.current;
      if (!ta) {
        onChange(value + "\n" + text);
        return;
      }
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.substring(0, start) + text + value.substring(end);
      onChange(next);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    },
    [value, onChange],
  );

  return (
    <div
      className="bg-background/70 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border-border relative mx-4 flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ height: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="text-foreground text-sm font-semibold">
              Custom CSS Editor
            </h2>
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              Styles inject into the signage canvas. Press ESC or click outside
              to close.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer rounded-lg p-1.5 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Two-pane body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Editor */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="bg-background flex shrink-0 items-center justify-between border-b border-zinc-900 px-4 py-2">
              <span className="text-muted-foreground text-xs font-semibold">
                CSS Editor
              </span>
              <span className="text-muted-foreground text-[10px]">
                Auto-injects on save
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/* Write custom CSS here */"
              className="bg-background text-foreground flex-1 resize-none p-4 font-mono text-xs focus:outline-none"
            />
          </div>

          {/* Right: Collapsible Reference */}
          <CssReferencePanel onInsertText={insertText} />
        </div>
      </div>
    </div>
  );
};
