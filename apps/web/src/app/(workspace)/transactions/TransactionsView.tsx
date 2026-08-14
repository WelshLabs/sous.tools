"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  DollarSign,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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

export function TransactionsView({
  initialTransactions,
}: {
  initialTransactions: Transaction[];
}) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [minVolume, setMinVolume] = useState("");
  const [sortBy, setSortBy] = useState<"transaction_time" | "gross_revenue">(
    "transaction_time",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Client-side filtering and sorting
  let filtered = [...initialTransactions];

  if (sourceFilter !== "all") {
    filtered = filtered.filter(
      (t) => t.source.toLowerCase() === sourceFilter.toLowerCase(),
    );
  }
  if (minVolume) {
    const min = parseFloat(minVolume);
    filtered = filtered.filter((t) => t.gross_revenue >= min);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.external_transaction_id?.toLowerCase().includes(s) ||
        t.pos_items?.name?.toLowerCase().includes(s),
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
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

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
    <div className="animate-fadeIn mx-auto max-w-7xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Transactions
        </h1>
        <p className="dark:text-muted-foreground mt-1 text-sm text-zinc-500">
          Audit synced Square sales logs and volume metrics.
        </p>
      </div>

      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 p-4 dark:border-white/5">
        <div className="flex w-full gap-2 md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search Event/Txn ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="dark:bg-card w-full rounded-xl border border-zinc-800 bg-zinc-50 py-2 pr-4 pl-9 text-xs text-white transition-all outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground h-3.5 w-3.5 dark:text-zinc-500" />
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="dark:bg-card rounded-xl border border-zinc-800 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 outline-none dark:text-zinc-300"
            >
              <option value="all">All Sources</option>
              <option value="square">Square</option>
              <option value="toast">Toast</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="text-muted-foreground h-3.5 w-3.5 dark:text-zinc-500" />
            <input
              type="number"
              placeholder="Min $ Vol"
              value={minVolume}
              onChange={(e) => {
                setMinVolume(e.target.value);
                setPage(1);
              }}
              className="dark:bg-card w-24 rounded-xl border border-zinc-800 bg-zinc-50 px-3 py-2 text-xs text-white transition-all outline-none focus:border-sky-500"
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
            <TableHead
              className="cursor-pointer transition-all hover:text-white"
              onClick={() => toggleSort("gross_revenue")}
            >
              Gross Revenue <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
            <TableHead>Discount</TableHead>
            <TableHead
              className="cursor-pointer transition-all hover:text-white"
              onClick={() => toggleSort("transaction_time")}
            >
              Transaction Time <ArrowUpDown className="ml-1 inline h-3 w-3" />
            </TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-muted-foreground p-8 text-center text-xs dark:text-zinc-500"
              >
                No matching sales records found.
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="dark:text-muted-foreground font-mono text-zinc-500 select-all">
                  {txn.external_transaction_id}
                </TableCell>
                <TableCell className="font-bold text-zinc-200">
                  {txn.pos_items?.name || "Unnamed POS Item"}
                </TableCell>
                <TableCell className="dark:text-muted-foreground font-semibold text-zinc-500">
                  {txn.quantity_sold}
                </TableCell>
                <TableCell className="font-bold text-emerald-400">
                  ${txn.gross_revenue.toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground dark:text-zinc-500">
                  ${txn.discount_amount.toFixed(2)}
                </TableCell>
                <TableCell className="dark:text-muted-foreground text-zinc-500">
                  {new Date(txn.transaction_time).toLocaleString()}
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                      txn.source === "square"
                        ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
                        : "dark:text-muted-foreground border-zinc-700 bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {txn.source}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 text-xs">
          <span className="text-muted-foreground dark:text-zinc-500">
            Showing page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="bg-card rounded-xl border border-zinc-800 p-2 transition-all hover:bg-black/5 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="bg-card rounded-xl border border-zinc-800 p-2 transition-all hover:bg-black/5 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
