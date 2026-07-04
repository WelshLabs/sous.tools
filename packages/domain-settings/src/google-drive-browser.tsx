"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Search,
  X,
  Folder,
  FileText,
  CheckCircle,
} from "lucide-react";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export interface GoogleDriveBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: "RECIPE" | "INVOICE" | "ORDER";
  onSearch: (query: string, folderId?: string) => Promise<DriveFile[]>;
  onImport: (fileIds: string[], documentType: string) => Promise<void>;
}

export function GoogleDriveBrowser({
  isOpen,
  onClose,
  documentType = "RECIPE",
  onSearch,
  onImport,
}: GoogleDriveBrowserProps) {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentFolder, setCurrentFolder] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setCurrentFolder(null);
      handleSearch("", "");
    }
  }, [isOpen]);

  const handleSearch = async (q: string, folderId?: string) => {
    setLoading(true);
    try {
      const activeFolder = folderId !== undefined ? folderId : currentFolder?.id;
      const data = await onSearch(q, activeFolder);
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    setLoading(true);
    try {
      await onImport(Array.from(selectedIds), documentType.toLowerCase());
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/50 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Import from Google Drive
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-black/5 dark:border-white/5 bg-card/50">
          {currentFolder && (
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <button
                onClick={() => {
                  setCurrentFolder(null);
                  handleSearch(query, "");
                }}
                className="text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors cursor-pointer"
              >
                Root
              </button>
              <span className="text-zinc-400 dark:text-zinc-500">/</span>
              <span className="text-zinc-900 dark:text-zinc-100">
                {currentFolder.name}
              </span>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400 dark:text-zinc-500" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm">
              No files found.
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((f) => {
                const isSelected = selectedIds.has(f.id);
                const isFolder =
                  f.mimeType === "application/vnd.google-apps.folder";
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleSelect(f.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-sky-500/10 border border-sky-500/30"
                        : "hover:bg-black/5 dark:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="text-sky-500 dark:text-sky-400">
                      {isFolder ? (
                        <Folder className="w-5 h-5 fill-current opacity-80" />
                      ) : (
                        <FileText className="w-5 h-5 opacity-80" />
                      )}
                    </div>
                    <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 truncate">
                      {f.name}
                    </span>
                    {isFolder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentFolder({ id: f.id, name: f.name });
                          setQuery("");
                          handleSearch("", f.id);
                        }}
                        className="px-3 py-1 text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        Open
                      </button>
                    )}
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center bg-card/80 rounded-b-2xl">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {selectedIds.size} file(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedIds.size === 0 || loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Import Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
