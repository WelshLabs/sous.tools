"use client";

import React, { useState } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Filter,
  DollarSign
} from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@soustools/design-system";

export interface Transaction {
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

export function TransactionsView({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [minVolume, setMinVolume] = useState("");
  const [sortBy, setSortBy] = useState<"transaction_time" | "gross_revenue">("transaction_time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Client-side filtering and sorting
  let filtered = [...initialTransactions];

  if (sourceFilter !== "all") {
    filtered = filtered.filter(t => t.source.toLowerCase() === sourceFilter.toLowerCase());
  }
  if (minVolume) {
    const min = parseFloat(minVolume);
    filtered = filtered.filter(t => t.gross_revenue >= min);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(t => 
      t.external_transaction_id?.toLowerCase().includes(s) || 
      t.pos_items?.name?.toLowerCase().includes(s)
    );
  }

  filtered.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === "transaction_time") {
      valA = new Date(a.transaction_time).getTime() as any;
      valB = new Date(b.transaction_time).getTime() as any;
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Transactions</h1>
        <p className="text-sm text-zinc-500 dark:text-muted-foreground mt-1">Audit synced Square sales logs and volume metrics.</p>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-black/5 dark:border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Event/Txn ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-zinc-50 dark:bg-card border border-zinc-800 rounded-xl pl-9 pr-4 py-2 w-full text-xs text-white outline-none focus:border-sky-500 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground dark:text-zinc-500 w-3.5 h-3.5" />
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
              className="bg-zinc-50 dark:bg-card border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 outline-none"
            >
              <option value="all">All Sources</option>
              <option value="square">Square</option>
              <option value="toast">Toast</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="text-muted-foreground dark:text-zinc-500 w-3.5 h-3.5" />
            <input
              type="number"
              placeholder="Min $ Vol"
              value={minVolume}
              onChange={(e) => { setMinVolume(e.target.value); setPage(1); }}
              className="bg-zinc-50 dark:bg-card border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white w-24 outline-none focus:border-sky-500 transition-all"
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>POS Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="cursor-pointer hover:text-white transition-all" onClick={() => toggleSort("gross_revenue")}>
              Gross Revenue <ArrowUpDown className="inline w-3 h-3 ml-1" />
            </TableHead>
            <TableHead>Discount</TableHead>
            <TableHead className="cursor-pointer hover:text-white transition-all" onClick={() => toggleSort("transaction_time")}>
              Transaction Time <ArrowUpDown className="inline w-3 h-3 ml-1" />
            </TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center p-8 text-xs text-muted-foreground dark:text-zinc-500">
                No matching sales records found.
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-mono text-zinc-500 dark:text-muted-foreground select-all">{txn.external_transaction_id}</TableCell>
                <TableCell className="font-bold text-zinc-200">{txn.pos_items?.name || "Unnamed POS Item"}</TableCell>
                <TableCell className="font-semibold text-zinc-500 dark:text-muted-foreground">{txn.quantity_sold}</TableCell>
                <TableCell className="font-bold text-emerald-400">${txn.gross_revenue.toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground dark:text-zinc-500">${txn.discount_amount.toFixed(2)}</TableCell>
                <TableCell className="text-zinc-500 dark:text-muted-foreground">{new Date(txn.transaction_time).toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                    txn.source === "square" 
                      ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      : "bg-zinc-800 text-zinc-500 dark:text-muted-foreground border-zinc-700"
                  }`}>
                    {txn.source}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="p-4 flex justify-between items-center text-xs">
          <span className="text-muted-foreground dark:text-zinc-500">Showing page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-zinc-800 rounded-xl disabled:opacity-50 hover:bg-black/5 bg-card transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-zinc-800 rounded-xl disabled:opacity-50 hover:bg-black/5 bg-card transition-all"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
