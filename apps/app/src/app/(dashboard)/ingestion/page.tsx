"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { IngestionReview } from "@soustools/api-types";
import Link from "next/link";
import { BrainCircuit, Clock, CheckCircle } from "lucide-react";

export default function IngestionDashboardPage() {
  const [reviews, setReviews] = useState<IngestionReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("ingestion_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      const parsed = data.map((d: any) => ({
        id: d.id,
        organizationId: d.organization_id,
        userId: d.user_id,
        source: d.source,
        rawText: d.raw_text,
        parsedData: d.parsed_data,
        status: d.status,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      })) as IngestionReview[];
      setReviews(parsed);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Ingestion Queue</h1>
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
                    <h2 className="text-xl font-bold capitalize">{review.source.replace("_", " ").toLowerCase()}</h2>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase tracking-wider ${
                    review.status === "PENDING" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {review.status}
                  </span>
                </div>

                <div className="flex-1 text-sm text-gray-400 mb-6">
                  {review.status === "PENDING" ? (
                    <span className="flex items-center gap-2"><Clock size={16}/> Needs Human Review</span>
                  ) : (
                    <span className="flex items-center gap-2 text-emerald-400"><CheckCircle size={16}/> Approved</span>
                  )}
                  <div className="mt-4">
                    Uploaded: {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="w-full flex items-center justify-center gap-2 bg-white/5 text-white py-2 rounded-md font-medium group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  Open Review
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
