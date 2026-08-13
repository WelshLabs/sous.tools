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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col bg-background border border-border rounded-2xl shadow-2xl mx-4 w-full max-w-6xl overflow-hidden"
        style={{ height: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Custom CSS Editor
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Styles inject into the signage canvas. Press ESC or click outside
              to close.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-pane body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Editor */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between bg-background px-4 py-2 border-b border-zinc-900 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground">
                CSS Editor
              </span>
              <span className="text-[10px] text-muted-foreground">
                Auto-injects on save
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/* Write custom CSS here */"
              className="flex-1 p-4 bg-background text-foreground font-mono text-xs resize-none focus:outline-none"
            />
          </div>

          {/* Right: Collapsible Reference */}
          <CssReferencePanel onInsertText={insertText} />
        </div>
      </div>
    </div>
  );
};
