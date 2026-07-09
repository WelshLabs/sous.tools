"use client";

import { X, History } from "lucide-react";
import { type VersionRow } from "./types";

/**
 * Props for the VersionHistoryDrawer component.
 */
export interface VersionHistoryDrawerProps {
  /** Whether the drawer is open. */
  isOpen: boolean;
  /** Called when the drawer should close. */
  onClose: () => void;
  /** List of versions for the current recipe. */
  versions: VersionRow[];
  /** Whether the versions are currently loading. */
  loading?: boolean;
  /**
   * Called when a version is selected to be restored.
   * The app layer handles the actual API request.
   */
  onRestore: (version: VersionRow) => void;
}

/**
 * VersionHistoryDrawer — a slide-out drawer displaying past snapshots of a recipe.
 *
 * Positioned fixed right. Uses the Neon-Glass `--color-card` surface and
 * semantic borders.
 *
 * **Data boundary**: All fetching is pushed up to the app layer. Pass `versions`,
 * `loading`, and `onRestore`.
 *
 * @tenant-docs-export
 * # VersionHistoryDrawer
 * ```tsx
 * import { VersionHistoryDrawer } from "@soustools/domain-recipes";
 *
 * <VersionHistoryDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   versions={versions}
 *   loading={loading}
 *   onRestore={handleRestore}
 * />
 * ```
 */
export function VersionHistoryDrawer({
  isOpen,
  onClose,
  versions,
  loading = false,
  onRestore,
}: VersionHistoryDrawerProps) {
  return (
    <div
      className={`fixed inset-y-0 right-0 w-80 shadow-2xl z-50 p-4 transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{
        backgroundColor: "rgb(15 23 42 / 0.95)",
        borderLeft: "1px solid var(--color-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-sm">Version History</h3>
        </div>
        <button
          onClick={onClose}
          className="transition-colors cursor-pointer"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 space-y-3 overflow-y-auto h-[calc(100vh-80px)]">
        {loading ? (
          <div
            className="text-center text-xs py-8 animate-pulse"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Loading history...
          </div>
        ) : versions.length === 0 ? (
          <div
            className="text-center text-xs py-8"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            No saved versions yet. Use "Save Version" to snapshot.
          </div>
        ) : (
          versions.map((ver) => (
            <div
              key={ver.id}
              className="rounded-lg p-3 space-y-2"
              style={{
                backgroundColor: "rgb(30 41 59 / 0.5)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">
                  v{ver.versionNumber}
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {new Date(ver.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h4
                  className="text-xs font-semibold truncate"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {ver.title}
                </h4>
                <p
                  className="text-[10px]"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Yield: {ver.yieldCount} {ver.yieldUnit}
                </p>
              </div>
              <button
                onClick={() => onRestore(ver)}
                className="w-full text-center text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 py-1.5 rounded transition font-semibold cursor-pointer"
              >
                Restore Snapshot
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
