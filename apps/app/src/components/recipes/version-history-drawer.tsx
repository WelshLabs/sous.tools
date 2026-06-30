"use client";

import React, { useState, useEffect } from "react";
import { X, History } from "lucide-react";

interface VersionHistoryDrawerProps {
  recipeId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface VersionRow {
  id: string;
  versionNumber: number;
  title: string;
  yieldCount: number;
  yieldUnit: string;
  createdAt: string;
}

export function VersionHistoryDrawer({ recipeId, isOpen, onClose }: VersionHistoryDrawerProps) {
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/recipes/${recipeId}/versions`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setVersions(json.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [recipeId, isOpen]);

  const handleRestore = (ver: VersionRow) => {
    if (confirm(`Restore version ${ver.versionNumber}? This will not overwrite your current recipe — it creates a new version.`)) {
      alert("Restore coming soon");
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-80 bg-zinc-100 dark:bg-zinc-900 border-l border-black/5 dark:border-white/5 shadow-2xl glass-panel z-50 p-4 transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2 text-white">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-sm">Version History</h3>
        </div>
        <button onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 space-y-3 overflow-y-auto h-[calc(100vh-80px)]">
        {loading ? (
          <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 py-8 animate-pulse">Loading history...</div>
        ) : versions.length === 0 ? (
          <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 py-8">
            No saved versions yet. Use "Save Version" to snapshot.
          </div>
        ) : (
          versions.map((ver) => (
            <div
              key={ver.id}
              className="bg-zinc-850 border border-black/5 dark:border-white/5 rounded-lg p-3 text-zinc-700 dark:text-zinc-300 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">
                  v{ver.versionNumber}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {new Date(ver.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white truncate">{ver.title}</h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Yield: {ver.yieldCount} {ver.yieldUnit}
                </p>
              </div>
              <button
                onClick={() => handleRestore(ver)}
                className="w-full text-center text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 py-1.5 rounded transition font-semibold"
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
