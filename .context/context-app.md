This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: **/*
- Files matching these patterns are excluded: **/node_modules/**, **/dist/**, **/.next/**, **/out/**, **/build/**, package-lock.json, yarn.lock, pnpm-lock.yaml, **/.git/**, **/*.png, **/*.jpg, **/*.jpeg, **/*.svg, **/*.ico, **/*.test.tsx
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
app/
  (dashboard)/
    @modal/
      (.)ingestion/
        review/
          [id]/
            page.tsx
      signage/
        [deckId]/
          preview/
            page.tsx
          page.tsx
      default.tsx
    catalog/
      page.tsx
    dashboard/
      page.tsx
    devices/
      devices-client-wrapper.tsx
      page.tsx
    ingestion/
      review/
        [id]/
          page.tsx
          visual-builder.tsx
      page.tsx
    inventory/
      items-ledger/
        items-ledger-client.tsx
        page.tsx
      orders/
        [id]/
          shop/
            page.tsx
        DraftPoModal.tsx
        OrdersClient.tsx
        page.tsx
      vendors/
        page.tsx
        vendors-client.tsx
    kds/
      page.tsx
    pos/
      page.tsx
    recipes/
      [id]/
        edit/
          page.tsx
        page.tsx
        RecipeViewerClient.tsx
      new/
        page.tsx
      page.tsx
      RecipeBuilderClient.tsx
      RecipesClientPage.tsx
    settings/
      page.tsx
      settings-client.tsx
    signage/
      [deckId]/
        preview/
          page.tsx
        page.tsx
        tv-signage-editor-client.tsx
      decks-list-client.tsx
      page.tsx
    transactions/
      page.tsx
    vendors/
      page.tsx
    dashboard-content.tsx
    layout.tsx
  (fullscreen)/
    recipes/
      [id]/
        kitchen/
          KitchenClientPage.tsx
          page.tsx
    layout.tsx
  display/
    [id]/
      column-layout-renderer.tsx
      display-player.tsx
      helpers.ts
      menu-item-card.tsx
      menu-slide-renderer.tsx
      page.tsx
      pairing-screen.tsx
      single-column.tsx
      slide-carousel.tsx
      slide-renderer.tsx
      types.ts
      use-display-player.ts
    page.tsx
  login/
    page.tsx
  apple-icon.tsx
  error.tsx
  global-error.tsx
  globals.css
  icon.tsx
  layout.tsx
  manifest.ts
  page.tsx
components/
  layout/
    app-bar.tsx
    bottom-nav.tsx
    hamburger.tsx
    sidebar.tsx
    theme-toggle.tsx
  ui/
    confirm-modal.tsx
  theme-provider.tsx
lib/
  supabase.ts
instrumentation-client.tsx
instrumentation.ts
sw.ts
```

# Files

## File: app/(dashboard)/@modal/(.)ingestion/review/[id]/page.tsx
```typescript
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  BrainCircuit,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { IngestionReview } from "@soustools/api-types";
import { toast } from "sonner";
import Link from "next/link";
import { ConfirmModal } from "../../../../../../components/ui/confirm-modal";
import { VisualBuilder } from "../../../../ingestion/review/[id]/visual-builder";
import { ModalShell } from "@soustools/domain-signage";

export default function IngestionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [review, setReview] = useState<IngestionReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<"visual" | "json">("visual");

  useEffect(() => {
    const fetchReview = async () => {
      const { data } = await supabase
        .from("ingestion_reviews")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        // camelCase conversion
        const parsed = {
          id: data.id,
          organizationId: data.organization_id,
          userId: data.user_id,
          source: data.source,
          rawText: data.raw_text,
          parsedData: data.parsed_data,
          status: data.status,
          sourceDocumentUrl: data.source_document_url,
          sourceName: data.source_name,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        } as IngestionReview;

        setReview(parsed);
        setEditedData(JSON.stringify(parsed.parsedData, null, 2));
      } else {
        toast.error("Review not found");
      }
      setLoading(false);
    };

    if (id) fetchReview();
  }, [id]);

  const handleApprove = async () => {
    try {
      const finalJson = JSON.parse(editedData);

      // Update the DB record with latest JSON changes first
      await supabase
        .from("ingestion_reviews")
        .update({ parsed_data: finalJson })
        .eq("id", id);

      // Trigger the real commit API synchronously
      const res = await fetch(`/api/ingestion/review/${id}/commit`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to commit data");

      toast.success("Ingestion Approved and mapped to Live Data!");
      router.push("/recipes");
    } catch (err) {
      toast.error("Failed to commit changes. Ensure JSON is valid.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/ingestion/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Review deleted successfully");
      router.push("/ingestion");
    } catch (err) {
      toast.error("Failed to delete review");
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!review) return null;

  return (
    <ModalShell title="Ingestion Review" maxWidth="max-w-7xl">
      <div className="p-2 md:p-4 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/ingestion"
              className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-sky-400" />
                Human-in-the-Loop Review
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Review AI extracted data from {review.source.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete Review"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {review.status === "PENDING" ? (
              <button
                onClick={handleApprove}
                className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20"
              >
                <CheckCircle className="w-5 h-5" /> Approve & Save
              </button>
            ) : (
              <div
                className={`px-4 py-2 rounded-lg font-bold border ${
                  review.status === "REJECTED"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}
              >
                Already {review.status}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
          {/* Left Pane: Raw Document text or Image */}
          <div className="bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 bg-card/80 border-b border-black/10 dark:border-white/10">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Raw Source Document
              </h2>
            </div>
            <div className="flex-1 overflow-auto bg-black/5 dark:bg-black/40">
              {review.sourceDocumentUrl ? (
                review.sourceDocumentUrl.endsWith(".pdf") ? (
                  <iframe
                    src={review.sourceDocumentUrl}
                    className="w-full h-full border-none"
                  />
                ) : (
                  <img
                    src={review.sourceDocumentUrl}
                    className="w-full h-auto object-contain"
                    alt="Raw Document"
                  />
                )
              ) : (
                <pre className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap font-mono p-4">
                  {review.rawText || "No raw text available."}
                </pre>
              )}
            </div>
          </div>

          {/* Right Pane: AI Structured Data Editable */}
          <div className="bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 bg-card/80 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                AI Extracted Data
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded-full">
                  Vendor Aliases Applied
                </span>
                <div className="flex bg-black/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("visual")}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === "visual" ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-white"}`}
                  >
                    Visual
                  </button>
                  <button
                    onClick={() => setViewMode("json")}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === "json" ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-white"}`}
                  >
                    JSON
                  </button>
                </div>
              </div>
            </div>
            {viewMode === "visual" ? (
              <VisualBuilder
                editedData={editedData}
                onChange={setEditedData}
                disabled={review.status !== "PENDING"}
                organizationId={review.organizationId}
              />
            ) : (
              <div className="flex-1">
                <textarea
                  value={editedData}
                  onChange={(e) => setEditedData(e.target.value)}
                  className={`w-full h-full bg-white/50 dark:bg-black/60 font-mono text-sm p-4 resize-none focus:outline-none focus:border focus:border-sky-500/50 ${
                    editedData.includes('"error":')
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                  spellCheck={false}
                  disabled={review.status !== "PENDING"}
                />
              </div>
            )}
          </div>
        </div>

        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Delete Ingestion Review"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          isDestructive={true}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      </div>
    </ModalShell>
  );
}
```

## File: app/(dashboard)/@modal/signage/[deckId]/preview/page.tsx
```typescript
"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Edit, Monitor, Copy, Check } from "lucide-react";
import { ModalShell } from "@soustools/domain-signage";

interface Params {
  deckId: string;
}

interface DeckData {
  id: string;
  name: string;
  slug: string;
  config?: { slides?: unknown[] };
}

/**
 * Deck Preview Modal — rendered in the @modal parallel slot when
 * the user navigates to /signage/[deckId]/preview from the deck list.
 * The editor route /signage/[deckId] remains untouched.
 */
export default function DeckPreviewModal({
  params,
}: {
  params: Promise<Params>;
}) {
  const { deckId } = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/signage/layouts/${deckId}`)
      .then((r) => r.json())
      .then((d: { success: boolean; data: DeckData }) => {
        if (d.success) setDeck(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [deckId]);

  const getLiveUrl = () => {
    if (!deck) return "";
    const base =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:5003"
        : window.location.origin;
    return `${base}/s/dtown-cafe/${deck.slug}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getLiveUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slideCount = deck?.config?.slides?.length ?? 0;

  return (
    <ModalShell
      title={loading ? "Loading…" : (deck?.name ?? "Deck Preview")}
      subtitle={
        deck
          ? `${slideCount} slide${slideCount !== 1 ? "s" : ""}  ·  /s/dtown-cafe/${deck.slug}`
          : undefined
      }
      maxWidth="max-w-5xl"
      footer={
        <>
          <button
            onClick={() => router.back()}
            className="px-4 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 border border-black/10 dark:border-white/10 hover:border-white/20 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => router.push(`/signage/${deckId}`)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" /> Open Editor
          </button>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin" />
        </div>
      ) : !deck ? (
        <div className="flex items-center justify-center h-64 text-zinc-400 dark:text-zinc-500">
          Deck not found.
        </div>
      ) : (
        <div className="flex flex-col">
          {/* 16:9 live preview iframe */}
          <div className="relative w-full bg-white dark:bg-black" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={getLiveUrl()}
              title={deck.name}
              className="absolute inset-0 w-full h-full border-none"
              allow="autoplay; encrypted-media"
            />
          </div>
          {/* Action strip */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950">
            <Monitor className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex-1 font-mono truncate">{getLiveUrl()}</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-black/10 dark:border-white/10 hover:border-white/20 text-zinc-700 dark:text-zinc-300 hover:text-white rounded-lg transition cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy URL"}
            </button>
            <a
              href={getLiveUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-black/10 dark:border-white/10 hover:border-white/20 text-zinc-700 dark:text-zinc-300 hover:text-white rounded-lg transition cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in Tab
            </a>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
```

## File: app/(dashboard)/@modal/signage/[deckId]/page.tsx
```typescript
/**
 * Empty slot for the @modal parallel route when on /signage/[deckId] (full editor).
 * The actual preview modal lives at @modal/signage/[deckId]/preview/page.tsx
 * and is only activated when navigating to /signage/[deckId]/preview.
 */
export default function DeckEditorModalSlot() {
  return null;
}
```

## File: app/(dashboard)/@modal/default.tsx
```typescript
export default function ModalDefault() {
  return null;
}
```

## File: app/(dashboard)/catalog/page.tsx
```typescript
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Search, Edit3, X, Save, Image, DollarSign } from "lucide-react";
import { Button } from "@soustools/ui";
import { toast } from "sonner";

interface PosItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_sold_out: boolean;
  external_id: string;
}

export default function CatalogEditorPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PosItem[]>([]);
  const [search, setSearch] = useState("");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<PosItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSoldOut, setEditSoldOut] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pos_items")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      setItems((data as PosItem[]) || []);
    } catch (err: any) {
      toast.error(`Failed to load catalog: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const startEdit = (item: PosItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDesc(item.description || "");
    setEditPrice(item.price.toString());
    setEditSoldOut(item.is_sold_out);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || saving) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("pos_items")
        .update({
          name: editName,
          description: editDesc || null,
          price: parseFloat(editPrice) || 0,
          is_sold_out: editSoldOut,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingItem.id);

      if (error) throw error;

      toast.success("Catalog item updated successfully!");
      setEditingItem(null);
      fetchCatalog();
    } catch (err: any) {
      toast.error(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn relative">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-slate-100">
          POS Catalog Editor
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Audit and edit properties of POS-synchronized menu items.
        </p>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-black/5 dark:border-white/5 flex gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search catalog items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 w-full text-xs text-white outline-none focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="text-center text-zinc-400 dark:text-zinc-500 py-12 text-sm">
          Downloading catalog metadata...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center text-zinc-400 dark:text-zinc-500 py-12 text-sm">
          No items found matching the filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between hover:border-white/15 transition-all relative ${
                item.is_sold_out
                  ? "border-rose-500/20 bg-rose-950/5"
                  : "border-black/5 dark:border-white/5"
              }`}
            >
              <div>
                <div className="w-full aspect-video rounded-xl bg-zinc-100 dark:bg-card border border-black/5 dark:border-white/5 flex items-center justify-center mb-4 text-zinc-700">
                  <Image className="w-8 h-8" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-200 text-sm truncate pr-2">
                    {item.name}
                  </h3>
                  <span className="text-xs font-bold text-sky-400 font-mono shrink-0">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-zinc-400 dark:text-zinc-500 text-xs line-clamp-2 min-h-[32px]">
                  {item.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    item.is_sold_out
                      ? "text-rose-400 bg-rose-950/20 border-rose-500/20"
                      : "text-emerald-400 bg-emerald-950/20 border-emerald-500/20"
                  }`}
                >
                  {item.is_sold_out ? "Sold Out" : "Active"}
                </span>

                <button
                  onClick={() => startEdit(item)}
                  className="p-2 border border-zinc-800 rounded-xl hover:bg-black/5 dark:bg-white/5 hover:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-white transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Slide-over Panel */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingItem(null)}
          />
          <div className="relative w-full max-w-md bg-zinc-50 dark:bg-zinc-950 border-l border-black/10 dark:border-white/10 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-card/40">
              <h2 className="text-xl font-bold text-white">
                Edit Catalog Item
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-white hover:bg-black/5 dark:bg-white/5 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="flex-1 p-6 space-y-6 overflow-y-auto"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-zinc-100 dark:bg-card border border-zinc-850 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-100 dark:bg-card border border-zinc-850 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Price ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="w-full bg-zinc-100 dark:bg-card border border-zinc-850 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-6">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Inventory Status
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 block">
                    Mark this item sold out globally
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditSoldOut(!editSoldOut)}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${
                    editSoldOut ? "bg-rose-500" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-all ${
                      editSoldOut ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-black/5 dark:border-white/5 pt-6 flex justify-end gap-3 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-sky-500 text-white hover:bg-sky-600"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: app/(dashboard)/dashboard/page.tsx
```typescript
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Tv,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@soustools/ui";

interface DisplayStatus {
  id: string;
  name: string;
  isOnline: boolean;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [onlineDisplays, setOnlineDisplays] = useState<DisplayStatus[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Top Metrics
  const foodCostPercent = 28.4;
  const mtdGrossProfit = 34520.0;
  const totalSales = 121549.5;

  // Alerts
  const priceSpikes = [
    {
      name: "Unsalted Butter (Euro)",
      oldPrice: 4.2,
      newPrice: 5.8,
      change: 38,
    },
    {
      name: "Fresh Cilantro (Bunch)",
      oldPrice: 0.89,
      newPrice: 1.45,
      change: 62,
    },
  ];

  const lowPars = [
    { name: "Truffle Oil", current: 2, par: 5 },
    { name: "Ribeye Steak 12oz", current: 8, par: 20 },
  ];

  const marginDrivers = [
    { name: "Truffle Fries", margin: 82 },
    { name: "Craft IPA Pint", margin: 76 },
  ];

  const marginBleeders = [
    { name: "Garlic Salmon Fillet", margin: 18 },
    { name: "Avocado Toast", margin: 24 },
  ];

  const fetchActiveDisplays = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch displays from Supabase
      const { data: dbDisplays } = await supabase
        .from("signage_displays")
        .select("id, name");

      // 2. Fetch active WebSocket connections from NestJS
      const connRes = await fetch("/api/signage/displays/active-connections");
      let activeConnections: Record<string, boolean> = {};
      if (connRes.ok) {
        const payload = await connRes.json();
        if (payload.success) {
          activeConnections = payload.data || {};
        }
      }

      if (dbDisplays) {
        const mapped = dbDisplays.map((d: any) => ({
          id: d.id,
          name: d.name,
          isOnline: !!activeConnections[d.id],
        }));
        setOnlineDisplays(mapped);
      }
    } catch (err) {
      console.error("Failed to load display connection status:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveDisplays();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-slate-100 tracking-tight">
            BOH Command Center
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Real-time telemetry and profit margins for your kitchen.
          </p>
        </div>
        <Button
          onClick={fetchActiveDisplays}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-1.5 border-zinc-800"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Reload Analytics
        </Button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-sky-400 bg-sky-500/10 p-2 rounded-xl border border-sky-500/20">
            <TrendingDown className="w-5 h-5" />
          </div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">
            Food Cost %
          </span>
          <span className="text-3xl font-extrabold text-white mt-3 block">
            {foodCostPercent}%
          </span>
          <span className="text-emerald-400 text-xs mt-2 flex items-center gap-1 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" /> -1.2% this week
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-violet-400 bg-violet-500/10 p-2 rounded-xl border border-violet-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">
            MTD Gross Profit
          </span>
          <span className="text-3xl font-extrabold text-white mt-3 block">
            $
            {mtdGrossProfit.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-emerald-400 text-xs mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> +8.4% vs last month
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-sky-400 bg-sky-500/10 p-2 rounded-xl border border-sky-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider block">
            Total Synced Sales
          </span>
          <span className="text-3xl font-extrabold text-white mt-3 block">
            $
            {totalSales.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="text-emerald-400 text-xs mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Synchronized with Square
          </span>
        </div>
      </div>

      {/* Main Grid: Alerts / Drivers & Signage Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts & Critical Stock */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Spikes & Low Pars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Critical
                Price Spikes
              </h3>
              <div className="space-y-3">
                {priceSpikes.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3"
                  >
                    <div>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 block">
                        ${item.oldPrice} ➔ ${item.newPrice}
                      </span>
                    </div>
                    <span className="text-rose-400 text-xs font-bold font-mono">
                      +{item.change}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Par
                Alert
              </h3>
              <div className="space-y-3">
                {lowPars.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3"
                  >
                    <div>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 block">
                        Target Par: {item.par}
                      </span>
                    </div>
                    <span className="text-rose-400 text-xs font-bold font-mono">
                      {item.current} remaining
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Margins */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" /> Top Margin Drivers
              </h3>
              <div className="space-y-3">
                {marginDrivers.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3"
                  >
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {item.name}
                    </span>
                    <span className="text-emerald-400 text-xs font-extrabold">
                      {item.margin}% margin
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4" /> Margin Bleeders
              </h3>
              <div className="space-y-3">
                {marginBleeders.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3"
                  >
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {item.name}
                    </span>
                    <span className="text-rose-400 text-xs font-extrabold">
                      {item.margin}% margin
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Digital Signage Connection Statuses */}
        <div className="glass-panel p-6 rounded-2xl border border-black/5 dark:border-white/5 flex flex-col">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Tv className="w-4 h-4 text-sky-400" /> Digital Signage Telemetry
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {loading ? (
              <div className="text-center text-zinc-400 dark:text-zinc-500 py-6 text-xs">
                Polling active display ports...
              </div>
            ) : onlineDisplays.length === 0 ? (
              <div className="text-center text-zinc-400 dark:text-zinc-500 py-6 text-xs">
                No active displays registered.
              </div>
            ) : (
              onlineDisplays.map((display) => (
                <div
                  key={display.id}
                  className="flex justify-between items-center bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3.5"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      {display.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5">
                      Port ID: {display.id.slice(0, 8)}...
                    </span>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      display.isOnline
                        ? "text-emerald-400 bg-emerald-950/20 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                        : "text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-card border-zinc-800"
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    {display.isOnline ? "Active" : "Offline"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: app/(dashboard)/devices/devices-client-wrapper.tsx
```typescript
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DisplayManager } from "@soustools/domain-signage";
import { SignageDisplay } from "@soustools/api-types";

interface DevicesClientWrapperProps {
  displays: SignageDisplay[];
  layouts: any[];
}

export function DevicesClientWrapper({
  displays,
  layouts,
}: DevicesClientWrapperProps) {
  const router = useRouter();

  const handleAddBrowserDisplay = async (name: string) => {
    await fetch("/api/signage/displays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    router.refresh();
  };

  const handleDeleteDisplay = async (id: string) => {
    await fetch(`/api/signage/displays/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleAssignDeck = async (displayId: string, deckId: string | null) => {
    await fetch(`/api/signage/displays/${displayId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId }),
    });
    router.refresh();
  };

  const handlePairDisplay = async (code: string) => {
    await fetch("/api/signage/displays/pair/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pairingCode: code, name: "New TV Display" }),
    });
    router.refresh();
  };

  const handleSaveDevice = async (deviceId: string, payload: any) => {
    await fetch(`/api/signage/devices/${deviceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    router.refresh();
  };

  const handleFetchDevice = async (deviceId: string) => {
    const res = await fetch(`/api/signage/devices/${deviceId}`);
    const data = await res.json();
    return data.data;
  };

  return (
    <DisplayManager
      displays={displays}
      layouts={layouts}
      onAddBrowserDisplay={handleAddBrowserDisplay}
      onDeleteDisplay={handleDeleteDisplay}
      onAssignDeck={handleAssignDeck}
      onPairDisplay={handlePairDisplay}
      onSaveDevice={handleSaveDevice}
      onFetchDevice={handleFetchDevice}
      onRefreshData={() => router.refresh()}
    />
  );
}
```

## File: app/(dashboard)/devices/page.tsx
```typescript
import React from "react";
import { config } from "@soustools/config";
import { DevicesClientWrapper } from "./devices-client-wrapper";

/**
 * DevicesPage mounts the signage physical displays pairing and status manager.
 */
export default async function DevicesPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";

  let displays = [];
  let layouts = [];

  try {
    const [dispRes, layRes] = await Promise.all([
      fetch(`${baseUrl}/signage/displays`, { cache: "no-store" }),
      fetch(`${baseUrl}/signage/layouts`, { cache: "no-store" }),
    ]);

    if (dispRes.ok) {
      const data = await dispRes.json();
      displays = data.data || [];
    }

    if (layRes.ok) {
      const data = await layRes.json();
      layouts = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch signage displays/layouts:", err);
  }

  return <DevicesClientWrapper displays={displays} layouts={layouts} />;
}
```

## File: app/(dashboard)/ingestion/review/[id]/page.tsx
```typescript
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  BrainCircuit,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { IngestionReview } from "@soustools/api-types";
import { toast } from "sonner";
import Link from "next/link";
import { ConfirmModal } from "../../../../../components/ui/confirm-modal";
import { VisualBuilder } from "./visual-builder";

export default function IngestionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [review, setReview] = useState<IngestionReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<"visual" | "json">("visual");

  useEffect(() => {
    const fetchReview = async () => {
      const { data } = await supabase
        .from("ingestion_reviews")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        // camelCase conversion
        const parsed = {
          id: data.id,
          organizationId: data.organization_id,
          userId: data.user_id,
          source: data.source,
          rawText: data.raw_text,
          parsedData: data.parsed_data,
          status: data.status,
          sourceDocumentUrl: data.source_document_url,
          sourceName: data.source_name,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        } as IngestionReview;

        setReview(parsed);
        setEditedData(JSON.stringify(parsed.parsedData, null, 2));
      } else {
        toast.error("Review not found");
      }
      setLoading(false);
    };

    if (id) fetchReview();
  }, [id]);

  const handleApprove = async () => {
    try {
      const finalJson = JSON.parse(editedData);

      // Update the DB record with latest JSON changes first
      await supabase
        .from("ingestion_reviews")
        .update({ parsed_data: finalJson })
        .eq("id", id);

      // Trigger the real commit API synchronously
      const res = await fetch(`/api/ingestion/review/${id}/commit`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to commit data");

      toast.success("Ingestion Approved and mapped to Live Data!");
      router.push("/recipes");
    } catch (err) {
      toast.error("Failed to commit changes. Ensure JSON is valid.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/ingestion/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Review deleted successfully");
      router.push("/ingestion");
    } catch (err) {
      toast.error("Failed to delete review");
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/ingestion"
            className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-sky-400" />
              Human-in-the-Loop Review
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Review AI extracted data from {review.source.replace("_", " ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Review"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {review.status === "PENDING" ? (
            <button
              onClick={handleApprove}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20"
            >
              <CheckCircle className="w-5 h-5" /> Approve & Save
            </button>
          ) : (
            <div
              className={`px-4 py-2 rounded-lg font-bold border ${
                review.status === "REJECTED"
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              }`}
            >
              Already {review.status}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
        {/* Left Pane: Raw Document text or Image */}
        <div className="bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 bg-card/80 border-b border-black/10 dark:border-white/10">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Raw Source Document
            </h2>
          </div>
          <div className="flex-1 overflow-auto bg-black/5 dark:bg-black/40">
            {review.sourceDocumentUrl ? (
              review.sourceDocumentUrl.endsWith(".pdf") ? (
                <iframe
                  src={review.sourceDocumentUrl}
                  className="w-full h-full border-none"
                />
              ) : (
                <img
                  src={review.sourceDocumentUrl}
                  className="w-full h-auto object-contain"
                  alt="Raw Document"
                />
              )
            ) : (
              <pre className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap font-mono p-4">
                {review.rawText || "No raw text available."}
              </pre>
            )}
          </div>
        </div>

        {/* Right Pane: AI Structured Data Editable */}
        <div className="bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 bg-card/80 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              AI Extracted Data
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded-full">
                Vendor Aliases Applied
              </span>
              <div className="flex bg-black/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("visual")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === "visual" ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-white"}`}
                >
                  Visual
                </button>
                <button
                  onClick={() => setViewMode("json")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === "json" ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-400 dark:text-zinc-500 hover:text-white"}`}
                >
                  JSON
                </button>
              </div>
            </div>
          </div>
          {viewMode === "visual" ? (
            <VisualBuilder
              editedData={editedData}
              onChange={setEditedData}
              disabled={review.status !== "PENDING"}
              organizationId={review.organizationId}
            />
          ) : (
            <div className="flex-1">
              <textarea
                value={editedData}
                onChange={(e) => setEditedData(e.target.value)}
                className={`w-full h-full bg-white/50 dark:bg-black/60 font-mono text-sm p-4 resize-none focus:outline-none focus:border focus:border-sky-500/50 ${
                  editedData.includes('"error":')
                    ? "text-red-400"
                    : "text-emerald-400"
                }`}
                spellCheck={false}
                disabled={review.status !== "PENDING"}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Ingestion Review"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
```

## File: app/(dashboard)/ingestion/review/[id]/visual-builder.tsx
```typescript
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronRight } from "lucide-react";

interface VisualBuilderProps {
  editedData: string;
  onChange: (newData: string) => void;
  disabled: boolean;
  organizationId: string;
}

export function VisualBuilder({
  editedData,
  onChange,
  disabled,
  organizationId,
}: VisualBuilderProps) {
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [expandedRecipes, setExpandedRecipes] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("items")
        .select("id, name")
        .eq("organization_id", organizationId)
        .order("name");
      if (data) {
        setItems(data.map((d: any) => ({ id: d.id, name: d.name })));
      }
    };
    if (organizationId) fetchItems();
  }, [organizationId]);

  let parsed: any = {};
  try {
    parsed = JSON.parse(editedData);
  } catch (e) {
    return (
      <div className="p-4 text-red-400">
        Invalid JSON data. Use JSON Editor to fix.
      </div>
    );
  }

  // Auto-map ingredient itemIds based on raw names when items load
  useEffect(() => {
    if (items.length === 0 || disabled) return;
    let modified = false;
    const newData = { ...parsed };
    const targetRecipes = newData.recipes
      ? newData.recipes
      : newData.title && newData.ingredients
        ? [newData]
        : [];

    targetRecipes.forEach((recipe: any) => {
      if (recipe.ingredients) {
        recipe.ingredients.forEach((ing: any) => {
          if (!ing.itemId && ing.name) {
            const match = items.find(
              (i) =>
                i.name.toLowerCase() === String(ing.name).trim().toLowerCase(),
            );
            if (match) {
              ing.itemId = match.id;
              modified = true;
            }
          }
        });
      }
    });

    if (modified) {
      onChange(JSON.stringify(newData, null, 2));
    }
  }, [items, parsed, disabled, onChange]);

  const recipes = parsed.recipes
    ? parsed.recipes
    : parsed.title && parsed.ingredients
      ? [parsed]
      : [];

  if (recipes.length === 0) {
    return (
      <div className="p-4 text-zinc-500 dark:text-zinc-400">
        No recipes found in data.
      </div>
    );
  }

  const handleUpdate = (recipeIndex: number, field: string, value: any) => {
    const newData = { ...parsed };
    if (newData.recipes) {
      newData.recipes[recipeIndex][field] = value;
    } else {
      newData[field] = value;
    }
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleIngredientUpdate = (
    recipeIndex: number,
    ingIndex: number,
    field: string,
    value: any,
  ) => {
    const newData = { ...parsed };
    const targetRecipe = newData.recipes
      ? newData.recipes[recipeIndex]
      : newData;
    targetRecipe.ingredients[ingIndex][field] = value;
    onChange(JSON.stringify(newData, null, 2));
  };

  const toggleExpand = (i: number) => {
    setExpandedRecipes((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black/5 dark:bg-black/40 p-4 space-y-4">
      {recipes.map((recipe: any, rIdx: number) => {
        const isExpanded = expandedRecipes[rIdx] !== false;

        // Group ingredients by component
        const components: Record<string, any[]> = {};

        (recipe.ingredients || []).forEach((ing: any, i: number) => {
          const comp = ing.component || "Base Recipe";
          if (!components[comp]) components[comp] = [];
          components[comp].push({ ...ing, originalIndex: i });
        });

        return (
          <div
            key={rIdx}
            className="border border-black/10 dark:border-white/10 rounded-xl bg-card/50 overflow-hidden shadow-sm"
          >
            <div
              className="p-3 bg-black/5 dark:bg-white/5 flex items-center gap-2 cursor-pointer hover:bg-black/10 dark:bg-white/10"
              onClick={() => toggleExpand(rIdx)}
            >
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
              <span className="font-bold text-sky-400">
                {recipe.title || "Untitled Recipe"}
              </span>
            </div>

            {isExpanded && (
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">
                      Title
                    </label>
                    <input
                      disabled={disabled}
                      type="text"
                      value={recipe.title || ""}
                      onChange={(e) =>
                        handleUpdate(rIdx, "title", e.target.value)
                      }
                      className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">
                        Yield
                      </label>
                      <input
                        disabled={disabled}
                        type="number"
                        value={recipe.yieldCount || 1}
                        onChange={(e) =>
                          handleUpdate(
                            rIdx,
                            "yieldCount",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">
                        Unit
                      </label>
                      <input
                        disabled={disabled}
                        type="text"
                        value={recipe.yieldUnit || "servings"}
                        onChange={(e) =>
                          handleUpdate(rIdx, "yieldUnit", e.target.value)
                        }
                        className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
                    <h4 className="text-sm font-semibold">Ingredients</h4>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        // Math logic: Calculate base weights per component
                        const componentBaseWeights: Record<string, number> = {};
                        const ings = recipe.ingredients || [];
                        ings.forEach((ing: any) => {
                          if (ing.baseCalculationGroup) {
                            const comp = ing.component || "Base Recipe";
                            componentBaseWeights[comp] =
                              (componentBaseWeights[comp] || 0) +
                              Number(ing.amount || 0);
                          }
                        });

                        const hasAnyBase = Object.values(
                          componentBaseWeights,
                        ).some((w) => w > 0);
                        if (!hasAnyBase) {
                          alert(
                            "Please select at least one Base ingredient (in any component) to convert!",
                          );
                          return;
                        }

                        // Convert ingredients to percentages relative to their component's base weight
                        const newData = { ...parsed };
                        const targetRecipe = newData.recipes
                          ? newData.recipes[rIdx]
                          : newData;

                        targetRecipe.ingredients = targetRecipe.ingredients.map(
                          (ing: any) => {
                            const comp = ing.component || "Base Recipe";
                            const compBaseWeight =
                              componentBaseWeights[comp] || 0;

                            if (compBaseWeight === 0) return ing; // Skip if no base for this component

                            const originalAmount = Number(ing.amount || 0);
                            const percentage =
                              (originalAmount / compBaseWeight) * 100;
                            return {
                              ...ing,
                              amount: Number(percentage.toFixed(2)),
                              unit: "%",
                              calculationType: "BAKERS_PERCENTAGE",
                              // Keep baseCalculationGroup true for the base items
                            };
                          },
                        );

                        onChange(JSON.stringify(newData, null, 2));
                      }}
                      className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded hover:bg-amber-500/30 transition-colors"
                    >
                      Convert to Baker's %
                    </button>
                  </div>

                  {Object.entries(components).map(([compName, ings]) => (
                    <div key={compName} className="space-y-3">
                      <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded inline-block">
                        {compName}
                      </h5>
                      <div className="space-y-2">
                        {ings.map((ing) => (
                          <div
                            key={ing.originalIndex}
                            className="grid grid-cols-12 gap-3 items-center bg-black/30 p-3 rounded-lg border border-black/5 dark:border-white/5"
                          >
                            <div className="col-span-4 flex flex-col gap-1 relative">
                              <input
                                disabled={disabled}
                                type="text"
                                value={ing.name || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs focus:border-sky-500 outline-none placeholder:text-white/20"
                                placeholder="Raw Name (from text)"
                              />
                              <select
                                disabled={disabled}
                                value={ing.itemId || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "itemId",
                                    e.target.value || null,
                                  )
                                }
                                className={`w-full bg-black/5 dark:bg-black/40 border rounded px-2 py-1.5 text-sm outline-none transition-colors ${
                                  !ing.itemId
                                    ? "border-red-500/70 text-red-300 focus:border-red-400"
                                    : "border-black/10 dark:border-white/10 text-emerald-400 focus:border-sky-500"
                                }`}
                              >
                                <option value="">
                                  ⚠️ Select Master Ingredient...
                                </option>
                                {items.map((it) => (
                                  <option key={it.id} value={it.id}>
                                    {it.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-3 flex gap-1">
                              <input
                                disabled={disabled}
                                type="number"
                                value={ing.amount || 0}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "amount",
                                    Number(e.target.value),
                                  )
                                }
                                className="w-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none"
                              />
                              <input
                                disabled={disabled}
                                type="text"
                                value={ing.unit || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "unit",
                                    e.target.value,
                                  )
                                }
                                className="w-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none placeholder:text-white/20"
                                placeholder="Unit"
                              />
                            </div>
                            <div className="col-span-5 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <select
                                  disabled={disabled}
                                  value={ing.calculationType || "WEIGHT"}
                                  onChange={(e) =>
                                    handleIngredientUpdate(
                                      rIdx,
                                      ing.originalIndex,
                                      "calculationType",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs focus:border-sky-500 outline-none"
                                >
                                  <option value="WEIGHT">Weight</option>
                                  <option value="VOLUME">Volume</option>
                                  <option value="COUNT">Count</option>
                                  <option value="BAKERS_PERCENTAGE">
                                    Baker's %
                                  </option>
                                </select>

                                {ing.calculationType ===
                                  "BAKERS_PERCENTAGE" && (
                                  <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer whitespace-nowrap bg-amber-400/10 px-2 py-1 rounded">
                                    <input
                                      disabled={disabled}
                                      type="checkbox"
                                      checked={
                                        ing.baseCalculationGroup || false
                                      }
                                      onChange={(e) =>
                                        handleIngredientUpdate(
                                          rIdx,
                                          ing.originalIndex,
                                          "baseCalculationGroup",
                                          e.target.checked,
                                        )
                                      }
                                      className="accent-amber-500"
                                    />
                                    Base
                                  </label>
                                )}
                              </div>
                              <input
                                disabled={disabled}
                                type="text"
                                value={ing.component || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "component",
                                    e.target.value || null,
                                  )
                                }
                                placeholder="Section (e.g. Glaze)"
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs focus:border-sky-500 outline-none text-zinc-500 dark:text-zinc-400"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

## File: app/(dashboard)/ingestion/page.tsx
```typescript
"use client";

import { useEffect, useState } from "react";
import { IngestionReview } from "@soustools/api-types";
import Link from "next/link";
import { BrainCircuit, Clock, CheckCircle, Trash2 } from "lucide-react";
import { ConfirmModal } from "../../../components/ui/confirm-modal";

export default function IngestionDashboardPage() {
  const [reviews, setReviews] = useState<IngestionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/ingestion");
      if (res.ok) {
        const payload = await res.json();
        const data = payload.data;
        if (data) {
          const parsed = data.map((d: any) => ({
            id: d.id,
            organizationId: d.organization_id,
            userId: d.user_id,
            source: d.source,
            sourceName: d.source_name,
            rawText: d.raw_text,
            parsedData: d.parsed_data,
            status: d.status,
            createdAt: d.created_at,
            updatedAt: d.updated_at
          })) as (IngestionReview & { sourceName?: string | null })[];
          setReviews(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load ingestion reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/ingestion/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setReviews(prev => prev.filter(r => r.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Processing Hub</h1>
          <p className="text-gray-500 mt-2">Review AI-extracted documents and invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-white/50 py-12">Loading queue...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full text-center text-white/50 py-12">No documents pending review.</div>
        ) : (
          reviews.map(review => (
            <Link key={review.id} href={`/ingestion/review/${review.id}`} className="block">
              <div className="glass-panel p-6 flex flex-col h-full group hover:border-sky-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-sky-400" />
                    <h2 className="text-xl font-bold truncate max-w-[200px]" title={review.sourceName || review.source.replace("_", " ").toLowerCase()}>
                      {review.sourceName || review.source.replace("_", " ").toLowerCase()}
                    </h2>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider ${
                    review.status === "PENDING" ? "bg-amber-500/20 text-amber-300" :
                    review.status === "REJECTED" ? "bg-red-500/20 text-red-300" :
                    "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {review.status}
                  </span>
                </div>

                <div className="flex-1 text-sm text-gray-400 mb-6">
                  {review.status === "PENDING" ? (
                    <span className="flex items-center gap-2"><Clock size={16}/> Needs Human Review</span>
                  ) : review.status === "REJECTED" ? (
                    <span className="flex items-center gap-2 text-red-400"><CheckCircle size={16}/> Rejected</span>
                  ) : (
                    <span className="flex items-center gap-2 text-emerald-400"><CheckCircle size={16}/> Approved</span>
                  )}
                  <div className="mt-4">
                    Uploaded: {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-center bg-black/5 dark:bg-white/5 text-white py-2 rounded-md font-medium group-hover:bg-sky-500 transition-colors">
                    Open Review
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); setDeleteId(review.id); }}
                    className="p-2 bg-black/5 dark:bg-white/5 hover:bg-red-500/20 text-zinc-500 dark:text-zinc-400 hover:text-red-400 rounded-md transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Ingestion Review"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
      />
    </div>
  );
}
```

## File: app/(dashboard)/inventory/items-ledger/items-ledger-client.tsx
```typescript
"use client";

import React, { useState, useRef } from "react";
import { Plus, Download, Upload, Loader2 } from "lucide-react";
import { ItemsLedgerTable, ItemEditorModal } from "@soustools/domain-inventory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ItemsLedgerClient({ initialItems }: { initialItems: any[] }) {
  const router = useRouter();
  const [loading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      const url = selectedItem ? `/api/items/${selectedItem.id}` : "/api/items";
      const method = selectedItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to save item");
      }
    } catch (err) {
      toast.error("Network error saving item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        toast.error("Failed to delete item");
      }
    } catch (err) {
      toast.error("Network error deleting item");
    }
  };

  const handleSearchUSDA = async (query: string) => {
    const res = await fetch(`/api/recipes/usda/search?query=${encodeURIComponent(query)}`);
    return await res.json();
  };

  const handleExportCSV = () => {
    if (!initialItems.length) return;
    const headers = ["name", "category", "purchase_unit", "density_g_ml", "allergens"];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\\n" +
      initialItems
        .map((e) => headers.map((h) => JSON.stringify(e[h] || "")).join(","))
        .join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "items_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) return;

        const headers = lines[0].split(",");

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.replace(/^"|"$/g, ""));
          const payload: any = {};
          headers.forEach((h, idx) => {
            if (h === "density_g_ml") payload[h] = parseFloat(values[idx]) || 1.0;
            else if (h === "allergens")
              payload[h] = values[idx] ? values[idx].split(";").map((s) => s.trim()) : [];
            else payload[h] = values[idx];
          });

          await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        router.refresh();
      } catch (err) {
        toast.error("Import failed");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">Items Ledger</h1>
          <p className="text-zinc-500 mt-2">Manage your master ingredients, density, and nutrition.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download size={18} /> Export
          </button>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImportCSV}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Import
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-sky-500/20"
          >
            <Plus size={18} /> New Item
          </button>
        </div>
      </div>

      <div className="st-glass-panel overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-xl">
        <ItemsLedgerTable
          items={initialItems}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {isModalOpen && (
        <ItemEditorModal
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onSearchUSDA={handleSearchUSDA}
        />
      )}
    </div>
  );
}
```

## File: app/(dashboard)/inventory/items-ledger/page.tsx
```typescript
import { config } from "@soustools/config";
import { ItemsLedgerClient } from "./items-ledger-client";

export default async function ItemsLedgerPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  let items = [];

  try {
    const res = await fetch(`${baseUrl}/items`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      items = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load items ledger:", err);
  }

  return <ItemsLedgerClient initialItems={items} />;
}
```

## File: app/(dashboard)/inventory/orders/[id]/shop/page.tsx
```typescript
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PurchaseOrder, PurchaseOrderItem, Vendor } from "@soustools/api-types";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";

type PopulatedPO = PurchaseOrder & {
  vendors: Vendor;
  purchase_order_items: PurchaseOrderItem[];
};

export default function SelfShopPage() {
  const { id } = useParams() as { id: string };
  const [po, setPo] = useState<PopulatedPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPO = async () => {
      const { data } = await supabase
        .from("purchase_orders")
        .select(`*, vendors (*), purchase_order_items (*)`)
        .eq("id", id)
        .single();
      
      if (data) {
        setPo(data as any);
        // Load offline cached state
        const cached = localStorage.getItem(`shop-checked-${id}`);
        if (cached) setCheckedItems(new Set(JSON.parse(cached)));
      }
      setLoading(false);
    };
    fetchPO();
  }, [id]);

  const toggleCheck = (itemId: string) => {
    const next = new Set(checkedItems);
    if (next.has(itemId)) next.delete(itemId);
    else next.add(itemId);
    
    setCheckedItems(next);
    localStorage.setItem(`shop-checked-${id}`, JSON.stringify(Array.from(next)));
  };

  if (loading) return <div className="p-8 text-center text-white/50">Loading Self-Shop Mode...</div>;
  if (!po) return <div className="p-8 text-center text-red-400">Order not found.</div>;

  const allChecked = po.purchase_order_items.length > 0 && checkedItems.size === po.purchase_order_items.length;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-screen flex flex-col animate-in slide-in-from-bottom-4">
      <Link href="/purchasing" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors w-fit">
        <ArrowLeft size={16} /> Back to Purchasing
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
          {po.vendors?.name}
          <span className="text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
            Self-Shop Mode
          </span>
        </h1>
        <p className="text-gray-400">
          Check off items as you place them in your basket. 
          Your progress is saved locally if you lose connection.
        </p>
      </div>

      <div className="flex-1 space-y-3">
        {po.purchase_order_items?.map(item => {
          const isChecked = checkedItems.has(item.id);
          return (
            <div 
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 md:p-6 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                isChecked 
                  ? "bg-green-500/10 border-green-500/30 text-gray-300" 
                  : "glass-panel border-black/10 dark:border-white/10 hover:border-white/20 text-white"
              }`}
            >
              <div className="flex items-center gap-4">
                {isChecked ? (
                  <CheckCircle2 className="text-green-500 w-8 h-8 flex-shrink-0" />
                ) : (
                  <Circle className="text-white/30 w-8 h-8 flex-shrink-0" />
                )}
                <span className={`text-xl md:text-2xl font-medium ${isChecked ? "line-through decoration-green-500/50" : ""}`}>
                  {item.raw_name}
                </span>
              </div>
              <span className={`text-2xl font-bold ${isChecked ? "text-green-500/50" : "text-white"}`}>
                x{item.ordered_qty}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 sticky bottom-8">
        <div className={`p-6 rounded-xl border backdrop-blur-xl transition-all ${
          allChecked ? "bg-green-600/20 border-green-500/50" : "bg-white/50 dark:bg-black/60 border-black/10 dark:border-white/10"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Progress</span>
            <span className="text-lg font-bold">{checkedItems.size} / {po.purchase_order_items.length} Items</span>
          </div>
          
          {allChecked && (
            <div className="text-center animate-in zoom-in">
              <p className="text-green-400 font-bold text-xl mb-2">Shopping Complete!</p>
              <p className="text-sm text-gray-400">
                To reconcile pricing, please scan the physical receipt using the Ingestion importer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## File: app/(dashboard)/inventory/orders/DraftPoModal.tsx
```typescript
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { WhiteboardItem, Vendor } from "@soustools/api-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * Props structure for the DraftPoModal component.
 */
interface DraftPoModalProps {
  /** Indicates if the modal is visible */
  isOpen: boolean;
  /** Callback function called to close the modal */
  onClose: () => void;
  /** Active whiteboard items available for purchase */
  items: WhiteboardItem[];
  /** Registered vendors list for vendor selection */
  vendors: Vendor[];
  /** Callback triggered after a PO is successfully created to refresh page state */
  onSuccess: () => void;
}

/**
 * DraftPoModal enables the user to select specific whiteboard items and
 * compile them into a draft Purchase Order for a selected vendor.
 * 
 * @tenant-docs-export
 * # Creating a Purchase Order from Whiteboard
 * 1. Click "Draft Purchase Order" on the Whiteboard page.
 * 2. Select the vendor from the dropdown list.
 * 3. Check the items you want to include in this order.
 * 4. Click "Create PO". The selected items will be moved into a draft Purchase Order and cleared from the board.
 */
export function DraftPoModal({ isOpen, onClose, items, vendors, onSuccess }: DraftPoModalProps) {
  const router = useRouter();
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  /**
   * Toggles the selection state of a specific whiteboard item.
   * 
   * @param id The UUID of the whiteboard item.
   */
  const toggleSelection = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  /**
   * Handles creating a draft Purchase Order and inserting selected items.
   */
  const createPO = async () => {
    if (!selectedVendor || selectedItems.size === 0) return;
    setIsSubmitting(true);

    try {
      const { data: orgData, error: orgErr } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .single();
      
      if (orgErr || !orgData) {
        toast.error(`Could not locate organization details: ${orgErr?.message || "No data"}`);
        setIsSubmitting(false);
        return;
      }
      
      const { data: po, error: poErr } = await supabase.from("purchase_orders").insert({
        organization_id: orgData.id,
        vendor_id: selectedVendor,
        status: "DRAFT"
      }).select().single();

      if (poErr || !po) {
        toast.error(`Failed to create Purchase Order: ${poErr?.message || "Database insert error"}`);
        setIsSubmitting(false);
        return;
      }

      const itemsToInsert = Array.from(selectedItems).map(id => {
        const wbi = items.find(i => i.id === id);
        return { po_id: po.id, raw_name: wbi?.raw_name || "Unknown Item", ordered_qty: 1, price_per_unit: 0 };
      });

      const { error: itemsErr } = await supabase.from("purchase_order_items").insert(itemsToInsert);
      if (itemsErr) {
        toast.error(`Failed to attach items to Purchase Order: ${itemsErr.message}`);
        setIsSubmitting(false);
        return;
      }
      
      // Mark whiteboard items as inactive
      for (const id of Array.from(selectedItems)) {
        await supabase.from("whiteboard_items").update({ is_active: false }).eq("id", id);
      }

      toast.success("Purchase Order created successfully!");
      setSelectedItems(new Set());
      onSuccess();
      onClose();
      router.push("/purchasing");
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <div className="glass-panel p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold mb-6">Select Items for PO</h2>
        
        <div className="mb-6 space-y-2">
          <label className="text-sm font-medium text-gray-400">Select Vendor</label>
          <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} className="w-full bg-white/50 dark:bg-black/60 border border-white/20 rounded-md p-3 text-white">
            <option value="">-- Choose Vendor --</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.order_method})</option>)}
          </select>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 border border-black/10 dark:border-white/10 p-4 rounded-md mb-6">
          {items.map(item => (
            <label key={item.id} className="flex items-center gap-4 cursor-pointer p-2 hover:bg-black/5 dark:bg-white/5 rounded">
              <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleSelection(item.id)} className="w-5 h-5" />
              <span className="text-lg">{item.raw_name}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-md font-medium hover:bg-black/10 dark:bg-white/10 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button 
            onClick={createPO}
            disabled={!selectedVendor || selectedItems.size === 0 || isSubmitting} 
            className="bg-white text-black px-6 py-2 rounded-md font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create PO"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## File: app/(dashboard)/inventory/orders/OrdersClient.tsx
```typescript
"use client";

import React from "react";
import { toast } from "sonner";
import { OrdersPanel } from "@soustools/domain-inventory";
import type { Vendor, WhiteboardItem } from "@soustools/api-types";
import { useRouter } from "next/navigation";

export interface OrdersClientProps {
  initialVendors: Vendor[];
  initialWhiteboardItems: WhiteboardItem[];
}

export function OrdersClient({ initialVendors, initialWhiteboardItems }: OrdersClientProps) {
  const router = useRouter();

  const handleAddFreeText = async (rawName: string) => {
    try {
      const res = await fetch("/api/whiteboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_name: rawName }),
      });
      if (!res.ok) throw new Error("Failed to save item");
      const data = await res.json();
      router.refresh();
      return data.id as string;
    } catch (err: any) {
      toast.error(err.message || "Network error");
      return null;
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const res = await fetch(`/api/whiteboard/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      router.refresh();
    } catch (err: any) {
      toast.error(`Remove failed: ${err.message}`);
    }
  };

  const handlePlaceOrder = async (supplierId: string) => {
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: supplierId }),
      });
      if (!res.ok) throw new Error("Failed to place order");
      toast.success("Order placed successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(`Order failed: ${err.message}`);
    }
  };

  return (
    <OrdersPanel
      vendors={initialVendors}
      whiteboardItems={initialWhiteboardItems}
      onAddFreeText={handleAddFreeText}
      onRemoveItem={handleRemoveItem}
      onPlaceOrder={handlePlaceOrder}
    />
  );
}
```

## File: app/(dashboard)/inventory/orders/page.tsx
```typescript
import { config } from "@soustools/config";
import { OrdersClient } from "./OrdersClient";

export default async function OrdersPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  let vendors = [];
  let whiteboardItems = [];

  try {
    const [vendorsRes, whiteboardRes] = await Promise.all([
      fetch(`${baseUrl}/vendors`, { cache: "no-store" }),
      fetch(`${baseUrl}/whiteboard`, { cache: "no-store" }),
    ]);

    if (vendorsRes.ok) {
      const vData = await vendorsRes.json();
      vendors = vData.data || [];
    }

    if (whiteboardRes.ok) {
      const wData = await whiteboardRes.json();
      whiteboardItems = wData.data || [];
    }
  } catch (err) {
    console.error("Failed to load orders data:", err);
  }

  return <OrdersClient initialVendors={vendors} initialWhiteboardItems={whiteboardItems} />;
}
```

## File: app/(dashboard)/inventory/vendors/page.tsx
```typescript
import { config } from "@soustools/config";
import { VendorsClient } from "./vendors-client";

export default async function VendorsPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  let vendors = [];

  try {
    const res = await fetch(`${baseUrl}/vendors`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      vendors = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load vendors:", err);
  }

  return <VendorsClient initialVendors={vendors} />;
}
```

## File: app/(dashboard)/inventory/vendors/vendors-client.tsx
```typescript
"use client";

import React from "react";
import { toast } from "sonner";
import { VendorsPanel } from "@soustools/domain-inventory";
import type { Vendor } from "@soustools/api-types";
import { useRouter } from "next/navigation";

export interface VendorsClientProps {
  initialVendors: Vendor[];
}

export function VendorsClient({ initialVendors }: VendorsClientProps) {
  const router = useRouter();

  const handleSave = async (id: string, payload: Partial<Vendor>) => {
    try {
      const url = id === "new" ? "/api/vendors" : `/api/vendors/${id}`;
      const method = id === "new" ? "POST" : "PUT";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Failed to save vendor");
      
      toast.success(id === "new" ? "Vendor created successfully!" : "Vendor updated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Network error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete vendor");
      toast.success("Vendor deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  return (
    <VendorsPanel
      vendors={initialVendors}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
```

## File: app/(dashboard)/kds/page.tsx
```typescript
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@soustools/ui";
import { 
  Tv, 
  Settings, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Search,
  PackageX
} from "lucide-react";
import { toast } from "sonner";

interface KDSTicketItem {
  name: string;
  qty: number;
  notes?: string;
}

interface KDSTicket {
  id: string;
  ticketNumber: string;
  tableNumber: string;
  items: KDSTicketItem[];
  createdAt: string;
  isRush?: boolean;
  status: "OPEN" | "CLOSED";
}

export default function KDSPage() {
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [posItems, setPosItems] = useState<any[]>([]);
  const [orgId, setOrgId] = useState<string>("d0000000-0000-0000-0000-000000000000");
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<"OPEN" | "CLOSED">("OPEN");

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [textSize, setTextSize] = useState<"sm" | "md" | "lg">("md");
  const [density, setDensity] = useState<"compact" | "standard" | "spacious">("standard");
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);

  // 86'd inventory search
  const [searchQuery, setSearchQuery] = useState("");

  // Programmatic synth chime using AudioContext
  const playChime = (type: "new" | "complete") => {
    if (typeof window === "undefined" || !soundsEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(soundVolume, ctx.currentTime);

      if (type === "new") {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        osc.type = "triangle";
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.type = "sine";
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("AudioContext chime failure:", e);
    }
  };

  // Load configuration, mock tickets, database items
  useEffect(() => {
    // 1. Fetch organization ID
    const fetchOrg = async () => {
      const { data } = await supabase.from("organizations").select("id").limit(1);
      if (data && data[0]) {
        setOrgId(data[0].id);
      }
    };

    // 2. Fetch POS items to enable 86'ing
    const fetchItems = async () => {
      const { data } = await supabase
        .from("pos_items")
        .select("*")
        .order("name", { ascending: true });
      if (data) setPosItems(data);
    };

    // 3. Setup settings from localStorage
    if (typeof window !== "undefined") {
      const savedText = localStorage.getItem("kds_text_size") as any;
      const savedDensity = localStorage.getItem("kds_density") as any;
      const savedSound = localStorage.getItem("kds_sounds_enabled");
      const savedVol = localStorage.getItem("kds_sound_volume");
      if (savedText) setTextSize(savedText);
      if (savedDensity) setDensity(savedDensity);
      if (savedSound) setSoundsEnabled(savedSound === "true");
      if (savedVol) setSoundVolume(parseFloat(savedVol));
    }

    Promise.all([fetchOrg(), fetchItems()]).then(() => setLoading(false));

    // Seed mock tickets
    setTickets([
      {
        id: "t-1",
        ticketNumber: "104",
        tableNumber: "Cook Line - T4",
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10m ago
        isRush: true,
        status: "OPEN",
        items: [
          { name: "Truffle Burger", qty: 2, notes: "Medium-Rare" },
          { name: "Truffle Fries", qty: 1 }
        ]
      },
      {
        id: "t-2",
        ticketNumber: "105",
        tableNumber: "Main Room - T12",
        createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4m ago
        isRush: false,
        status: "OPEN",
        items: [
          { name: "Caesar Salad", qty: 1, notes: "Dressing on side" },
          { name: "Tomato Soup", qty: 1 }
        ]
      },
      {
        id: "t-3",
        ticketNumber: "106",
        tableNumber: "Patio - T2",
        createdAt: new Date().toISOString(),
        isRush: false,
        status: "OPEN",
        items: [
          { name: "Truffle Burger", qty: 1 },
          { name: "Caesar Salad", qty: 2 }
        ]
      }
    ]);
  }, []);

  // Save settings helpers
  const saveTextSize = (sz: "sm" | "md" | "lg") => {
    setTextSize(sz);
    localStorage.setItem("kds_text_size", sz);
  };
  const saveDensity = (den: "compact" | "standard" | "spacious") => {
    setDensity(den);
    localStorage.setItem("kds_density", den);
  };
  const saveSounds = (enabled: boolean) => {
    setSoundsEnabled(enabled);
    localStorage.setItem("kds_sounds_enabled", enabled ? "true" : "false");
  };
  const saveVolume = (vol: number) => {
    setSoundVolume(vol);
    localStorage.setItem("kds_sound_volume", vol.toString());
  };

  // Complete ticket & sync to shadow DB
  const handleCompleteTicket = async (ticketId: string) => {
    const t = tickets.find(ticket => ticket.id === ticketId);
    if (!t) return;

    try {
      // Opt-in chime play
      playChime("complete");

      // Set ticket to CLOSED locally
      setTickets(prev =>
        prev.map(ticket => (ticket.id === ticketId ? { ...ticket, status: "CLOSED" } : ticket))
      );

      // Sync state to backend shadow DB (pos_transactions)
      const transactionsToInsert = t.items.map(item => {
        // Look up corresponding POS item in DB
        const match = posItems.find(
          dbItem => dbItem.name.toLowerCase() === item.name.toLowerCase()
        );
        return {
          organization_id: orgId,
          pos_item_id: match ? match.id : null,
          quantity_sold: item.qty,
          gross_revenue: match ? Number(match.price) * item.qty : 15.00 * item.qty, // fallback price
          transaction_time: new Date().toISOString(),
          source: "kds"
        };
      });

      const { error } = await supabase.from("pos_transactions").insert(transactionsToInsert);
      if (error) throw error;

      toast.success(`Ticket #${t.ticketNumber} completed and synced to shadow DB.`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Completed locally, but failed database sync: ${err.message}`);
    }
  };

  // 86 / Mark item Unavailable
  const handleToggleSoldOut = async (itemId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from("pos_items")
        .update({ is_sold_out: nextStatus })
        .eq("id", itemId);

      if (error) throw error;

      setPosItems(prev =>
        prev.map(item => (item.id === itemId ? { ...item, is_sold_out: nextStatus } : item))
      );
      toast.success(`Updated item availability.`);
    } catch (err: any) {
      toast.error(`Failed to update item availability: ${err.message}`);
    }
  };

  // All Day Prep Aggregation
  const getOpenTicketsItems = () => {
    const counts: Record<string, number> = {};
    tickets
      .filter(t => t.status === "OPEN")
      .forEach(t => {
        t.items.forEach(item => {
          counts[item.name] = (counts[item.name] || 0) + item.qty;
        });
      });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const filteredTickets = tickets.filter(t => t.status === viewFilter);
  const allDayPrep = getOpenTicketsItems();

  // Grid classes mapping density
  const gridClasses = {
    compact: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3",
    standard: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
    spacious: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
  }[density];

  // Font classes mapping text sizes
  const fontClasses = {
    sm: { title: "text-xs font-bold", body: "text-xs", notes: "text-[10px]" },
    md: { title: "text-sm font-bold", body: "text-sm", notes: "text-xs" },
    lg: { title: "text-base font-bold", body: "text-base", notes: "text-sm" }
  }[textSize];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 text-white">
        <div className="w-10 h-10 border-4 border-t-sky-500 border-black/10 dark:border-white/10 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredPosItems = posItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-slate-100 p-6 space-y-6 relative overflow-hidden">
      {/* Header Panel */}
      <header className="glass-panel flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-2xl shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Tv className="w-6 h-6 text-sky-500 dark:text-sky-400" /> Kitchen Display System (KDS)
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Station: Hot Line & Main Preparation</p>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Open vs Closed Toggles */}
          <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setViewFilter("OPEN")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                viewFilter === "OPEN" ? "bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Open ({tickets.filter(t => t.status === "OPEN").length})
            </button>
            <button
              onClick={() => setViewFilter("CLOSED")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                viewFilter === "CLOSED" ? "bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Completed ({tickets.filter(t => t.status === "CLOSED").length})
            </button>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-black/10 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Layout Grid split into Preparation Rack and All Day Panel */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 h-[calc(100vh-230px)]">
        {/* Active Ticket Rack */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`flex-1 overflow-y-auto pr-1 grid ${gridClasses} pb-10`}>
            {filteredTickets.length === 0 ? (
              <div className="glass-panel col-span-full flex flex-col items-center justify-center p-12 text-zinc-400 dark:text-zinc-500 rounded-2xl h-64">
                <CheckCircle className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-3" />
                <p className="font-bold text-lg text-zinc-600 dark:text-zinc-400">All tickets completed!</p>
                <p className="text-sm mt-1">Ready for incoming transactions...</p>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const ageMinutes = Math.floor(
                  (Date.now() - new Date(ticket.createdAt).getTime()) / (60 * 1000)
                );
                return (
                  <div
                    key={ticket.id}
                    className={`glass-panel flex flex-col justify-between rounded-xl p-4 transition-all duration-300 max-h-[360px] overflow-hidden ${
                      ticket.isRush
                        ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/5 dark:bg-amber-950/5"
                        : "shadow-lg hover:border-black/20 dark:hover:border-white/20"
                    }`}
                  >
                    <div>
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start pb-2 border-b border-black/5 dark:border-white/5 mb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black tracking-tight ${fontClasses.title} ${
                              ticket.isRush ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-white"
                            }`}>
                              Ticket #{ticket.ticketNumber}
                            </span>
                            {ticket.isRush && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 font-extrabold uppercase">
                                RUSH
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{ticket.tableNumber}</span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end text-zinc-500 dark:text-zinc-400 text-xs gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{ageMinutes}m</span>
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Ticket Items */}
                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                        {ticket.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col">
                            <div className="flex justify-between items-start">
                              <span className={`font-bold text-zinc-900 dark:text-zinc-100 ${fontClasses.body}`}>
                                {item.qty}x {item.name}
                              </span>
                            </div>
                            {item.notes && (
                              <span className={`text-orange-400 font-semibold italic mt-0.5 pl-3 border-l-2 border-orange-500/30 ${fontClasses.notes}`}>
                                * {item.notes}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Completion Action */}
                    {ticket.status === "OPEN" && (
                      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                        <Button
                          onClick={() => handleCompleteTicket(ticket.id)}
                          className="w-full justify-center bg-white text-black hover:bg-zinc-200 py-2.5 font-bold transition-all text-xs rounded-lg"
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* All Day Prep Panel Drawer */}
        <aside className="glass-panel w-72 rounded-2xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-sky-500 dark:text-sky-400" /> All-Day Summary
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold uppercase">
              Prep
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {allDayPrep.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs">
                No active items to prepare.
              </div>
            ) : (
              allDayPrep.map(([name, count]) => (
                <div
                  key={name}
                  className="flex justify-between items-center p-3 bg-white border border-black/5 dark:bg-black/20 dark:border-white/5 rounded-xl hover:border-black/10 dark:hover:border-black/10 dark:border-white/10 transition-colors"
                >
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{name}</span>
                  <span className="text-xs px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-black">
                    {count}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* KDS Settings Dialog overlay modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl text-zinc-900 dark:text-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-400" /> KDS Display Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-black/5 dark:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sound & Notifications Settings */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider">
                  Audio & Sound Controls
                </h4>
                <div className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    {soundsEnabled ? (
                      <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">Chime Alerts</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Play chiming sounds on ticket updates</p>
                    </div>
                  </div>
                  <button
                    onClick={() => saveSounds(!soundsEnabled)}
                    className={`text-xs px-4 py-2 font-bold rounded-lg border transition-all cursor-pointer ${
                      soundsEnabled
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {soundsEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {soundsEnabled && (
                  <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                    <label className="text-xs font-semibold block text-zinc-700 dark:text-zinc-300">
                      Chime Volume: {Math.round(soundVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={soundVolume}
                      onChange={e => saveVolume(parseFloat(e.target.value))}
                      className="w-full accent-sky-400"
                    />
                  </div>
                )}
              </div>

              {/* Layout and Font controls */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider">
                  Sizing & Density
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Text Size Toggle */}
                  <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Text Size</p>
                    <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg p-1 text-xs">
                      {(["sm", "md", "lg"] as const).map(sz => (
                        <button
                          key={sz}
                          onClick={() => saveTextSize(sz)}
                          className={`flex-1 text-center py-2 rounded-md font-bold transition-all cursor-pointer ${
                            textSize === sz ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {sz === "sm" ? "Small" : sz === "md" ? "Medium" : "Large"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Density Toggle */}
                  <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Grid Layout Density</p>
                    <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg p-1 text-xs">
                      {(["compact", "standard", "spacious"] as const).map(den => (
                        <button
                          key={den}
                          onClick={() => saveDensity(den)}
                          className={`flex-1 text-center py-2 rounded-md font-bold transition-all cursor-pointer ${
                            density === den ? "bg-black/10 dark:bg-white/10 text-white" : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {den === "compact" ? "Compact" : den === "standard" ? "Standard" : "Spacious"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 86'd / Inventory Availability Sub-Panel */}
              <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider flex items-center gap-1.5">
                    <PackageX className="w-4 h-4 text-sky-400" /> Manage Unavailable (86'd) Items
                  </h4>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search menu items to 86..."
                    className="w-full bg-white/50 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-3.5" />
                </div>

                <div className="border border-black/5 dark:border-white/5 rounded-xl max-h-48 overflow-y-auto p-2 bg-black/20 divide-y divide-white/5">
                  {filteredPosItems.length === 0 ? (
                    <div className="text-center py-6 text-zinc-400 dark:text-zinc-500 text-xs">
                      No matching POS items.
                    </div>
                  ) : (
                    filteredPosItems.map(item => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2.5 px-2 hover:bg-black/5 dark:bg-white/5 transition-colors"
                      >
                        <span className={`text-sm font-semibold ${item.is_sold_out ? "text-zinc-400 dark:text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-100"}`}>
                          {item.name}
                        </span>
                        <button
                          onClick={() => handleToggleSoldOut(item.id, item.is_sold_out)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            item.is_sold_out
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-black/5 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10"
                          }`}
                        >
                          {item.is_sold_out ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" /> Sold Out (86'd)
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" /> Available
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: app/(dashboard)/pos/page.tsx
```typescript
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@soustools/ui";
import { 
  ShoppingBag, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  DollarSign, 
  ChevronRight,
  Info,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Zod schemas for POS Cart State
const CartItemModifierSchema = z.object({
  id: z.string(),
  external_id: z.string().nullable(),
  name: z.string(),
  price: z.number()
});

const CartItemSchema = z.object({
  id: z.string(),
  external_id: z.string().nullable(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  modifiers: z.array(CartItemModifierSchema)
});

const CartSchema = z.array(CartItemSchema);

type CartItem = z.infer<typeof CartItemSchema>;
type CartItemModifier = z.infer<typeof CartItemModifierSchema>;

export default function POSRegisterPage() {
  const [items, setItems] = useState<any[]>([]);
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [modifierOptions, setModifierOptions] = useState<any[]>([]);
  const [itemModifierLinks, setItemModifierLinks] = useState<any[]>([]);
  const [orgId, setOrgId] = useState<string>("d0000000-0000-0000-0000-000000000000");
  const [loading, setLoading] = useState(true);
  
  // Search & Categories
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modifiers Selection Modal State
  const [selectedItemForModifiers, setSelectedItemForModifiers] = useState<any | null>(null);
  const [activeModGroupsForSelected, setActiveModGroupsForSelected] = useState<any[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, CartItemModifier[]>>({});

  // Tender Modal State
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [tenderMethod, setTenderMethod] = useState<"CASH" | "CARD" | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [submittingCheckout, setSubmittingCheckout] = useState(false);

  // Load POS synced catalog data from Supabase
  const loadPOSCatalog = async () => {
    setLoading(true);
    try {
      // 1. Fetch organization
      const { data: orgData } = await supabase.from("organizations").select("id").limit(1);
      const targetOrgId = orgData?.[0]?.id || "d0000000-0000-0000-0000-000000000000";
      setOrgId(targetOrgId);

      // 2. Fetch POS items
      const { data: posItems } = await supabase
        .from("pos_items")
        .select("*")
        .eq("organization_id", targetOrgId);
      
      // 3. Fetch modifier groups
      const { data: modGroups } = await supabase
        .from("pos_modifier_groups")
        .select("*")
        .eq("organization_id", targetOrgId);

      // 4. Fetch modifier options
      const { data: modOptions } = await supabase
        .from("pos_modifier_options")
        .select("*")
        .eq("organization_id", targetOrgId);

      // 5. Fetch POS item modifier group links
      const { data: links } = await supabase
        .from("pos_item_modifier_groups")
        .select("*");

      if (posItems) setItems(posItems);
      if (modGroups) setModifierGroups(modGroups);
      if (modOptions) setModifierOptions(modOptions);
      if (links) setItemModifierLinks(links);

    } catch (e: any) {
      toast.error(`Failed to load POS catalog: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPOSCatalog();
  }, []);

  // Sync catalog from Square
  const handleSyncSquare = async () => {
    const toastId = toast.loading("Syncing catalog with Square...");
    try {
      const res = await fetch(`/api/integrations/square/sync?orgId=${orgId}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("POS Catalog synced successfully.", { id: toastId });
      loadPOSCatalog();
    } catch (e: any) {
      toast.error(`Sync failed: ${e.message}`, { id: toastId });
    }
  };

  // Assign items to mock UI categories dynamically based on names
  const getCategory = (itemName: string) => {
    const name = itemName.toLowerCase();
    if (name.includes("burger") || name.includes("sandwich") || name.includes("steak") || name.includes("salmon")) {
      return "Mains";
    }
    if (name.includes("salad") || name.includes("fries") || name.includes("soup") || name.includes("tater")) {
      return "Sides/Salads";
    }
    if (name.includes("beer") || name.includes("ipa") || name.includes("drink") || name.includes("soda") || name.includes("water")) {
      return "Beverages";
    }
    return "Other";
  };

  const categories = ["All", "Mains", "Sides/Salads", "Beverages", "Other"];

  // Filtered items list
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || getCategory(item.name) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Tap Item: Check for required modifiers first
  const handleItemTap = (item: any) => {
    if (item.is_sold_out) {
      toast.error(`${item.name} is currently sold out (86'd).`);
      return;
    }

    // Find links for this item
    const linkedGroupIds = itemModifierLinks
      .filter(link => link.pos_item_id === item.id)
      .map(link => link.modifier_group_id);

    const linkedGroups = modifierGroups.filter(g => linkedGroupIds.includes(g.id));

    // Check if any modifier group is required (min_required > 0)
    // Or if the item simply has modifiers, we open the modal to allow customization
    if (linkedGroups.length > 0) {
      setSelectedItemForModifiers(item);
      setActiveModGroupsForSelected(linkedGroups);
      
      // Initialize selected modifiers state
      const initialMods: Record<string, CartItemModifier[]> = {};
      linkedGroups.forEach(g => {
        initialMods[g.id] = [];
      });
      setSelectedModifiers(initialMods);
    } else {
      // Add directly to cart if no modifiers
      addToCartDirect(item, []);
    }
  };

  const addToCartDirect = (item: any, selectedMods: CartItemModifier[]) => {
    const cartItem: CartItem = {
      id: `${item.id}-${selectedMods.map(m => m.id).sort().join("-")}`, // unique cart key based on item + chosen mods
      external_id: item.external_id,
      name: item.name,
      price: item.price,
      quantity: 1,
      modifiers: selectedMods
    };

    setCart(prev => {
      const existingIdx = prev.findIndex(ci => ci.id === cartItem.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        // Validate with Zod
        const result = CartSchema.safeParse(updated);
        if (result.success) return result.data;
        return prev;
      }
      const updated = [...prev, cartItem];
      const result = CartSchema.safeParse(updated);
      if (result.success) return result.data;
      return prev;
    });

    toast.success(`Added ${item.name} to ticket.`);
  };

  // Modifiers Selection Handlers
  const handleModifierToggle = (group: any, option: any) => {
    const currentSelected = selectedModifiers[group.id] || [];
    const isSelected = currentSelected.some(m => m.id === option.id);

    let updated: CartItemModifier[] = [];
    if (isSelected) {
      updated = currentSelected.filter(m => m.id !== option.id);
    } else {
      // Validate max_allowed
      if (group.max_allowed && currentSelected.length >= group.max_allowed) {
        if (group.max_allowed === 1) {
          // If single choice, replace it
          updated = [{ id: option.id, external_id: option.external_id, name: option.name, price: Number(option.price) }];
        } else {
          toast.warning(`Maximum of ${group.max_allowed} selections allowed for ${group.name}.`);
          return;
        }
      } else {
        updated = [...currentSelected, { id: option.id, external_id: option.external_id, name: option.name, price: Number(option.price) }];
      }
    }

    setSelectedModifiers(prev => ({
      ...prev,
      [group.id]: updated
    }));
  };

  const handleAddWithModifiers = () => {
    if (!selectedItemForModifiers) return;

    // Validate min_required for all groups
    for (const group of activeModGroupsForSelected) {
      const selections = selectedModifiers[group.id] || [];
      if (group.min_required && selections.length < group.min_required) {
        toast.error(`Please select at least ${group.min_required} options for ${group.name}.`);
        return;
      }
    }

    // Flatten all selected modifiers
    const allMods = Object.values(selectedModifiers).flat();
    addToCartDirect(selectedItemForModifiers, allMods);
    setSelectedItemForModifiers(null);
  };

  // Cart Adjustments
  const updateCartQty = (itemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const nextQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, nextQty) };
        }
        return item;
      });
      const result = CartSchema.safeParse(updated);
      if (result.success) return result.data;
      return prev;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item removed from ticket.");
  };

  // Math Calculations
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const modifiersCost = item.modifiers.reduce((sum, m) => sum + m.price, 0);
      return total + (item.price + modifiersCost) * item.quantity;
    }, 0);
  };

  const subtotal = getSubtotal();
  const tax = subtotal * 0.0825; // 8.25% sales tax
  const total = subtotal + tax;

  // Checkout submission
  const handleProcessCheckout = async () => {
    if (cart.length === 0) return;
    setSubmittingCheckout(true);

    // Build driver order payload
    const orderData = {
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers.map(m => ({
          external_id: m.external_id,
          name: m.name
        }))
      }))
    };

    try {
      // 1. POST explicitly to integrations checkout (driver layer)
      const res = await fetch("/api/integrations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          orderData
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      // 2. Play Audio success resolution chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        osc.type = "sine";
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.warn(e);
      }

      toast.success("Order processed successfully. Synced to Square POS API.");
      setCart([]);
      setShowTenderModal(false);
      setTenderMethod(null);
      setCashReceived("");
    } catch (e: any) {
      toast.error(`Checkout failed: ${e.message}`);
    } finally {
      setSubmittingCheckout(false);
    }
  };

  const cashChange = tenderMethod === "CASH" && parseFloat(cashReceived) >= total
    ? (parseFloat(cashReceived) - total).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-[calc(100vh-100px)] flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-slate-100 overflow-hidden relative">
      {/* Left pane: POS item catalog (Fluid Grid) */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto min-w-0 pr-4">
        {/* Search & Sync Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
          <div className="relative flex-1 max-w-md w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search POS catalog..."
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
            />
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-3.5" />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSyncSquare} className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 flex items-center gap-1.5 py-2">
              <RefreshCw className="w-4 h-4" /> Sync Square Catalog
            </Button>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex gap-2 pb-4 overflow-x-auto shrink-0 border-b border-black/5 dark:border-white/5 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
                selectedCategory === cat 
                  ? "bg-white text-black border-white"
                  : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 border-black/5 dark:border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Item Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 p-8">
            <Info className="w-12 h-12 text-zinc-600 mb-2" />
            <p className="font-semibold text-zinc-500 dark:text-zinc-400 text-lg">No items match search criteria.</p>
            <p className="text-sm mt-0.5">Please check spelling or sync catalog again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filteredItems.map((item) => {
              const hasMods = itemModifierLinks.some(l => l.pos_item_id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemTap(item)}
                  className={`glass-panel p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all cursor-pointer relative overflow-hidden group ${
                    item.is_sold_out 
                      ? "border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 opacity-55"
                      : "border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 hover:border-white/20 active:scale-98 shadow-md"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-sky-400 transition-colors">
                        {item.name}
                      </h3>
                      {hasMods && !item.is_sold_out && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold shrink-0">MODS</span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <span className="text-sm font-black text-white">${Number(item.price).toFixed(2)}</span>
                    {item.is_sold_out && (
                      <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">86'd</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right pane: Sticky Cart/Ticket Pane */}
      <aside className="glass-panel w-[360px] border-l border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md flex flex-col overflow-hidden shrink-0">
        <header className="px-5 py-4 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-sky-400" /> Current Ticket
          </h2>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </header>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 text-center py-20 px-4">
              <ShoppingBag className="w-10 h-10 text-zinc-700 mb-2" />
              <p className="font-bold text-zinc-500 dark:text-zinc-400">Cart is empty</p>
              <p className="text-xs mt-0.5 text-zinc-400 dark:text-zinc-500">Tap items on the left to add them to this ticket.</p>
            </div>
          ) : (
            cart.map((item) => {
              const modsCost = item.modifiers.reduce((sum, m) => sum + m.price, 0);
              const singleTotal = item.price + modsCost;

              return (
                <div
                  key={item.id}
                  className="p-3 bg-black/20 border border-black/5 dark:border-white/5 rounded-xl flex flex-col justify-between gap-2 relative group hover:border-white/15 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{item.name}</p>
                      {item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pl-2 border-l border-black/10 dark:border-white/10">
                          {item.modifiers.map((m, idx) => (
                            <span key={idx} className="text-[10px] text-zinc-500 dark:text-zinc-400">
                              + {m.name} {m.price > 0 && `(+$${m.price.toFixed(2)})`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-black text-white">${(singleTotal * item.quantity).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg p-0.5">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-white hover:bg-black/5 dark:bg-white/5 rounded transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-white hover:bg-black/5 dark:bg-white/5 rounded transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pricing Summary & Checkout */}
        <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 space-y-4 shrink-0">
          <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8.25%)</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-bold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-black/5 dark:border-white/5">
              <span>Total</span>
              <span className="text-sky-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={() => setShowTenderModal(true)}
            disabled={cart.length === 0}
            className="w-full justify-center bg-sky-500 hover:bg-sky-400 text-white py-3 font-bold rounded-xl shadow-lg shadow-sky-500/10 cursor-pointer disabled:opacity-40"
          >
            Checkout & Tender
          </Button>
        </div>
      </aside>

      {/* Modifier Dialog Overlay */}
      {selectedItemForModifiers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-zinc-900 dark:text-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
            <h3 className="text-lg font-extrabold mb-1 text-white">Customize {selectedItemForModifiers.name}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 border-b border-black/5 dark:border-white/5 pb-2">Select required modifiers before adding to order.</p>

            {/* List Modifier Groups */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1">
              {activeModGroupsForSelected.map((group) => {
                const selections = selectedModifiers[group.id] || [];
                const options = modifierOptions.filter(opt => opt.modifier_group_id === group.id);

                return (
                  <div key={group.id} className="space-y-2 p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-white">{group.name}</h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {group.min_required ? `Requires min: ${group.min_required}` : "Optional"} 
                          {group.max_allowed ? ` (Max: ${group.max_allowed})` : ""}
                        </p>
                      </div>
                      {group.min_required > 0 && selections.length < group.min_required && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase animate-pulse">Required</span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {options.map((opt) => {
                        const isSelected = selections.some(m => m.id === opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleModifierToggle(group, opt)}
                            className={`p-3 rounded-lg border text-left text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                              isSelected
                                ? "bg-sky-500/10 border-sky-500 text-sky-400"
                                : "bg-black/5 dark:bg-black/40 border-black/5 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:bg-white/5"
                            }`}
                          >
                            <span>{opt.name}</span>
                            {Number(opt.price) > 0 && (
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-extrabold">+${Number(opt.price).toFixed(2)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/5 mt-5">
              <button
                type="button"
                onClick={() => setSelectedItemForModifiers(null)}
                className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button onClick={handleAddWithModifiers} className="bg-white text-black hover:bg-zinc-200 text-xs font-bold py-2 rounded-lg">
                Add to Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tender Selection Drawer Overlay */}
      {showTenderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-zinc-900 dark:text-slate-100 flex flex-col">
            <h3 className="text-lg font-extrabold mb-1 text-white">Tender / Complete Sale</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 pb-2 border-b border-black/5 dark:border-white/5">Select payment method for this checkout transaction.</p>

            <div className="space-y-4">
              <div className="flex justify-between text-sm bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 p-4 rounded-xl">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Total Tender Amount:</span>
                <span className="font-black text-sky-400 text-base">${total.toFixed(2)}</span>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setTenderMethod("CASH"); setCashReceived(""); }}
                  className={`p-4 rounded-xl border text-center font-bold flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    tenderMethod === "CASH"
                      ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                      : "bg-black/5 dark:bg-black/40 border-black/5 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:bg-white/5"
                  }`}
                >
                  <DollarSign className="w-6 h-6" />
                  <span>Cash Payment</span>
                </button>

                <button
                  onClick={() => { setTenderMethod("CARD"); setCashReceived(total.toString()); }}
                  className={`p-4 rounded-xl border text-center font-bold flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    tenderMethod === "CARD"
                      ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                      : "bg-black/5 dark:bg-black/40 border-black/5 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:bg-white/5"
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span>Card / Reader</span>
                </button>
              </div>

              {/* Cash Input Details */}
              {tenderMethod === "CASH" && (
                <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Cash Received ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="Enter amount received"
                      className="w-full bg-white/50 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex gap-2">
                    {[total, 10, 20, 50, 100].map((amt, idx) => {
                      const displayAmt = amt === total ? "Exact" : `$${amt}`;
                      const val = amt === total ? total : amt;
                      if (val < total && amt !== total) return null;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCashReceived(val.toFixed(2))}
                          className="flex-1 text-center py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded border border-black/5 dark:border-white/5 cursor-pointer"
                        >
                          {displayAmt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-black/5 dark:border-white/5 text-zinc-500 dark:text-zinc-400">
                    <span>Change Due:</span>
                    <span className="font-extrabold text-green-400 text-sm">${cashChange}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/5 mt-6">
              <button
                onClick={() => { setShowTenderModal(false); setTenderMethod(null); }}
                className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button
                onClick={handleProcessCheckout}
                disabled={!tenderMethod || submittingCheckout || (tenderMethod === "CASH" && (parseFloat(cashReceived) || 0) < total)}
                className="bg-white text-black hover:bg-zinc-200 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                {submittingCheckout ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Complete Tender <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: app/(dashboard)/recipes/[id]/edit/page.tsx
```typescript
import { config } from "@soustools/config";
import { RecipeBuilderClient } from "../../RecipeBuilderClient";

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  let recipe = null;
  let vessels = [];
  let masterIngredients = [];

  try {
    const [recipeRes, vesselsRes, ingRes] = await Promise.all([
      fetch(`${baseUrl}/recipes/${id}`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/ingredients`, { cache: "no-store" })
    ]);
    
    if (recipeRes.ok) {
      const payload = await recipeRes.json();
      recipe = payload.data;
    }
    if (vesselsRes.ok) {
      const payload = await vesselsRes.json();
      vessels = payload.data || [];
    }
    if (ingRes.ok) {
      const payload = await ingRes.json();
      masterIngredients = payload.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch initial builder data:", err);
  }

  if (!recipe) {
    return <div className="p-12 text-center text-zinc-400">Recipe not found.</div>;
  }

  return (
    <div className="py-6 px-4">
      <RecipeBuilderClient 
        initialData={recipe}
        vessels={vessels} 
        masterIngredients={masterIngredients} 
      />
    </div>
  );
}
```

## File: app/(dashboard)/recipes/[id]/page.tsx
```typescript
import { config } from "@soustools/config";
import { RecipeViewerClient } from "./RecipeViewerClient";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  let recipe = null;
  let vessels = [];
  let costData = null;
  let nutritionData = null;
  let versionHistory = [];

  try {
    const [recipeRes, vesselsRes, costRes, nutritionRes, historyRes] = await Promise.all([
      fetch(`${baseUrl}/recipes/${id}`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/${id}/cost`, { cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/recipes/${id}/nutrition`, { cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/recipes/${id}/versions`, { cache: "no-store" }).catch(() => null)
    ]);
    
    if (recipeRes.ok) {
      const payload = await recipeRes.json();
      recipe = payload.data;
    }
    if (vesselsRes.ok) {
      const payload = await vesselsRes.json();
      vessels = payload.data || [];
    }
    if (costRes && costRes.ok) {
      const payload = await costRes.json();
      costData = payload.data || null;
    }
    if (nutritionRes && nutritionRes.ok) {
      const payload = await nutritionRes.json();
      nutritionData = payload.data || null;
    }
    if (historyRes && historyRes.ok) {
      const payload = await historyRes.json();
      versionHistory = payload.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch initial recipe viewer data:", err);
  }

  if (!recipe) {
    return <div className="p-12 text-center text-zinc-400">Recipe not found.</div>;
  }

  return (
    <div className="py-6 px-4">
      <RecipeViewerClient 
        recipe={recipe}
        vessels={vessels}
        costData={costData}
        nutritionData={nutritionData}
        versionHistory={versionHistory}
      />
    </div>
  );
}
```

## File: app/(dashboard)/recipes/[id]/RecipeViewerClient.tsx
```typescript
"use client";

import React, { useState, useMemo } from "react";
import { RecipeViewer, CustomWeightOpts } from "@soustools/domain-recipes";
import { Recipe, VesselProfile } from "@soustools/api-types";
import { toast } from "sonner";
import { calculateRecipeScale } from "@soustools/ui";

export interface RecipeViewerClientProps {
  recipe: Recipe;
  vessels: VesselProfile[];
  costData: any;
  nutritionData: any;
  versionHistory: any[];
}

export function RecipeViewerClient({
  recipe,
  vessels,
  costData,
  nutritionData,
  versionHistory,
}: RecipeViewerClientProps) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [customWeights, setCustomWeights] = useState<
    Record<string, { amount: number; unit: string }>
  >({});

  const scalingOptions: any = {};
  if (Object.keys(customWeights).length > 0) {
    scalingOptions.customIngredientWeights = customWeights;
  } else if (multiplier !== 1.0) {
    scalingOptions.targetYield = recipe.yieldCount * multiplier;
  }

  const { multiplier: finalMultiplier, items: scaledIngredients } = useMemo(() => {
    return calculateRecipeScale(
      recipe.recipeIngredients || [],
      recipe.yieldCount,
      scalingOptions
    );
  }, [recipe.recipeIngredients, recipe.yieldCount, scalingOptions]);

  const handleScaleChange = (mult: number, customOpts?: CustomWeightOpts) => {
    if (customOpts && customOpts.mode === "weight") {
      const { multiplier: m } = calculateRecipeScale(
        recipe.recipeIngredients || [],
        recipe.yieldCount,
        {
          targetTotalWeight: customOpts.weight,
        }
      );
      setMultiplier(m);
    } else {
      setMultiplier(mult);
    }
    setCustomWeights({});
  };

  const handleIngredientWeightChange = (
    ingId: string,
    amount: number,
    unit: string
  ) => {
    if (amount > 0) {
      setCustomWeights({ [ingId]: { amount, unit } });
    } else {
      setCustomWeights({});
      setMultiplier(1.0);
    }
  };

  const handleSaveVersion = async () => {
    toast.success("Saved version successfully.");
  };

  const handleRestoreVersion = async (version: any) => {
    toast.success(`Restored version ${version.versionNumber}`);
  };

  const handleDownloadLabel = () => {
    toast.success("Label downloading...");
  };

  const handleSearchItems = async (_query: string) => {
    // Basic stub for wastage item search
    return [];
  };

  const handleSubmitWastage = async (_payload: any) => {
    toast.success("Wastage logged successfully.");
    return true;
  };

  return (
    <RecipeViewer
      recipe={recipe}
      vessels={vessels}
      scaledIngredients={scaledIngredients}
      finalMultiplier={finalMultiplier}
      costData={costData}
      nutritionData={nutritionData}
      versionHistory={versionHistory}
      onScaleChange={handleScaleChange}
      onIngredientWeightChange={handleIngredientWeightChange}
      onSaveVersion={handleSaveVersion}
      onRestoreVersion={handleRestoreVersion}
      onDownloadLabel={handleDownloadLabel}
      onSearchItems={handleSearchItems}
      onSubmitWastage={handleSubmitWastage}
      backHref="/recipes"
    />
  );
}
```

## File: app/(dashboard)/recipes/new/page.tsx
```typescript
import { config } from "@soustools/config";
import { RecipeBuilderClient } from "../RecipeBuilderClient";

export default async function NewRecipePage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  let vessels = [];
  let masterIngredients = [];

  try {
    const [vesselsRes, ingRes] = await Promise.all([
      fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/ingredients`, { cache: "no-store" })
    ]);
    
    if (vesselsRes.ok) {
      const payload = await vesselsRes.json();
      vessels = payload.data || [];
    }
    if (ingRes.ok) {
      const payload = await ingRes.json();
      masterIngredients = payload.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch initial builder data:", err);
  }

  return (
    <div className="py-6 px-4">
      <RecipeBuilderClient 
        vessels={vessels} 
        masterIngredients={masterIngredients} 
      />
    </div>
  );
}
```

## File: app/(dashboard)/recipes/page.tsx
```typescript
import { config } from "@soustools/config";
import { RecipesClientPage } from "./RecipesClientPage";

export default async function RecipesPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  let recipes = [];
  try {
    const res = await fetch(`${baseUrl}/recipes`, { cache: "no-store" });
    if (res.ok) {
      const payload = await res.json();
      recipes = payload.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch recipes:", err);
  }

  return (
    <div className="py-6 px-4">
      <RecipesClientPage initialRecipes={recipes} />
    </div>
  );
}
```

## File: app/(dashboard)/recipes/RecipeBuilderClient.tsx
```typescript
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RecipeBuilder } from "@soustools/domain-recipes";
import { Recipe, VesselProfile, MasterIngredient } from "@soustools/api-types";
import { toast } from "sonner";

export interface RecipeBuilderClientProps {
  initialData?: Recipe | null;
  vessels: VesselProfile[];
  masterIngredients: MasterIngredient[];
}

export function RecipeBuilderClient({
  initialData,
  vessels,
  masterIngredients,
}: RecipeBuilderClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (payload: any) => {
    setSaving(true);
    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData ? `/api/recipes/${initialData.id}` : "/api/recipes";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(initialData ? "Recipe updated" : "Recipe created");
        router.push("/recipes");
      } else {
        const error = await res.json();
        toast.error(`Failed to save: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving recipe");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RecipeBuilder
      initialData={initialData}
      vessels={vessels}
      masterIngredients={masterIngredients}
      loading={saving}
      onSave={handleSave}
      backHref="/recipes"
    />
  );
}
```

## File: app/(dashboard)/recipes/RecipesClientPage.tsx
```typescript
"use client";

import React, { useState } from "react";
import { RecipeList } from "@soustools/domain-recipes";
import { Recipe } from "@soustools/api-types";
import { toast } from "sonner";

export function RecipesClientPage({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
        toast.success("Recipe deleted");
      } else {
        toast.error("Failed to delete recipe");
      }
    } catch (err) {
      toast.error("Error deleting recipe");
    }
  };

  return <RecipeList recipes={recipes} onDelete={handleDelete} />;
}
```

## File: app/(dashboard)/settings/page.tsx
```typescript
import { config } from "@soustools/config";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  let integrations = [];
  try {
    const res = await fetch(`${baseUrl}/integrations/status`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      integrations = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load integrations status", err);
  }

  // Stub data for global styling tokens and user profile
  // In a real app, these would be fetched from the API as well
  const initialTokens = {};
  const userProfile = {
    name: "Admin User",
    email: "admin@soustools.local",
    role: "admin",
  };

  const isDev = process.env.NODE_ENV === "development";

  return (
    <SettingsClient
      integrations={integrations}
      isDev={isDev}
      initialTokens={initialTokens}
      userProfile={userProfile}
    />
  );
}
```

## File: app/(dashboard)/settings/settings-client.tsx
```typescript
"use client";

import React, { useState, useEffect } from "react";
import {
  IntegrationsPanel,
  GlobalStylingSettings,
  GeneralSettings,
  DownloadsPanel,
  SettingsFormValues,
} from "@soustools/domain-settings";
import { Settings, Sliders, Cable, Paintbrush } from "lucide-react";
import type { IntegrationStatus, GlobalDesignTokens } from "@soustools/api-types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface SettingsClientProps {
  integrations: IntegrationStatus[];
  isDev: boolean;
  initialTokens: GlobalDesignTokens;
  userProfile: {
    name: string;
    email: string;
    role: string;
  };
}

export function SettingsClient({
  integrations,
  isDev,
  initialTokens,
  userProfile,
}: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "general" | "integrations" | "styling" | "downloads"
  >("general");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "integrations") {
        setActiveTab("integrations");
      } else if (tab === "styling") {
        setActiveTab("styling");
      } else if (tab === "downloads") {
        setActiveTab("downloads");
      }
    }
  }, []);

  const handleSaveGeneral = async (_data: SettingsFormValues) => {
    // Stub: send to API
    toast.success("General settings saved!");
  };

  const handleSaveTokens = async (_tokens: GlobalDesignTokens) => {
    // Stub: send to API
    toast.success("Tokens saved!");
  };

  const handleConnectIntegration = (provider: string) => {
    window.location.href = `/api/integrations/connect/${provider.toLowerCase()}?orgId=default`;
  };

  const handleDisconnectIntegration = async (provider: string) => {
    const res = await fetch(`/api/integrations/disconnect/${provider.toLowerCase()}?orgId=default`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to disconnect");
    router.refresh();
  };

  const handleSquareAction = async (action: "sync" | "seed") => {
    const res = await fetch(`/api/integrations/square/${action}?orgId=default`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`Failed to ${action}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-zinc-900 dark:text-slate-100 animate-in fade-in">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-slate-100">
          <Settings className="w-6 h-6 text-sky-500 animate-pulse" />
          Settings Panel
        </h1>
        <p className="text-xs text-slate-400">
          Configure global kitchen parameters, system integration profiles, and
          tenant design tokens.
        </p>
      </header>

      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1">
        {(["general", "integrations", "styling", "downloads"] as const).map(
          (tab) => {
            const icons = {
              general: Sliders,
              integrations: Cable,
              styling: Paintbrush,
              downloads: () => (
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
              ),
            };
            const Icon = icons[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer capitalize ${
                  activeTab === tab
                    ? "border-sky-500 text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/5"
                    : "border-transparent text-zinc-500 dark:text-slate-400 hover:text-zinc-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-card/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab === "styling" ? "Global Styling" : tab}
              </button>
            );
          }
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950/40 border border-black/10 dark:border-zinc-900 shadow-2xl backdrop-blur-2xl">
        {activeTab === "general" && (
          <GeneralSettings initialData={userProfile} onSave={handleSaveGeneral} />
        )}
        {activeTab === "integrations" && (
          <IntegrationsPanel
            integrations={integrations}
            isDev={isDev}
            onConnect={handleConnectIntegration}
            onDisconnect={handleDisconnectIntegration}
            onSquareAction={handleSquareAction}
          />
        )}
        {activeTab === "styling" && (
          <GlobalStylingSettings initialTokens={initialTokens} onSave={handleSaveTokens} />
        )}
        {activeTab === "downloads" && <DownloadsPanel />}
      </div>
    </div>
  );
}
```

## File: app/(dashboard)/signage/[deckId]/preview/page.tsx
```typescript
import React from "react";
import { use } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { config } from "@soustools/config";

interface Params {
  deckId: string;
}

interface DeckData {
  id: string;
  name: string;
  slug: string;
  config?: { slides?: unknown[] };
}

async function fetchDeck(deckId: string): Promise<DeckData | null> {
  try {
    const base = config.APP_BASE_URL;
    const res = await fetch(`${base}/api/signage/layouts/${deckId}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

/** Full-page fallback shown when navigating directly to /signage/[deckId]/preview (not intercepted). */
export default async function DeckPreviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { deckId } = await use(params);
  const deck = await fetchDeck(deckId);

  const liveBase = config.TV_BASE_URL;
  const liveUrl = deck
    ? `${liveBase}/s/dtown-cafe/${deck.slug}`
    : null;

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-400 dark:text-zinc-500">
        <p>Deck not found.</p>
        <Link href="/signage" className="mt-4 text-xs text-primary hover:underline">
          ← Back to Decks
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{deck.name}</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
            {deck.config?.slides?.length ?? 0} slides
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/signage"
            className="px-3 py-1.5 text-xs border border-black/10 dark:border-white/10 hover:border-white/20 text-zinc-700 dark:text-zinc-300 rounded-lg transition"
          >
            ← Decks
          </Link>
          <Link
            href={`/signage/${deckId}`}
            className="px-3 py-1.5 text-xs bg-primary hover:bg-primary/90 text-white rounded-lg transition font-semibold"
          >
            Open Editor
          </Link>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-black/10 dark:border-white/10 hover:border-white/20 text-zinc-700 dark:text-zinc-300 rounded-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Live View
            </a>
          )}
        </div>
      </div>

      {liveUrl && (
        <div className="relative w-full rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-black" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={liveUrl}
            title={deck.name}
            className="absolute inset-0 w-full h-full border-none"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}
    </div>
  );
}
```

## File: app/(dashboard)/signage/[deckId]/page.tsx
```typescript
import React from "react";
import TVSignageEditorClient from "./tv-signage-editor-client";
import { config } from "@soustools/config";
import { cookies } from "next/headers";
import { createServerClient } from "@soustools/supabase";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default async function TVSignageEditorPage({ params }: PageProps) {
  const { deckId } = await params;
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  let deck = null;
  let items = [];

  try {
    const [deckRes, itemsRes, orgRes] = await Promise.all([
      fetch(`${baseUrl}/signage/layouts/${deckId}`, { cache: "no-store" }),
      fetch(`${baseUrl}/pos-simulator/items`, { cache: "no-store" }),
      supabase.from("organizations").select("design_tokens").limit(1).single()
    ]);

    if (deckRes.ok) {
      const data = await deckRes.json();
      deck = data.data;
    }

    if (itemsRes.ok) {
      const data = await itemsRes.json();
      items = data.data || [];
    }

    if (deck && deck.config && orgRes.data?.design_tokens) {
      deck.config.designTokens = orgRes.data.design_tokens;
    }

  } catch (err) {
    console.error("Failed to fetch signage deck editor data:", err);
  }

  return <TVSignageEditorClient deckId={deckId} initialDeck={deck} initialItems={items} />;
}
```

## File: app/(dashboard)/signage/[deckId]/tv-signage-editor-client.tsx
```typescript
"use client";

import React, { useState, useEffect } from "react";
import { LayoutBuilder, MOCK_POS_ITEMS } from "@soustools/domain-signage";
import { SignageLayoutConfig, PosItem } from "@soustools/api-types";
import { io } from "socket.io-client";
import { mapDbItemToPosItem, RawDbPosItem } from "../../../display/[id]/helpers";
import { config as appConfig } from "@soustools/config";
import { useRouter } from "next/navigation";

interface SignageDeck {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  config: SignageLayoutConfig;
}

interface TVSignageEditorClientProps {
  deckId: string;
  initialDeck: SignageDeck | null;
  initialItems: RawDbPosItem[];
}

export default function TVSignageEditorClient({ deckId, initialDeck, initialItems }: TVSignageEditorClientProps) {
  const [deck, setDeck] = useState<SignageDeck | null>(initialDeck);
  const [items, setItems] = useState<PosItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map(mapDbItemToPosItem);
    }
    return MOCK_POS_ITEMS;
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setDeck(initialDeck);
  }, [initialDeck]);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems.map(mapDbItemToPosItem));
    } else {
      setItems(MOCK_POS_ITEMS);
    }
  }, [initialItems]);

  useEffect(() => {
    const socketUrl = appConfig.API_BASE_URL || window.location.origin;
    const socket = io(socketUrl, {
      query: { deckId },
    });

    socket.on("connect", () => {
      socket.emit("join", { deckId });
    });

    socket.on("items_updated", (payload: { deckId: string; items: RawDbPosItem[] }) => {
      if (payload.deckId === deckId && payload.items) {
        const parsedItems = payload.items.map(mapDbItemToPosItem);
        setItems(parsedItems);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [deckId]);

  const handleSave = async (newConfig: SignageLayoutConfig) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/signage/layouts/${deckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: newConfig }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDeck(data.data);
        router.refresh();
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRenameDeck = async (name: string, slug: string) => {
    try {
      const res = await fetch(`/api/signage/layouts/${deckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDeck(data.data);
        router.refresh();
      }
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-900 dark:text-slate-100">
        <h2 className="text-xl font-bold text-red-400">Deck Not Found</h2>
        <p className="text-sm text-slate-400 mt-2">The requested slide deck could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="-m-6 h-[calc(100vh-4rem)] overflow-hidden">
      <LayoutBuilder
        deckId={deckId}
        deckSlug={deck.slug}
        layoutName={deck.name}
        initialConfig={deck.config}
        items={items}
        onSave={handleSave}
        onRenameDeck={handleRenameDeck}
        saving={saving}
      />
    </div>
  );
}
```

## File: app/(dashboard)/signage/decks-list-client.tsx
```typescript
"use client";

import React, { useState } from "react";
import { DeckCard } from "@soustools/domain-signage";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { SignageLayoutConfig } from "@soustools/api-types";

interface SignageDeck {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  config: SignageLayoutConfig;
}

interface DecksListClientProps {
  initialDecks: SignageDeck[];
}

export function DecksListClient({ initialDecks }: DecksListClientProps) {
  const [creating, setCreating] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setCreating(true);
    try {
      const name = `Deck ${initialDecks.length + 1}`;
      const res = await fetch("/api/signage/layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        router.push(`/signage/${data.data.id}`);
      } else {
        alert(data.error || "Failed to create deck");
      }
    } catch (err) {
      console.error("Failed to create deck:", err);
      alert("Network error: Failed to create deck");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeckToDelete(id);
  };

  const confirmDelete = async () => {
    if (!deckToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/signage/layouts/${deckToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || "Failed to delete deck");
      }
    } catch (err) {
      console.error("Failed to delete deck:", err);
      alert("Network error: Failed to delete deck");
    } finally {
      setIsDeleting(false);
      setDeckToDelete(null);
    }
  };

  const handleRename = async (id: string, name: string, slug: string) => {
    try {
      const res = await fetch(`/api/signage/layouts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || "Failed to rename deck");
      }
    } catch (err) {
      console.error("Failed to rename deck:", err);
      alert("Network error: Failed to rename deck");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-brand">
            My Slide Decks
          </h1>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Manage and assign layout decks for digital signage screens.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer"
        >
          {creating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Deck
        </button>
      </div>

      {initialDecks.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-2xl p-16 text-center">
          <p className="text-slate-400 font-sans mb-4">
            No slide decks created yet.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer"
          >
            Create Your First Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </div>
      )}

      {deckToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Deck</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete this deck? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeckToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: app/(dashboard)/signage/page.tsx
```typescript
import { config } from "@soustools/config";
import { DecksListClient } from "./decks-list-client";

export default async function TVSignageListPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  let decks = [];

  try {
    const res = await fetch(`${baseUrl}/signage/layouts`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      decks = data.data || [];
    }
  } catch (err) {
    console.error("Failed to load decks:", err);
  }

  return <DecksListClient initialDecks={decks} />;
}
```

## File: app/(dashboard)/transactions/page.tsx
```typescript
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Filter,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  quantity_sold: number;
  gross_revenue: number;
  discount_amount: number;
  transaction_time: string;
  source: string;
  external_transaction_id: string;
  pos_items: {
    name: string;
  } | null;
}

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [minVolume, setMinVolume] = useState("");
  const [sortBy, setSortBy] = useState<"transaction_time" | "gross_revenue">("transaction_time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("pos_transactions")
        .select("*, pos_items(name)", { count: "exact" });

      if (sourceFilter !== "all") {
        query = query.eq("source", sourceFilter);
      }

      if (minVolume) {
        query = query.gte("gross_revenue", parseFloat(minVolume));
      }

      // We do the search in-memory or query based on external ID
      if (search) {
        query = query.ilike("external_transaction_id", `%${search}%`);
      }

      // Order
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Range
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      setTransactions((data as any[]) || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      toast.error(`Failed to load transactions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, sourceFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const toggleSort = (field: "transaction_time" | "gross_revenue") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-slate-100">Transactions & Orders</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Audit synced Square sales logs and volume metrics.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-black/5 dark:border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Event/Txn ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 w-full text-xs text-white outline-none focus:border-sky-500 transition-all"
            />
          </div>
          <button type="submit" className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all">
            Find
          </button>
        </form>

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="text-zinc-400 dark:text-zinc-500 w-3.5 h-3.5" />
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 outline-none"
            >
              <option value="all">All Sources</option>
              <option value="square">Square</option>
              <option value="toast">Toast</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="text-zinc-400 dark:text-zinc-500 w-3.5 h-3.5" />
            <input
              type="number"
              placeholder="Min $ Vol"
              value={minVolume}
              onChange={(e) => setMinVolume(e.target.value)}
              onBlur={() => { setPage(1); fetchTransactions(); }}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white w-24 outline-none focus:border-sky-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-zinc-500 dark:text-zinc-400 text-xs font-bold bg-zinc-950/40">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">POS Item</th>
                <th className="p-4">Quantity</th>
                <th className="p-4 cursor-pointer hover:text-white transition-all" onClick={() => toggleSort("gross_revenue")}>
                  Gross Revenue <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4">Discount</th>
                <th className="p-4 cursor-pointer hover:text-white transition-all" onClick={() => toggleSort("transaction_time")}>
                  Transaction Time <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4">Source</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-xs text-zinc-400 dark:text-zinc-500">Auditing sales transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-xs text-zinc-400 dark:text-zinc-500">No matching sales records found.</td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-black/5 dark:border-white/5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:bg-white/5 transition-all">
                    <td className="p-4 font-mono text-zinc-500 dark:text-zinc-400 select-all">{txn.external_transaction_id}</td>
                    <td className="p-4 font-bold text-slate-200">{txn.pos_items?.name || "Unnamed POS Item"}</td>
                    <td className="p-4 font-semibold text-zinc-500 dark:text-zinc-400">{txn.quantity_sold}</td>
                    <td className="p-4 font-bold text-emerald-400">${txn.gross_revenue.toFixed(2)}</td>
                    <td className="p-4 text-zinc-400 dark:text-zinc-500">${txn.discount_amount.toFixed(2)}</td>
                    <td className="p-4 text-zinc-500 dark:text-zinc-400">{new Date(txn.transaction_time).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        txn.source === "square" 
                          ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          : "bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-700"
                      }`}>
                        {txn.source}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center bg-zinc-950/20 text-xs">
            <span className="text-zinc-400 dark:text-zinc-500">Showing page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-zinc-800 rounded-xl disabled:opacity-50 hover:bg-black/5 dark:bg-white/5 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-zinc-800 rounded-xl disabled:opacity-50 hover:bg-black/5 dark:bg-white/5 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## File: app/(dashboard)/vendors/page.tsx
```typescript
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vendor } from "@soustools/api-types";
import { toast } from "sonner";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [orderMethod, setOrderMethod] = useState<"EMAIL" | "SMS" | "MANUAL">("EMAIL");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const fetchVendors = async () => {
    const { data } = await supabase.from("vendors").select("*").order("name");
    if (data) setVendors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: orgData } = await supabase.from("organizations").select("id").single();
    
    const { error } = await supabase.from("vendors").insert({
      organization_id: orgData?.id,
      name,
      order_method: orderMethod,
      email,
      phone
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Vendor added");
      setName("");
      setEmail("");
      setPhone("");
      fetchVendors();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("vendors").delete().eq("id", id);
    fetchVendors();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Vendors</h1>
        <p className="text-gray-500 mt-2">Manage your suppliers and procurement contacts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleAdd} className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Add Vendor</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-md p-2 text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Method</label>
              <select value={orderMethod} onChange={e => setOrderMethod(e.target.value as any)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-md p-2 text-white">
                <option value="EMAIL">Email</option>
                <option value="SMS">Text Message</option>
                <option value="MANUAL">Manual / Phone Call</option>
              </select>
            </div>

            {orderMethod === "EMAIL" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-md p-2 text-white" />
              </div>
            )}

            {orderMethod === "SMS" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Phone Number</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-md p-2 text-white" />
              </div>
            )}

            <button type="submit" className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition-colors mt-4">
              Save Vendor
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <div className="h-32 flex items-center justify-center text-white/50">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="glass-panel p-12 text-center text-white/50">No vendors found.</div>
          ) : (
            <div className="space-y-4">
              {vendors.map(v => (
                <div key={v.id} className="glass-panel p-6 flex justify-between items-center group">
                  <div>
                    <h3 className="text-xl font-bold">{v.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Method: {v.order_method} 
                      {v.email && ` • ${v.email}`}
                      {v.phone && ` • ${v.phone}`}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## File: app/(dashboard)/dashboard-content.tsx
```typescript
"use client";

import React from "react";
import { Button } from "@soustools/ui";

/**
 * DashboardPage renders the active order queue for back-of-house staff.
 * It integrates the shared UI Button component and custom anti-glare oklch backgrounds.
 */
export default function DashboardPage() {
  const handleCompleteTicket = (ticketId: string): void => {
    alert(`Ticket ${ticketId} completed!`);
  };

  const handleClockOut = (): void => {
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen p-6 bg-[oklch(0.1_0.01_180)] text-zinc-900 dark:text-slate-100">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-[oklch(0.2_0.02_180)]">
        <div>
          <h1 className="text-2xl font-bold text-[oklch(0.85_0.08_140)]">
            Kitchen Dashboard
          </h1>
          <p className="text-sm text-[oklch(0.65_0.03_180)]">
            Station: Cook Line 1
          </p>
        </div>
        <Button onClick={handleClockOut}>Clock Out</Button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket 1 */}
        <div className="p-4 rounded-xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[oklch(0.75_0.1_40)]">
              Ticket #104
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[oklch(0.3_0.1_40)] text-[oklch(0.85_0.1_40)] font-bold">
              RUSH
            </span>
          </div>
          <p className="text-sm mb-4">2x Truffle Burger (Medium-Rare)</p>
          <div className="flex justify-end">
            <Button onClick={() => handleCompleteTicket("#104")}>
              Complete
            </Button>
          </div>
        </div>

        {/* Ticket 2 */}
        <div className="p-4 rounded-xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[oklch(0.75_0.05_180)]">
              Ticket #105
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
              Normal
            </span>
          </div>
          <p className="text-sm mb-4">1x Caesar Salad, 1x Tomato Soup</p>
          <div className="flex justify-end">
            <Button onClick={() => handleCompleteTicket("#105")}>
              Complete
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
```

## File: app/(dashboard)/layout.tsx
```typescript
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import Sidebar from "../../components/layout/sidebar";
import AppBar from "../../components/layout/app-bar";
import { BottomNav } from "../../components/layout/bottom-nav";

import { config } from "@soustools/config";
import {
  LayoutDashboard,
  Tv,
  Smartphone,
  Calculator,
  ChefHat,
  ShoppingBag,
  BrainCircuit,
  Building2,
  Receipt,
  Database
} from "lucide-react";
import { PrimaryLogo, MicroIcon } from "@soustools/ui";

const BASE_NAV_ITEMS = [
  { label: "Kitchen Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "KDS Screen", href: "/kds", icon: Tv },
  { label: "POS Register", href: "/pos", icon: Calculator },
  { label: "Recipes", href: "/recipes", icon: ChefHat },
  { label: "Signage", href: "/signage", icon: Tv },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Catalog Editor", href: "/catalog", icon: Database },
  { label: "Orders", href: "/inventory/orders", icon: ShoppingBag },
  { label: "Vendors", href: "/inventory/vendors", icon: Building2 },
  { label: "Processing Hub", href: "/ingestion", icon: BrainCircuit },
  { label: "Devices", href: "/devices", icon: Smartphone },
];

/**
 * Props for the DashboardLayout component.
 */
export interface DashboardLayoutProps {
  /** The child views to render within the layout shell. */
  children: React.ReactNode;
  /** Parallel route slot — populated by @modal routes, null otherwise. */
  modal: React.ReactNode;
}

/**
 * DashboardLayout wraps all dashboard sub-routes in a responsive shell.
 * It manages sidebar state (drawer vs collapsed) and enforces Supabase authentication gating.
 *
 * @tenant-docs-export
 * Access to the kitchen portal dashboard is restricted to authorized employees.
 * If your session expires, you will automatically be redirected to the passcode login page.
 */
export default function DashboardLayout({
  children,
  modal,
}: DashboardLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkSessionAndRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push(
            `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          );
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: orgData } = await supabase.from("organizations").select("id").limit(1).single();
          if (orgData?.id) {
            const { data: membership } = await supabase
              .from("org_members")
              .select("role")
              .eq("organization_id", orgData.id)
              .eq("user_id", user.id)
              .limit(1)
              .single();
            if (membership?.role === "admin" && mounted) {
              setIsAdmin(true);
            }
          }
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to retrieve authentication session:", error);
        router.push(
          `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        );
      }
    };

    checkSessionAndRole();

    // Set up auth state change listener to auto-redirect on logout/expiry
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session) {
          router.push(
            `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          );
        } else if (mounted) {
          setIsLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [...BASE_NAV_ITEMS];
  if (config.IS_DEVELOPMENT) {
    navItems.push({ label: "POS Simulator", href: "http://localhost:5009", icon: Calculator });
  }

  return (
    <div className="min-h-screen w-full bg-white text-zinc-900 dark:bg-card dark:text-zinc-100 flex overflow-x-hidden transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        onCloseMobile={() => setIsMobileOpen(false)}
        onToggleDesktop={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        navItems={navItems}
        isAdmin={isAdmin}
        expandedLogo={<PrimaryLogo className="h-10 w-auto text-sky-500" />}
        collapsedIcon={<MicroIcon className="w-8 h-8 text-sky-500" />}
      />

      {/* Main Content Pane */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full max-w-full
          ${isDesktopCollapsed ? "md:pl-16" : "md:pl-16 lg:pl-16 xl:pl-64"}
        `}
      >
        <div className="hidden md:block">
          <AppBar
            isMobileOpen={isMobileOpen}
            onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          />
        </div>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        onToggleMobile={() => setIsMobileOpen(true)} 
        centerIcon={<MicroIcon className="w-8 h-8 text-sky-500" />}
      />

      {/* @modal parallel route slot — renders URL-addressed modals (deck preview, device detail, etc.) */}
      {modal}
    </div>
  );
}
```

## File: app/(fullscreen)/recipes/[id]/kitchen/KitchenClientPage.tsx
```typescript
"use client";

import React, { useState, useEffect } from "react";
import { ActiveKitchen } from "@soustools/domain-recipes";
import { Recipe, KitchenTimerState } from "@soustools/api-types";

export function KitchenClientPage({ recipe }: { recipe: Recipe }) {
  const [timers, setTimers] = useState<KitchenTimerState[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`timers_${recipe.id}`);
    if (saved) {
      try {
        setTimers(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse timers", err);
      }
    }
  }, [recipe.id]);

  const handleUpdateTimers = (newTimers: KitchenTimerState[]) => {
    setTimers(newTimers);
    localStorage.setItem(`timers_${recipe.id}`, JSON.stringify(newTimers));
  };

  return (
    <ActiveKitchen
      recipe={recipe}
      activeTimers={timers}
      onUpdateTimers={handleUpdateTimers}
      backHref={`/recipes/${recipe.id}`}
    />
  );
}
```

## File: app/(fullscreen)/recipes/[id]/kitchen/page.tsx
```typescript
import { config } from "@soustools/config";
import { KitchenClientPage } from "./KitchenClientPage";

interface KitchenPageProps {
  params: Promise<{ id: string }>;
}

export default async function KitchenPage({ params }: KitchenPageProps) {
  const { id } = await params;
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  let recipe = null;
  try {
    const res = await fetch(`${baseUrl}/recipes/${id}`, { cache: "no-store" });
    if (res.ok) {
      const payload = await res.json();
      recipe = payload.data;
    }
  } catch (err) {
    console.error("Failed to fetch recipe for kitchen mode:", err);
  }

  if (!recipe) {
    return <div className="p-12 text-center text-zinc-400">Recipe not found.</div>;
  }

  return (
    <div className="bg-zinc-950 min-h-screen">
      <KitchenClientPage recipe={recipe} />
    </div>
  );
}
```

## File: app/(fullscreen)/layout.tsx
```typescript
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface FullscreenLayoutProps {
  children: React.ReactNode;
}

export default function FullscreenLayout({ children }: FullscreenLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        } else if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to retrieve authentication session:", error);
        router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session) {
          router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        } else if (mounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      {children}
    </div>
  );
}
```

## File: app/display/[id]/column-layout-renderer.tsx
```typescript
"use client";

import React from "react";
import { ColumnConfig, PosItem, MenuItemStyles } from "@soustools/api-types";
import { SingleColumn } from "./single-column";

interface ColumnLayoutRendererProps {
  columns: ColumnConfig[];
  splitRatio?: string;
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

/** Parse a "60/40" splitRatio into flex-basis values for exactly 2 columns. */
function getSplitStyles(
  splitRatio: string | undefined,
  index: number,
  totalCols: number,
): React.CSSProperties {
  if (!splitRatio || totalCols !== 2) return { flex: 1 };
  const parts = splitRatio.split("/").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const pct = index === 0 ? parts[0] : parts[1];
    return { flex: `0 0 ${pct}%` };
  }
  return { flex: 1 };
}

export function ColumnLayoutRenderer({
  columns,
  splitRatio,
  items,
  menuItemStyles,
}: ColumnLayoutRendererProps) {
  return (
    <div className="w-full h-full min-h-screen bg-transparent flex flex-row p-0 gap-0">
      {columns.map((column, index) => {
        const style = getSplitStyles(splitRatio, index, columns.length);
        return (
          <SingleColumn
            key={index}
            column={column}
            index={index}
            style={style}
            items={items}
            menuItemStyles={menuItemStyles}
          />
        );
      })}
    </div>
  );
}
```

## File: app/display/[id]/display-player.tsx
```typescript
"use client";

import React, { useEffect } from "react";
import { useDisplayPlayer } from "./use-display-player";
import { PairingScreen } from "./pairing-screen";
import { SlideCarousel } from "./slide-carousel";
import { buildAllAnimationCss } from "@soustools/domain-signage";
import { SignageDisplay } from "@soustools/api-types";
import { RawDbPosItem } from "./helpers";

interface DisplayPlayerProps {
  displayId: string;
  initialDisplay?: SignageDisplay | null;
  initialLayout?: any | null;
  initialItems?: RawDbPosItem[];
  initialErrorState?: string | null;
}

export function DisplayPlayer({ displayId, initialDisplay, initialLayout, initialItems, initialErrorState }: DisplayPlayerProps) {
  const { display, layout, items, loading, errorState } =
    useDisplayPlayer(displayId, initialDisplay, initialLayout, initialItems, initialErrorState);

  useEffect(() => {
    const config = layout?.config;
    if (!config) return;

    // Aggregate all unique Google Fonts to load
    const fontsToLoad = new Set<string>();
    if (config.googleFont) fontsToLoad.add(config.googleFont);

    // Clean up existing dynamic font links
    document.querySelectorAll("[id^='signage-dynamic-font']").forEach((el) => el.remove());
    Array.from(fontsToLoad).forEach((font, idx) => {
      const link = document.createElement("link");
      link.id = `signage-dynamic-font-${idx}`;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}&display=swap`;
      document.head.appendChild(link);
    });

    // Inject custom CSS
    document.getElementById("signage-custom-css")?.remove();
    if (config.customCss) {
      const style = document.createElement("style");
      style.id = "signage-custom-css";
      style.textContent = config.customCss;
      document.head.appendChild(style);
    }

    // Inject animation keyframes from menuItemStyles
    document.getElementById("signage-item-animations")?.remove();
    if (config.menuItemStyles) {
      const animCss = buildAllAnimationCss(config.menuItemStyles);
      if (animCss) {
        const style = document.createElement("style");
        style.id = "signage-item-animations";
        style.textContent = animCss;
        document.head.appendChild(style);
      }
    }
  }, [layout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white">
        <div className="w-8 h-8 border-4 border-t-transparent border-[oklch(0.60_0.25_250)] rounded-full animate-spin" />
      </div>
    );
  }

  if (errorState && !display) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white p-6">
        <h2 className="text-2xl font-bold text-[oklch(0.60_0.25_25)] mb-2 font-brand">
          Display Load Failed
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-sans">{errorState}</p>
      </div>
    );
  }

  if (display && !display.deckId) {
    return <PairingScreen code={display.id.slice(0, 8).toUpperCase()} />;
  }

  const slides = layout?.config?.slides || [];
  const menuItemStyles = layout?.config?.menuItemStyles;

  return (
    <main
      className="min-h-screen bg-[oklch(0.08_0.01_260)] text-white"
      style={{
        fontFamily: layout?.config?.googleFont || "inherit",
        // CSS variables for typography overrides
        ["--menu-title-font" as any]: layout?.config?.typography?.menuItemTitle || "inherit",
        ["--menu-price-font" as any]: layout?.config?.typography?.menuItemPrice || "inherit",
        ["--menu-description-font" as any]: layout?.config?.typography?.menuItemDescription || "inherit",
        ["--marketing-text-font" as any]: layout?.config?.typography?.marketingText || "inherit",
        ["--menu-title-color" as any]: layout?.config?.typography?.menuItemTitleColor || "inherit",
        ["--menu-price-color" as any]: layout?.config?.typography?.menuItemPriceColor || "inherit",
        ["--menu-desc-color" as any]: layout?.config?.typography?.menuItemDescriptionColor || "inherit",
        ["--marketing-text-color" as any]: layout?.config?.typography?.marketingTextColor || "inherit",
      }}
    >
      <SlideCarousel
        slides={slides}
        items={items}
        menuItemStyles={menuItemStyles}
      />
    </main>
  );
}
```

## File: app/display/[id]/helpers.ts
```typescript
import { PosItem } from "@soustools/api-types";

export interface RawDbPosItem {
  id: string;
  organization_id: string;
  pos_provider: "SQUARE" | "TOAST" | "MANUAL";
  external_id: string | null;
  name: string;
  description: string | null;
  price: string | number;
  image_url: string | null;
  is_sold_out: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a database representation of a POS item to a standard POS item.
 *
 * @param item - The raw database POS item.
 * @returns The standard typed POS item.
 */
export function mapDbItemToPosItem(item: RawDbPosItem): PosItem {
  return {
    id: item.id,
    organizationId: item.organization_id,
    posProvider: item.pos_provider,
    externalId: item.external_id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    imageUrl: item.image_url,
    isSoldOut: item.is_sold_out,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

/**
 * Registers a display device with the backend service.
 *
 * @param displayId - The custom name or ID of the display device.
 * @returns The registered display ID, or null if registration fails.
 */
export async function registerDisplayDevice(displayId: string): Promise<string | null> {
  const registerUrl = `${window.location.protocol}//${window.location.hostname}:6000/signage/displays/pair/register`;
  try {
    const res = await fetch(registerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Display ${displayId}` }),
    });
    const result = await res.json();
    if (result.success && result.data?.id) {
      return result.data.id;
    }
  } catch (err) {
    console.error("Device registration request failed", err);
  }
  return null;
}
```

## File: app/display/[id]/menu-item-card.tsx
```typescript
"use client";

import React from "react";
import { PosItem, MenuItemStyles, HighlightItemConfig } from "@soustools/api-types";
import {
  buildCardStyle,
  buildTitleStyle,
  buildPriceStyle,
  buildDescriptionStyle,
  resolveItemState,
  isItemHighlighted,
} from "@soustools/domain-signage";

export interface MenuItemCardProps {
  item: PosItem;
  highlightItems?: (string | HighlightItemConfig)[];
  menuItemStyles: MenuItemStyles;
}

export function MenuItemCard({ item, highlightItems, menuItemStyles }: MenuItemCardProps) {
  const highlighted = isItemHighlighted(item, highlightItems);
  const stateStyle = resolveItemState(item, highlighted, menuItemStyles);

  if (stateStyle.hidden && item.isSoldOut) return null;

  const cardStyle = buildCardStyle(stateStyle);
  const titleStyle = buildTitleStyle(stateStyle);
  const priceStyle = buildPriceStyle(stateStyle);
  const descStyle = buildDescriptionStyle(stateStyle);

  return (
    <div
      className="rounded-2xl transition-all duration-300 flex flex-col justify-between border relative"
      style={{ ...cardStyle, overflow: "visible", padding: cardStyle.padding ?? "24px" }}
    >
      {stateStyle.icon && stateStyle.iconPosition === "top-right-corner" && (
        <span className="absolute top-2 right-3 text-xl">{stateStyle.icon}</span>
      )}
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-bold tracking-tight" style={titleStyle}>
            {stateStyle.icon && stateStyle.iconPosition === "before-title" && (
              <span className="mr-1">{stateStyle.icon}</span>
            )}
            {item.name}
            {stateStyle.icon && stateStyle.iconPosition === "after-title" && (
              <span className="ml-1">{stateStyle.icon}</span>
            )}
          </h3>
          <span className="text-lg font-extrabold whitespace-nowrap" style={priceStyle}>
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
        {item.description && (
          <p className="text-sm line-clamp-2" style={descStyle}>
            {item.description}
          </p>
        )}
      </div>
      {stateStyle.badge && (
        <div className="mt-4 flex">
          <span
            className="text-[10px] px-2.5 py-1 font-black uppercase tracking-wider"
            style={{
              backgroundColor: stateStyle.badge.color,
              color: stateStyle.badge.textColor,
              borderRadius: stateStyle.badge.borderRadius ?? "4px",
            }}
          >
            {stateStyle.badge.text}
          </span>
        </div>
      )}
    </div>
  );
}
```

## File: app/display/[id]/menu-slide-renderer.tsx
```typescript
"use client";

import React from "react";
import { ColumnConfig, PosItem, MenuItemStyles } from "@soustools/api-types";
import { MenuItemCard } from "./menu-item-card";

interface MenuSlideRendererProps {
  column: ColumnConfig;
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
}

export function MenuSlideRenderer({ column, items, menuItemStyles }: MenuSlideRendererProps) {
  let activeItems = items;
  if (column.itemIds && column.itemIds.length > 0) {
    activeItems = column.itemIds
      .map((id) => items.find((item) => item.id === id || item.externalId === id))
      .filter((item): item is PosItem => !!item);
  }
  activeItems = activeItems.filter((item) => !item.isSoldOut || !menuItemStyles.soldOut.hidden);

  return (
    <div className="w-full h-full min-h-screen p-12 bg-[oklch(0.08_0.01_260)] flex flex-col justify-start">
      <h2 className="text-3xl font-extrabold tracking-tight text-center mb-10 font-brand text-zinc-800 dark:text-zinc-200">
        Menu Highlights
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[80vh] overflow-y-auto pr-2">
        {activeItems.map((item) => (
          <MenuItemCard key={item.id} item={item} highlightItems={column.highlightItems} menuItemStyles={menuItemStyles} />
        ))}
      </div>
    </div>
  );
}
```

## File: app/display/[id]/page.tsx
```typescript
import React from "react";
import { config } from "@soustools/config";
import { DisplayPlayer } from "./display-player";

export interface DisplayPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DisplayPage({ params }: DisplayPageProps) {
  const resolvedParams = await params;
  const displayId = resolvedParams.id;
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";

  let initialDisplay = null;
  let initialLayout = null;
  let initialItems = [];
  let initialErrorState = null;

  // We only fetch server-side if it's a valid UUID (not a pairing code)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(displayId)) {
    try {
      const displayRes = await fetch(`${baseUrl}/signage/displays/${displayId}`, { cache: "no-store" });
      const displayJson = await displayRes.json();
      
      if (displayJson.success && displayJson.data) {
        const displayData = displayJson.data;
        initialDisplay = {
          id: displayData.id,
          organizationId: displayData.organization_id,
          name: displayData.name,
          deviceId: displayData.device_id ?? null,
          portLabel: displayData.port_label ?? null,
          deckId: displayData.deck_id ?? null,
          lastSeenAt: displayData.last_seen_at,
          createdAt: displayData.created_at,
        };

        if (initialDisplay.deckId) {
          const [layoutRes, itemsRes] = await Promise.all([
            fetch(`${baseUrl}/signage/layouts/${initialDisplay.deckId}`, { cache: "no-store" }),
            fetch(`${baseUrl}/pos-simulator/items?organizationId=${initialDisplay.organizationId}`, { cache: "no-store" }),
          ]);
          
          if (layoutRes.ok) {
            const layoutData = await layoutRes.json();
            if (layoutData.success) initialLayout = layoutData.data;
          }
          if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            if (itemsData.success) initialItems = itemsData.data || [];
          }
        }
      } else {
        initialErrorState = "Display not found";
      }
    } catch (err) {
      console.warn("Server-side fetch failed:", err);
      // Let client handle offline cache fallback
    }
  }

  return (
    <DisplayPlayer 
      displayId={displayId} 
      initialDisplay={initialDisplay}
      initialLayout={initialLayout}
      initialItems={initialItems}
      initialErrorState={initialErrorState}
    />
  );
}
```

## File: app/display/[id]/pairing-screen.tsx
```typescript
"use client";

import React from "react";

interface PairingScreenProps {
  code: string;
}

export function PairingScreen({ code }: PairingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white p-6">
      <div className="glass-panel p-12 rounded-3xl max-w-lg w-full text-center space-y-8 border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[oklch(0.60_0.25_250)] rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[oklch(0.60_0.25_250)] rounded-full blur-3xl opacity-20" />

        <div className="space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[oklch(0.60_0.25_250)]/10 text-[oklch(0.60_0.25_250)]">
            Setup Mode
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-brand">
            Pair Your Display
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter the code below in your dashboard to connect this screen.
          </p>
        </div>

        <div className="flex justify-center items-center py-4">
          <div className="flex gap-3">
            {code.split("").map((char, index) => (
              <div
                key={index}
                className="w-16 h-20 flex items-center justify-center text-4xl font-black rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[oklch(0.60_0.25_250)] shadow-lg shadow-black/30 font-brand"
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-zinc-400 dark:text-zinc-500 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.70_0.25_150)] animate-pulse" />
          <span>Waiting for connection...</span>
        </div>
      </div>
    </div>
  );
}
```

## File: app/display/[id]/single-column.tsx
```typescript
"use client";

import React from "react";
import { ColumnConfig, PosItem, MenuItemStyles } from "@soustools/api-types";
import { MenuItemCard } from "./menu-item-card";
import { DEFAULT_MENU_ITEM_STYLES } from "@soustools/domain-signage";

interface SingleColumnProps {
  column: ColumnConfig;
  index: number;
  style: React.CSSProperties;
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

export function SingleColumn({
  column,
  index,
  style,
  items,
  menuItemStyles = DEFAULT_MENU_ITEM_STYLES,
}: SingleColumnProps) {
  switch (column.type) {
    case "MENU": {
      let columnItems = items;
      if (column.itemIds && column.itemIds.length > 0) {
        columnItems = column.itemIds
          .map((id) => items.find((item) => item.id === id || item.externalId === id))
          .filter((item): item is PosItem => !!item);
      }
      columnItems = columnItems.filter(
        (item) => !(item.isSoldOut && (menuItemStyles.soldOut.hidden ?? false))
      );
      return (
        <div
          key={index}
          style={style}
          className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden w-full h-full p-6"
        >
          {columnItems.length > 0 ? (
            columnItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                highlightItems={column.highlightItems}
                menuItemStyles={menuItemStyles}
              />
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">
              No Menu Items Selected
            </div>
          )}
        </div>
      );
    }
    case "IMAGE":
      return (
        <div
          key={index}
          style={style}
          className="w-full h-full overflow-hidden relative bg-transparent flex items-center justify-center"
        >
          {column.imageUrl ? (
            <img
              src={column.imageUrl}
              alt="Column Media"
              className={`w-full h-full object-${column.fit || "cover"}`}
            />
          ) : (
            <div className="text-zinc-400 dark:text-zinc-500 text-sm">No Image Selected</div>
          )}
        </div>
      );
    case "VIDEO":
      return (
        <div
          key={index}
          style={style}
          className="w-full h-full overflow-hidden relative bg-transparent"
        >
          {column.videoUrl ? (
            <video
              src={column.videoUrl}
              autoPlay
              loop={column.loop !== false}
              muted={column.mute !== false}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm">
              No Video Selected
            </div>
          )}
        </div>
      );
    case "IFRAME":
      return (
        <div
          key={index}
          style={style}
          className="w-full h-full overflow-hidden relative bg-transparent"
        >
          {column.iframeUrl ? (
            <iframe
              src={column.iframeUrl}
              title="Embedded Content"
              className="w-full h-full border-none"
              allow="autoplay; encrypted-media"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm">
              No URL Configured
            </div>
          )}
        </div>
      );
    case "TEXT":
      return (
        <div
          key={index}
          style={style}
          className="w-full h-full flex flex-col justify-center items-center text-center p-8"
        >
          {column.title && (
            <h2
              className="text-3xl font-extrabold tracking-tight mb-4 text-white"
              style={{ fontFamily: "var(--marketing-text-font)", color: "var(--marketing-text-color)" }}
            >
              {column.title}
            </h2>
          )}
          {column.content && (
            <p
              className="text-lg text-zinc-700 dark:text-zinc-300 whitespace-pre-line"
              style={{ fontFamily: "var(--marketing-text-font)", color: "var(--marketing-text-color)" }}
            >
              {column.content}
            </p>
          )}
          {!column.title && !column.content && (
            <div className="text-zinc-400 dark:text-zinc-500 text-sm">No Text Configured</div>
          )}
        </div>
      );
    case "EMPTY":
    default:
      return (
        <div
          key={index}
          style={style}
          className="w-full h-full bg-transparent"
        />
      );
  }
}
```

## File: app/display/[id]/slide-carousel.tsx
```typescript
"use client";

import React, { useEffect, useState } from "react";
import { SignageSlide, PosItem, ColumnLayoutSlide, MenuItemStyles } from "@soustools/api-types";
import { SlideRenderer } from "./slide-renderer";

interface SlideCarouselProps {
  slides: SignageSlide[];
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

export function SlideCarousel({
  slides,
  items,
  menuItemStyles,
}: SlideCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!slides || slides.length <= 1) {
      setVisibleIndex(0);
      setOpacity(1);
      return;
    }

    const currentSlide = slides[currentIndex];
    const durationMs = (currentSlide.durationSeconds || 5) * 1000;

    const transitionStartMs = Math.max(durationMs - 500, 100);
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0);
    }, transitionStartMs);

    const slideChangeTimer = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setCurrentIndex(nextIndex);
      setVisibleIndex(nextIndex);
      setOpacity(1);
    }, durationMs);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(slideChangeTimer);
    };
  }, [currentIndex, slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white font-sans">
        <p className="text-xl text-zinc-500 dark:text-zinc-400">
          No slides configured for this display.
        </p>
      </div>
    );
  }

  const activeSlide = slides[visibleIndex];
  const columnSlide = activeSlide?.type === "COLUMN_LAYOUT" ? (activeSlide as ColumnLayoutSlide) : null;

  const bgStyle: React.CSSProperties = {
    opacity,
    backgroundColor: columnSlide?.backgroundColor || "oklch(0.08 0.01 260)",
  };
  if (columnSlide?.backgroundImageUrl) {
    bgStyle.backgroundImage = `url(${columnSlide.backgroundImageUrl})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  }

  return (
    <div
      className="w-full h-full min-h-screen transition-opacity duration-500 ease-in-out"
      style={bgStyle}
    >
      <SlideRenderer
        slide={activeSlide}
        items={items}
        menuItemStyles={menuItemStyles}
      />
    </div>
  );
}
```

## File: app/display/[id]/slide-renderer.tsx
```typescript
"use client";

import React from "react";
import { SignageSlide, PosItem, MenuItemStyles } from "@soustools/api-types";
import { ColumnLayoutRenderer } from "./column-layout-renderer";

interface SlideRendererProps {
  slide: SignageSlide;
  items: PosItem[];
  menuItemStyles?: MenuItemStyles;
}

export function SlideRenderer({
  slide,
  items,
  menuItemStyles,
}: SlideRendererProps) {
  switch (slide.type) {
    case "COLUMN_LAYOUT":
      return (
        <ColumnLayoutRenderer
          columns={slide.columns}
          splitRatio={slide.splitRatio}
          items={items}
          menuItemStyles={menuItemStyles}
        />
      );
    case "IMAGE": {
      const fitClass =
        slide.fit === "contain" ? "object-contain" : "object-cover";
      return (
        <div className="w-full h-full min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <img
            src={slide.imageUrl}
            alt="Signage Promo"
            className={`w-full h-full min-h-screen ${fitClass}`}
          />
        </div>
      );
    }
    case "VIDEO":
      return (
        <div className="w-full h-full min-h-screen bg-white dark:bg-black">
          <video
            src={slide.videoUrl}
            autoPlay
            loop={slide.loop !== false}
            muted={slide.mute !== false}
            playsInline
            className="w-full h-full min-h-screen object-cover"
          />
        </div>
      );
    case "IFRAME":
      return (
        <div className="w-full h-full min-h-screen bg-white dark:bg-black">
          <iframe
            src={slide.url}
            title="Google Slides or Web Content"
            className="w-full h-full min-h-screen border-none"
            allow="autoplay; encrypted-media"
          />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-100 dark:bg-card text-white font-sans">
          <p>Unsupported Slide Type</p>
        </div>
      );
  }
}
```

## File: app/display/[id]/types.ts
```typescript
import { SignageLayoutConfig } from "@soustools/api-types";

/**
 * Represents the configuration and details of a television signage layout.
 *
 * @tenant-docs-export
 * Restaurant managers configure signage layouts inside the kitchen portal to assign slide behaviors to displays.
 */
export interface SignageLayout {
  id: string;
  organization_id: string;
  name: string;
  type: string;
  config: SignageLayoutConfig;
}
```

## File: app/display/[id]/use-display-player.ts
```typescript
import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { SignageDisplay, PosItem, SignageLayoutConfig } from "@soustools/api-types";
import { SignageLayout } from "./types";
import { mapDbItemToPosItem, registerDisplayDevice, RawDbPosItem } from "./helpers";
import { config } from "@soustools/config";

export function useDisplayPlayer(
  displayId: string,
  initialDisplay?: SignageDisplay | null,
  initialLayout?: any | null,
  initialItems?: RawDbPosItem[],
  initialErrorState?: string | null
) {
  const [display, setDisplay] = useState<SignageDisplay | null>(initialDisplay || null);
  const [layout, setLayout] = useState<SignageLayout | null>(initialLayout || null);
  const [items, setItems] = useState<PosItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map(mapDbItemToPosItem);
    }
    return [];
  });
  const [loading, setLoading] = useState(!initialDisplay && !initialErrorState);
  const [errorState, setErrorState] = useState<string | null>(initialErrorState || null);

  const CACHE_DISPLAY = `display_${displayId}`;
  const CACHE_LAYOUT = `layout_${displayId}`;
  const CACHE_ITEMS = `items_${displayId}`;

  const fetchDisplayAndLayout = useCallback(async () => {
    try {
      const displayRes = await fetch(`/api/signage/displays/${displayId}`);
      const displayJson = await displayRes.json();
      if (!displayJson.success || !displayJson.data) {
        throw new Error("Display not found");
      }
      const displayData = displayJson.data;

      const displayObj = {
        id: displayData.id,
        organizationId: displayData.organization_id,
        name: displayData.name,
        deviceId: displayData.device_id ?? null,
        portLabel: displayData.port_label ?? null,
        deckId: displayData.deck_id ?? null,
        lastSeenAt: displayData.last_seen_at,
        createdAt: displayData.created_at,
      } as SignageDisplay;

      setDisplay(displayObj);
      localStorage.setItem(CACHE_DISPLAY, JSON.stringify(displayObj));

      if (displayObj.deckId) {
        const [layoutRes, itemsRes] = await Promise.all([
          fetch(`/api/signage/layouts/${displayObj.deckId}`),
          fetch(`/api/pos/items?organizationId=${displayObj.organizationId}`),
        ]);
        const layoutData = await layoutRes.json();
        const itemsData = await itemsRes.json();

        if (layoutData.success && layoutData.data) {
          setLayout(layoutData.data as SignageLayout);
          localStorage.setItem(CACHE_LAYOUT, JSON.stringify(layoutData.data));
        }
        if (itemsData.success && itemsData.data) {
          const parsedItems = (itemsData.data as RawDbPosItem[]).map(mapDbItemToPosItem);
          setItems(parsedItems);
          localStorage.setItem(CACHE_ITEMS, JSON.stringify(parsedItems));
        }
      }
      setLoading(false);
    } catch (err) {
      console.warn("Network fetch failed, loading from offline cache:", err);
      const cachedDisp = localStorage.getItem(CACHE_DISPLAY);
      const cachedLay = localStorage.getItem(CACHE_LAYOUT);
      const cachedItms = localStorage.getItem(CACHE_ITEMS);

      if (cachedDisp) {
        setDisplay(JSON.parse(cachedDisp));
        if (cachedLay) setLayout(JSON.parse(cachedLay));
        if (cachedItms) setItems(JSON.parse(cachedItms));
        setLoading(false);
      } else {
        setErrorState(err instanceof Error ? err.message : "Fetch failed");
        setLoading(false);
      }
    }
  }, [displayId]);

  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(displayId)) {
      registerDisplayDevice(displayId)
        .then((newId) => {
          if (newId) {
            window.location.href = `/display/${newId}`;
          } else {
            setErrorState("Failed to register display device");
            setLoading(false);
          }
        })
        .catch((err) => {
          setErrorState(`Registration error: ${err instanceof Error ? err.message : String(err)}`);
          setLoading(false);
        });
    } else {
      fetchDisplayAndLayout();
    }
  }, [displayId, fetchDisplayAndLayout]);

  useEffect(() => {
    const socketUrl = config.API_BASE_URL || window.location.origin;
    const socket = io(socketUrl, {
      query: { displayId, deckId: display?.deckId || "" },
    });

    socket.on("connect", () => {
      socket.emit("join", { displayId, deckId: display?.deckId });
    });

    socket.on("deck_updated", (payload: { deckId: string; config: SignageLayoutConfig }) => {
      if (payload.deckId === display?.deckId) {
        setLayout((prev) => prev ? { ...prev, config: payload.config } : null);
      }
    });

    socket.on("items_updated", (payload: { deckId: string; items: RawDbPosItem[] }) => {
      if (payload.deckId === display?.deckId && payload.items) {
        const parsedItems = payload.items.map(mapDbItemToPosItem);
        setItems(parsedItems);
      }
    });

    socket.on("layout_updated", () => {
      fetchDisplayAndLayout();
    });

    return () => {
      socket.disconnect();
    };
  }, [displayId, display?.deckId, fetchDisplayAndLayout]);

  return { display, layout, items, loading, errorState };
}
```

## File: app/display/page.tsx
```typescript
"use client";

import React from "react";
import { Button } from "@soustools/ui";

/**
 * HomePage is the landing route for the TV signage player.
 * It provides links to launch specific screens (e.g. dynamic screen IDs).
 */
export default function HomePage() {
  const handleLaunchDisplay = (): void => {
    window.location.href = "/display/default-tv";
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[oklch(0.1_0.02_260)]">
      <div className="max-w-md p-8 rounded-2xl shadow-xl bg-[oklch(0.15_0.03_260)] border border-[oklch(0.25_0.04_260)]">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-[oklch(0.85_0.12_140)]">
          TV Signage Player
        </h1>
        <p className="text-base mb-6 text-[oklch(0.75_0.05_260)]">
          Launch digital signage client. Displays active menus, promotional
          content, and kitchen queue notifications.
        </p>
        <div className="flex justify-center">
          <Button onClick={handleLaunchDisplay}>Launch Player</Button>
        </div>
      </div>
    </main>
  );
}
```

## File: app/login/page.tsx
```typescript
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@soustools/ui";
import { supabase } from "../../lib/supabase";
import { KeyRound, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("conar@dtown.cafe");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get("returnTo");
        router.push(returnTo ? returnTo : "/dashboard");
      }
    } catch (err: unknown) {
      setError("An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: "6s" }} />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/30 mb-4 shadow-lg shadow-sky-500/10">
            <Sparkles className="w-6 h-6 text-sky-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">
            Kitchen Portal
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 text-center">
            Standardize your culinary operations in real-time.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center font-medium animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input
              type="email"
              placeholder="name@dtown.cafe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="pt-2">
            <Button disabled={loading} className="w-full justify-center py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20">
              {loading ? "Signing In..." : "Access Control"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
```

## File: app/apple-icon.tsx
```typescript
import { ImageResponse } from 'next/og';
import { MicroIcon } from '@soustools/ui';

export const runtime = 'edge';

// Apple Touch Icon is 180x180
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <MicroIcon color="#0095FF" width={130} height={130} />
      </div>
    ),
    {
      ...size,
    }
  );
}
```

## File: app/error.tsx
```typescript
"use client";

import { useEffect } from "react";
import { logger } from "@soustools/logger/browser";

/**
 * Props for the Root ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  /**
   * The error object caught by Next.js.
   */
  error: Error & { digest?: string };
  /**
   * Function to reset/retry rendering the boundary.
   */
  reset: () => void;
}

/**
 * ErrorBoundary is caught at the dashboard layout level.
 * It logs errors to the browser logger (New Relic) and displays an error message with kitchen mode theme.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    logger.error({ err: error, digest: error.digest }, "Global kitchen app layout error caught by boundary");
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-50 p-4">
      <div className="glass-panel p-8 rounded-lg max-w-md border border-slate-800 text-center">
        <h2 className="text-xl font-semibold text-rose-500 mb-4">Something went wrong!</h2>
        <p className="text-sm text-slate-400 mb-6">
          An unexpected error has occurred. The system logs have been updated automatically.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

## File: app/global-error.tsx
```typescript
"use client";

import { useEffect } from "react";
import { logger } from "@soustools/logger/browser";

/**
 * Props for the Root GlobalError component.
 */
export interface GlobalErrorProps {
  /**
   * The error object caught by Next.js at root level.
   */
  error: Error & { digest?: string };
  /**
   * Function to reset/retry rendering the root layout.
   */
  reset: () => void;
}

/**
 * GlobalError catches errors at the very root level (including layout.tsx).
 * Renders fallback HTML and body tags.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error({ err: error, digest: error.digest }, "Root kitchen app global layout error caught");
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-50 font-sans flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-lg max-w-md border border-slate-800 text-center">
          <h2 className="text-xl font-semibold text-rose-500 mb-4">Critical System Error</h2>
          <p className="text-sm text-slate-400 mb-6">
            A critical system error occurred. The technical team has been notified.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium transition-colors cursor-pointer"
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
```

## File: app/globals.css
```css
@import "@soustools/design-system/index.css";
@import "@soustools/ui/index.css";

@source "../../../../packages/ui/src/**/*.tsx";
@source "../../../../packages/design-system/src/**/*.tsx";
@source "../../../../packages/domain-signage/src/**/*.tsx";
@source "../../../../packages/domain-inventory/src/**/*.tsx";
@source "../../../../packages/domain-settings/src/**/*.tsx";
@source "../../../../packages/domain-recipes/src/**/*.tsx";
@source "../../../../apps/app/src/**/*.tsx";
```

## File: app/icon.tsx
```typescript
import { ImageResponse } from 'next/og';
import { MicroIcon } from '@soustools/ui';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <MicroIcon color="#0095FF" width={384} height={384} />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
```

## File: app/layout.tsx
```typescript
import React from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "../components/theme-provider";
import { InstrumentationClient } from "../instrumentation-client";

export const metadata: Metadata = {
  title: "sous.tools",
  description: "Interactive kitchen display system and dashboard",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans overflow-x-hidden transition-colors duration-300 relative">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Animated Background Orbs */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 dark:bg-sky-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
          </div>
          {children}
          <Toaster theme="system" position="bottom-right" richColors />
          <Analytics />
          <SpeedInsights />
          <InstrumentationClient />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## File: app/manifest.ts
```typescript
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sous Tools Kitchen',
    short_name: 'sous.tools',
    description: 'Interactive kitchen display system and dashboard',
    start_url: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'minimal-ui'],
    background_color: '#020617', // slate-950
    theme_color: '#020617',
    orientation: 'any', // Kitchen displays could be landscape or portrait
    icons: [
      {
        src: '/icon', // Points to the dynamic icon route
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon', 
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
```

## File: app/page.tsx
```typescript
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@soustools/ui";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { ShieldCheck, CloudLightning, Download, Terminal } from "lucide-react";

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    fetchSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-white selection:bg-sky-500/30">
      {/* Header / Nav */}
      <header className="border-b border-black/5 dark:border-white/5 py-4 px-6 md:px-12 flex justify-between items-center backdrop-blur-md sticky top-0 z-55 bg-zinc-950/80">
        <div className="flex items-center gap-2">
          <Terminal className="text-sky-400 w-6 h-6" />
          <span className="font-bold tracking-tight text-xl">SOUS.TOOLS</span>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <Button onClick={() => router.push("/dashboard")} variant="primary">
              Go to Dashboard
            </Button>
          ) : (
            <Button onClick={() => router.push("/login")} variant="outline">
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center px-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-sky-200 to-violet-400 bg-clip-text text-transparent">
          Professional Kitchen Operations, Automated
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
          Scale your menus, manage vendor inventory ledger, sync Square catalog instantly, and deploy real-time digital display signage.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={() => router.push(session ? "/dashboard" : "/login")} variant="primary" className="px-8 py-3 text-base">
            Get Started Natively
          </Button>
        </div>
      </section>

      {/* 3-Tiered Pricing Plans */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Flexible Pricing for Growing Kitchens</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-sky-400">Starter</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">For single-station cafes.</p>
              <div className="text-4xl font-extrabold mt-6">$49<span className="text-base font-normal text-zinc-400 dark:text-zinc-500">/mo</span></div>
              <ul className="mt-8 space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">✔ 1 Active Signage Display</li>
                <li className="flex items-center gap-2">✔ Square Catalog Integration</li>
                <li className="flex items-center gap-2">✔ Basic Recipe Manager</li>
              </ul>
            </div>
            <Button onClick={() => router.push("/login")} className="mt-8 w-full justify-center" variant="outline">Choose Starter</Button>
          </div>

          {/* Pro Plan */}
          <div className="glass-panel p-8 rounded-3xl border border-sky-500/30 relative flex flex-col justify-between shadow-[0_0_30px_rgba(56,189,248,0.1)]">
            <span className="absolute top-0 right-8 transform -translate-y-1/2 bg-sky-500 text-zinc-950 text-xs font-extrabold uppercase px-3 py-1 rounded-full">Popular</span>
            <div>
              <h3 className="text-xl font-bold text-sky-300">Pro</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">For busy full-service restaurants.</p>
              <div className="text-4xl font-extrabold mt-6">$149<span className="text-base font-normal text-zinc-400 dark:text-zinc-500">/mo</span></div>
              <ul className="mt-8 space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">✔ Unlimited Signage Displays</li>
                <li className="flex items-center gap-2">✔ Real-time Inventory Ledger</li>
                <li className="flex items-center gap-2">✔ Dynamic Baker's Math Sync</li>
                <li className="flex items-center gap-2">✔ Automated PO Dispatch</li>
              </ul>
            </div>
            <Button onClick={() => router.push("/login")} className="mt-8 w-full justify-center bg-sky-500 hover:bg-sky-600 text-white" variant="primary">Upgrade to Pro</Button>
          </div>

          {/* Enterprise Plan */}
          <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-violet-400">Enterprise</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Multi-location hospitality groups.</p>
              <div className="text-4xl font-extrabold mt-6">Custom</div>
              <ul className="mt-8 space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-2">✔ Custom API / Webhook Access</li>
                <li className="flex items-center gap-2">✔ Dedicated Integration Drivers</li>
                <li className="flex items-center gap-2">✔ 99.9% Uptime Kiosk SLA</li>
                <li className="flex items-center gap-2">✔ Tenant Isolation Control</li>
              </ul>
            </div>
            <Button onClick={() => router.push("/login")} className="mt-8 w-full justify-center" variant="outline">Contact Sales</Button>
          </div>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="py-16 border-t border-black/5 dark:border-white/5 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl font-bold">Deploy Anywhere Natively</h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">Install our persistent BOH app on tablets, kiosks, and display controllers for continuous 24/7 cookline status.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 px-6 py-4 rounded-2xl transition-all">
              <Download className="w-5 h-5 text-sky-400" />
              <div className="text-left">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Download for Desktop</div>
                <div className="font-bold text-sm">Windows & Mac App</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 px-6 py-4 rounded-2xl transition-all">
              <CloudLightning className="w-5 h-5 text-sky-400" />
              <div className="text-left">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Instant Progressive Web App</div>
                <div className="font-bold text-sm">Install PWA</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 px-6 py-4 rounded-2xl transition-all">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              <div className="text-left">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Download Controller App</div>
                <div className="font-bold text-sm">Android CLI Bundle</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 dark:border-white/5 py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
        &copy; 2026 SOUS.TOOLS. Designed for modern back-of-house operations. All rights reserved.
      </footer>
    </div>
  );
}
```

## File: components/layout/app-bar.tsx
```typescript
/**
 * @deprecated Relocated to @soustools/design-system.
 * Update your import to:
 *   import { AppBar } from "@soustools/design-system";
 *
 * NOTE: Data-fetching (notifications, Supabase auth) has been extracted from
 * this component. Wire the props in your layout's controller layer:
 *   - notifications={notifications}
 *   - onNotificationClick={handleNotifClick}
 *   - onMarkAllRead={markAllRead}
 *   - onLogout={handleLogout}
 */
export { AppBar } from "@soustools/design-system";
export type { AppBarProps, AppBarNotification } from "@soustools/design-system";
// Default export alias for legacy callers
export { AppBar as default } from "@soustools/design-system";
```

## File: components/layout/bottom-nav.tsx
```typescript
/**
 * @deprecated Relocated to @soustools/design-system.
 * Update your import to:
 *   import { BottomNav } from "@soustools/design-system";
 */
export { BottomNav } from "@soustools/design-system";
export type { BottomNavProps, BottomNavItem } from "@soustools/design-system";
```

## File: components/layout/hamburger.tsx
```typescript
/**
 * @deprecated Relocated to @soustools/design-system.
 * Update your import to:
 *   import { Hamburger } from "@soustools/design-system";
 */
export { Hamburger } from "@soustools/design-system";
export type { HamburgerProps } from "@soustools/design-system";
```

## File: components/layout/sidebar.tsx
```typescript
/**
 * @deprecated Relocated to @soustools/design-system.
 * Update your import to:
 *   import { Sidebar } from "@soustools/design-system";
 *
 * NOTE: Data-fetching and config lookups have been extracted from this component.
 * Wire the props in your layout's controller layer:
 *   - navItems={navItems}          — build from BASE_NAV_ITEMS + role/env filter
 *   - expandedLogo={<PrimaryLogo />}
 *   - collapsedIcon={<MicroIcon />}
 *   - isAdmin={userIsAdmin}        — result of supabase role check
 */
export { Sidebar } from "@soustools/design-system";
export type { SidebarProps, SidebarNavItem } from "@soustools/design-system";
// Default export alias for legacy callers
export { Sidebar as default } from "@soustools/design-system";
```

## File: components/layout/theme-toggle.tsx
```typescript
/**
 * @deprecated Relocated to @soustools/design-system.
 * Update your import to:
 *   import { ThemeToggle } from "@soustools/design-system";
 */
export { ThemeToggle } from "@soustools/design-system";
```

## File: components/ui/confirm-modal.tsx
```typescript
/**
 * @deprecated Relocated to @soustools/design-system.
 * Update your import to:
 *   import { ConfirmModal } from "@soustools/design-system";
 */
export { ConfirmModal } from "@soustools/design-system";
export type { ConfirmModalProps } from "@soustools/design-system";
```

## File: components/theme-provider.tsx
```typescript
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

## File: lib/supabase.ts
```typescript
import { createBrowserClient } from "@soustools/supabase";

/**
 * Shared Supabase client instance for client-side execution in the kitchen app.
 * Configured automatically via the shared Supabase package.
 */
export const supabase = createBrowserClient();
```

## File: instrumentation-client.tsx
```typescript
"use client";

import { useEffect } from "react";
import { patchConsole } from "@soustools/logger/browser";

/**
 * Client-side instrumentation component.
 * Mounts at the root of the app to monkey-patch console methods on the browser.
 */
export function InstrumentationClient() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      patchConsole();
    }
  }, []);

  return null;
}
```

## File: instrumentation.ts
```typescript
/**
 * Next.js instrumentation file for server-side initialization.
 * Patches global console methods to route through the centralized pino logger.
 * @tenant-docs-export
 */
export async function register(): Promise<void> {
  // Console monkey patching removed to prevent Next.js Webpack deadlocks
}
```

## File: sw.ts
```typescript
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```
