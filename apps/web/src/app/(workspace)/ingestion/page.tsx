"use client";

import { useEffect, useState } from "react";
import { type IngestionReview } from "@soustools/api-types";
import Link from "next/link";
import { BrainCircuit, Clock, CheckCircle, Trash2, XCircle } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { io, type Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

export default function IngestionDashboardPage() {
  const [reviews, setReviews] = useState<(IngestionReview & { sourceName?: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/ingestion");
      if (res.ok) {
        const payload = await res.json();
        if (payload.data) {
          setReviews(payload.data.map((d: any) => ({
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
          })));
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

    let socket: Socket | null = null;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001";
    const socketUrl = apiUrl.startsWith("http") ? apiUrl : window.location.origin;

    // The HttpOnly session cookie is sent automatically with withCredentials.
    // No JS-accessible Supabase token is needed — the NestJS gateway validates via cookie.
    socket = io(socketUrl + "/ingestion", {
      query: { orgId: "d0000000-0000-0000-0000-000000000000" },
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("job_state_change", (event: any) => {
      // Refetch or optimistically update if it's a major state change
      if (event.state === 'awaiting_review' || event.state === 'completed' || event.state === 'failed') {
        fetchReviews();
      }
    });

    return () => { if (socket) socket.disconnect(); };
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

  const pendingReviews = reviews.filter(r => r.status === "PENDING");
  const approvedReviews = reviews.filter(r => r.status === "APPROVED");
  const rejectedReviews = reviews.filter(r => r.status === "REJECTED");

  const KanbanColumn = ({ title, items, icon: Icon, colorClass }: any) => (
    <div className="flex flex-col gap-4">
      <div className={`flex items-center gap-2 p-3 rounded-xl border ${colorClass.border} ${colorClass.bg} ${colorClass.text}`}>
        <Icon size={20} />
        <h2 className="font-bold tracking-wide uppercase">{title}</h2>
        <div className={`ml-auto px-2 py-0.5 rounded-full text-xs font-black bg-black/30`}>{items.length}</div>
      </div>
      
      <div className="flex flex-col gap-4 flex-1 min-h-[200px] p-2 bg-black/10 rounded-2xl border border-white/5">
        <AnimatePresence>
          {items.map((review: any) => (
            <motion.div
              layout
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass-panel p-4 flex flex-col gap-3 group hover:border-sky-500/50 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-sky-400" />
                  <span className="font-bold truncate max-w-[150px] text-sm" title={review.sourceName || review.source}>
                    {review.sourceName || review.source.replace("_", " ")}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); setDeleteId(review.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleString()}
              </div>

              <Link href={`/ingestion/review/${review.id}`} className="w-full">
                <div className="w-full py-2 mt-2 bg-white/5 hover:bg-sky-500/20 text-center text-sm font-bold text-sky-300 rounded-lg border border-white/5 hover:border-sky-500/30 transition-colors">
                  Open Review
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && !loading && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground font-medium opacity-50">Empty</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 p-8 h-full bg-background text-foreground animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Processing Hub</h1>
          <p className="text-muted-foreground mt-2 font-medium">Review AI-extracted documents across the ingestion pipeline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KanbanColumn 
          title="Needs Review" 
          items={pendingReviews} 
          icon={Clock} 
          colorClass={{ border: "border-amber-500/20", bg: "bg-amber-500/10", text: "text-amber-400" }} 
        />
        <KanbanColumn 
          title="Approved" 
          items={approvedReviews} 
          icon={CheckCircle} 
          colorClass={{ border: "border-emerald-500/20", bg: "bg-emerald-500/10", text: "text-emerald-400" }} 
        />
        <KanbanColumn 
          title="Rejected" 
          items={rejectedReviews} 
          icon={XCircle} 
          colorClass={{ border: "border-rose-500/20", bg: "bg-rose-500/10", text: "text-rose-400" }} 
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Review"
        message="Are you sure you want to delete this extraction record? This cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
      />
    </div>
  );
}
