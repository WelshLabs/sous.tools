import React from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = 'force-dynamic';

export default async function IngestionsPage() {
  const { data, error } = await api.GET("/ingestion");

  const ingestions = !error && data ? data.data || [] : [];
  const isAdmin = true; // TODO: fetch role from API


  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 w-full h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Ingestions Ledger</h1>
          <p className="text-muted-foreground mt-2">
            History of all documents and recipes parsed.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Source Type</th>
              <th className="px-6 py-4 font-medium">Filename</th>
              <th className="px-6 py-4 font-medium">Status</th>
              {isAdmin && <th className="px-6 py-4 font-medium">User</th>}
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ingestions?.map((item: any) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-foreground font-mono text-xs">
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20">
                    {item.source}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">
                  {item.source_name || "Unknown"}
                </td>
                <td className="px-6 py-4">
                  {item.status}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-muted-foreground truncate max-w-[150px]">
                    {item.users?.email || item.user_id}
                  </td>
                )}
                <td className="px-6 py-4">
                  <Link 
                    href={`/ingestion/review/${item.id}`}
                    className="text-cyan-400 hover:text-cyan-300 font-medium text-xs transition-colors"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {!ingestions || ingestions.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">
                  No ingestion history found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
