"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Copy, Trash2, Check, ExternalLink, Eye } from "lucide-react";

interface DeckCardProps {
  deck: any; // using any temporarily to avoid strict type mismatch with database snake_case keys
  onDelete: (id: string) => void;
  onRename: (id: string, name: string, slug: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onDelete,
  onRename,
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(deck.name);
  const [slug, setSlug] = useState(deck.slug);
  const [copied, setCopied] = useState(false);

  const handleSaveRename = () => {
    setIsEditing(false);
    if (name.trim() !== deck.name || slug.trim() !== deck.slug) {
      onRename(deck.id, name.trim(), slug.trim());
    }
  };

  const getLiveUrl = (s: string) => {
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "localhost"
    ) {
      return `http://localhost:5003/s/dtown-cafe/${s}`;
    }
    return `${window.location.origin}/s/dtown-cafe/${s}`;
  };

  const handleCopyUrl = async () => {
    const url = getLiveUrl(deck.slug);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slideCount = deck.config?.slides?.length || 0;

  return (
    <div className="flex flex-col bg-card/60 backdrop-blur border border-black/10 dark:border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300">
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2 mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
              className="w-full px-2 py-1 text-sm bg-zinc-50 dark:bg-zinc-950 border border-white/15 rounded text-white focus:outline-none focus:border-primary"
              placeholder="Deck Name"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500 font-mono">/s/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                className="flex-1 px-2 py-0.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-white/15 rounded text-slate-300 font-mono focus:outline-none focus:border-primary"
                placeholder="slug"
              />
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <div className="flex items-center gap-2 group">
              <h3 className="text-base font-bold text-white truncate max-w-[200px]">
                {deck.name}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 dark:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono truncate mt-1">
              /s/{deck.slug}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-slate-300 font-medium">
            {slideCount} {slideCount === 1 ? "slide" : "slides"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-black/5 dark:border-white/5 pt-4">
        <button
          onClick={() => router.push(`/signage/${deck.id}`)}
          className="flex-1 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors cursor-pointer text-center"
        >
          Edit
        </button>
        <Link
          href={`/signage/${deck.id}/preview`}
          className="p-2 border border-black/10 dark:border-white/10 hover:border-primary/40 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Preview Deck"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <a
          href={getLiveUrl(deck.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 border border-black/10 dark:border-white/10 hover:border-white/25 hover:bg-black/5 dark:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Open Live View in New Tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={handleCopyUrl}
          className="p-2 border border-black/10 dark:border-white/10 hover:border-white/25 hover:bg-black/5 dark:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
          title="Copy Deck URL"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => onDelete(deck.id)}
          className="p-2 border border-black/10 dark:border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-all cursor-pointer"
          title="Delete Deck"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
