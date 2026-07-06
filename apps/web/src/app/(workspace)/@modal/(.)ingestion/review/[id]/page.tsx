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
              className="p-2 bg-black/5 bg-card rounded-full hover:bg-black/10 dark:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-sky-400" />
                Human-in-the-Loop Review
              </h1>
              <p className="text-sm text-zinc-500 dark:text-muted-foreground">
                Review AI extracted data from {review.source.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-zinc-500 dark:text-muted-foreground hover:text-red-500 bg-black/5 bg-card hover:bg-red-500/10 rounded-lg transition-colors"
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
                <pre className="text-sm text-zinc-500 dark:text-muted-foreground whitespace-pre-wrap font-mono p-4">
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
