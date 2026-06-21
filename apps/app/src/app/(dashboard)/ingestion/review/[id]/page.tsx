"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle, BrainCircuit } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { IngestionReview } from "@soustools/api-types";
import { toast } from "sonner";
import Link from "next/link";

export default function IngestionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [review, setReview] = useState<IngestionReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState("");

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
          createdAt: data.created_at,
          updatedAt: data.updated_at
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
      const res = await fetch(`http://localhost:3001/ingestion/review/${id}/commit`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to commit data");
      
      toast.success("Ingestion Approved and mapped to Live Data!");
      router.push("/recipes"); 
    } catch (err) {
      toast.error("Failed to commit changes. Ensure JSON is valid.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;
  }

  if (!review) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/recipes" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-sky-400" />
              Human-in-the-Loop Review
            </h1>
            <p className="text-sm text-zinc-400">Review AI extracted data from {review.source.replace("_", " ")}</p>
          </div>
        </div>
        
        {review.status === "PENDING" ? (
          <button
            onClick={handleApprove}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20"
          >
            <CheckCircle className="w-5 h-5" /> Approve & Save
          </button>
        ) : (
          <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold border border-emerald-500/30">
            Already {review.status}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
        {/* Left Pane: Raw Document text or Image */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 bg-zinc-900/80 border-b border-white/10">
            <h2 className="text-sm font-semibold text-zinc-200">Raw Source Document</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-black/40">
            <pre className="text-sm text-zinc-400 whitespace-pre-wrap font-mono">
              {review.rawText || "No raw text available (possibly an image)."}
            </pre>
          </div>
        </div>

        {/* Right Pane: AI Structured Data Editable */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 bg-zinc-900/80 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-zinc-200">AI Extracted JSON (Editable)</h2>
            <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded-full">Vendor Aliases Applied</span>
          </div>
          <div className="flex-1">
            <textarea
              value={editedData}
              onChange={(e) => setEditedData(e.target.value)}
              className="w-full h-full bg-black/60 text-emerald-400 font-mono text-sm p-4 resize-none focus:outline-none focus:border focus:border-sky-500/50"
              spellCheck={false}
              disabled={review.status !== "PENDING"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
