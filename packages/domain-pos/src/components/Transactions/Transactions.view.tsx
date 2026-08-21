"use client";

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
  pos_items: { name: string } | null;
}

export interface TransactionsViewProps {
  search: string;
  setSearch: (s: string) => void;
  sourceFilter: string;
  setSourceFilter: (f: string) => void;
  minVolume: string;
  setMinVolume: (v: string) => void;
  paginatedTransactions: Transaction[];
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  toggleSort: (field: "transaction_time" | "gross_revenue") => void;
}

export function TransactionsView({
  search,
  setSearch,
  sourceFilter,
  setSourceFilter,
  minVolume,
  setMinVolume,
  paginatedTransactions,
  page,
  totalPages,
  setPage,
  toggleSort,
}: TransactionsViewProps) {
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
              onChange={(e) => setSearch(e.target.value)}
              className="dark:bg-card w-full rounded-xl border border-zinc-800 bg-zinc-50 py-2 pr-4 pl-9 text-xs text-white transition-all outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground h-3.5 w-3.5 dark:text-zinc-500" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
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
              placeholder="Min Volume ($)..."
              value={minVolume}
              onChange={(e) => setMinVolume(e.target.value)}
              className="dark:bg-card w-32 rounded-xl border border-zinc-800 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 outline-none dark:text-zinc-300"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl border border-black/5 dark:border-white/5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Transaction ID</TableHead>
              <TableHead>Item / Descriptor</TableHead>
              <TableHead>Source</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("transaction_time")}
              >
                <div className="flex items-center gap-1">
                  Time <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => toggleSort("gross_revenue")}
              >
                <div className="flex items-center justify-end gap-1">
                  Gross Revenue <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-8 text-center text-xs"
                >
                  No transactions match the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs font-semibold text-sky-400">
                    {tx.external_transaction_id}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-zinc-200">
                    {tx.pos_items?.name || "Custom Line Item"}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 capitalize">
                    {tx.source}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {new Date(tx.transaction_time).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-zinc-300">
                    {tx.quantity_sold}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-emerald-400">
                    ${Number(tx.gross_revenue).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 text-xs">
        <span className="text-zinc-500">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-40"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
TransactionsView.displayName = "TransactionsView";
