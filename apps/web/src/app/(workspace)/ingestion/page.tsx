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
                  <div className="flex-1 flex items-center justify-center bg-black/5 bg-card text-white py-2 rounded-md font-medium group-hover:bg-sky-500 transition-colors">
                    Open Review
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); setDeleteId(review.id); }}
                    className="p-2 bg-black/5 bg-card hover:bg-red-500/20 text-zinc-500 dark:text-muted-foreground hover:text-red-400 rounded-md transition-colors"
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
