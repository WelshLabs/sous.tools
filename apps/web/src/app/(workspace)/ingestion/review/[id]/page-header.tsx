"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, Trash2, CheckCircle } from "lucide-react";

export interface PageHeaderProps {
  review: {
    status: string;
    source: string;
  };
  setShowDeleteConfirm: (val: boolean) => void;
  handleApprove: () => void;
}

export function PageHeader({ review, setShowDeleteConfirm, handleApprove }: PageHeaderProps) {
  return (
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
  );
}
