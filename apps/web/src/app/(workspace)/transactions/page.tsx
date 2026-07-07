"use client";

import React, { useEffect, useState } from "react";
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
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Transactions & Orders</h1>
        <p className="text-sm text-zinc-500 dark:text-muted-foreground mt-1">Audit synced Square sales logs and volume metrics.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-black/5 dark:border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Event/Txn ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-50 dark:bg-card border border-zinc-800 rounded-xl pl-9 pr-4 py-2 w-full text-xs text-white outline-none focus:border-sky-500 transition-all"
            />
          </div>
          <button type="submit" className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all">
            Find
          </button>
        </form>

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
              onChange={(e) => setMinVolume(e.target.value)}
              onBlur={() => { setPage(1); fetchTransactions(); }}
              className="bg-zinc-50 dark:bg-card border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white w-24 outline-none focus:border-sky-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-zinc-500 dark:text-muted-foreground text-xs font-bold bg-card/40">
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
                  <td colSpan={7} className="text-center p-8 text-xs text-muted-foreground dark:text-zinc-500">Auditing sales transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-xs text-muted-foreground dark:text-zinc-500">No matching sales records found.</td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-black/5 dark:border-white/5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-black/5 bg-card transition-all">
                    <td className="p-4 font-mono text-zinc-500 dark:text-muted-foreground select-all">{txn.external_transaction_id}</td>
                    <td className="p-4 font-bold text-zinc-200">{txn.pos_items?.name || "Unnamed POS Item"}</td>
                    <td className="p-4 font-semibold text-zinc-500 dark:text-muted-foreground">{txn.quantity_sold}</td>
                    <td className="p-4 font-bold text-emerald-400">${txn.gross_revenue.toFixed(2)}</td>
                    <td className="p-4 text-muted-foreground dark:text-zinc-500">${txn.discount_amount.toFixed(2)}</td>
                    <td className="p-4 text-zinc-500 dark:text-muted-foreground">{new Date(txn.transaction_time).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        txn.source === "square" 
                          ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          : "bg-zinc-800 text-zinc-500 dark:text-muted-foreground border-zinc-700"
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
          <div className="p-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center bg-card/20 text-xs">
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
    </div>
  );
}
