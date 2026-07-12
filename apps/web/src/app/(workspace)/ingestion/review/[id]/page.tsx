"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
} from "lucide-react";
import { type IngestionReview } from "@soustools/api-types";
import { toast } from "sonner";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { VisualBuilder } from "./visual-builder";
import { PageHeader } from "./page-header";

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
      try {
        const res = await fetch(`/api/ingestion/${id}`);
        if (!res.ok) throw new Error("Failed to fetch review");
        
        const payload = await res.json();
        const data = payload.data;

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
      } catch (err) {
        toast.error("Failed to load review");
        console.error(err);
      } finally {

        setLoading(false);
      }
    };

    if (id) fetchReview();
  }, [id]);

  const handleApprove = async () => {
    try {
      const finalJson = JSON.parse(editedData);

      if (finalJson.vendorName && finalJson.items) {
        for (const item of finalJson.items) {
          if (!item.each_weight_g || item.each_weight_g <= 0) {
            item.each_weight_g = null;
          }
        }
      }

      // Trigger the real commit API synchronously and pass the modified json
      const res = await fetch(`/api/ingestion/review/${id}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parsed_data: finalJson })
      });

      if (!res.ok) throw new Error("Failed to commit data");

      toast.success("Ingestion Approved and mapped to Live Data!");
      router.push("/recipes");
    } catch (_err) {
      toast.error("Failed to commit changes. Ensure JSON is valid.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/ingestion/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Review deleted successfully");
      router.push("/ingestion");
    } catch (_err) {
      toast.error("Failed to delete review");
      setShowDeleteConfirm(false);
    }
  };

  const handleConfirmAlias = async (rawName: string, itemId: string) => {
    if (!review) return;
    try {
      const parsedData = typeof editedData === "string" ? JSON.parse(editedData) : review.parsedData;
      const res = await fetch("/api/ingestion/alias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: review.organizationId,
          vendorName: parsedData.vendorName || "Unknown Vendor",
          vendorItemString: rawName,
          masterIngredientId: itemId,
        })
      });

      if (!res.ok) throw new Error("Failed to save alias mapping");
      
      toast.success(`Saved alias mapping for "${rawName}"`);
    } catch (err) {
      toast.error("Failed to save alias mapping");
      console.error(err);
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
      <PageHeader
        review={review}
        setShowDeleteConfirm={setShowDeleteConfirm}
        handleApprove={handleApprove}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
        {/* Left Pane: Raw Document text or Image */}
        <div className="bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 bg-card/80 border-b border-black/10 dark:border-white/10">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Raw Source Document
            </h2>
          </div>
          <div className="flex-1 overflow-auto bg-black/5 dark:bg-black/40">
            {review.sourceDocumentUrl && (
              review.sourceDocumentUrl.split("?")[0].toLowerCase().endsWith(".pdf") ? (
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
              <div className="flex bg-card rounded-lg p-1">
                <button
                  onClick={() => setViewMode("visual")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === "visual" ? "bg-black/10 dark:bg-white/10 text-white" : "text-muted-foreground dark:text-zinc-500 hover:text-white"}`}
                >
                  Visual
                </button>
                <button
                  onClick={() => setViewMode("json")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === "json" ? "bg-black/10 dark:bg-white/10 text-white" : "text-muted-foreground dark:text-zinc-500 hover:text-white"}`}
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
              onConfirmAlias={handleConfirmAlias}
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
