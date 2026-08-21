"use client";

import { useState } from "react";
import { TransactionsView, type Transaction } from "./Transactions.view";

export interface TransactionsProps {
  initialTransactions?: Transaction[];
}

export function TransactionsContainer({
  initialTransactions = [],
}: TransactionsProps) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [minVolume, setMinVolume] = useState("");
  const [sortBy, setSortBy] = useState<"transaction_time" | "gross_revenue">(
    "transaction_time",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  let filtered = [...initialTransactions];

  if (sourceFilter !== "all") {
    filtered = filtered.filter(
      (t) => t.source.toLowerCase() === sourceFilter.toLowerCase(),
    );
  }
  if (minVolume) {
    const min = parseFloat(minVolume);
    if (!isNaN(min)) {
      filtered = filtered.filter((t) => t.gross_revenue >= min);
    }
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
    let valA: number = (a as Record<string, any>)[sortBy];
    let valB: number = (b as Record<string, any>)[sortBy];
    if (sortBy === "transaction_time") {
      valA = new Date(a.transaction_time).getTime();
      valB = new Date(b.transaction_time).getTime();
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedTransactions = filtered.slice(
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

  const handleSearchChange = (s: string) => {
    setSearch(s);
    setPage(1);
  };

  const handleSourceChange = (f: string) => {
    setSourceFilter(f);
    setPage(1);
  };

  const handleMinVolumeChange = (v: string) => {
    setMinVolume(v);
    setPage(1);
  };

  return (
    <TransactionsView
      search={search}
      setSearch={handleSearchChange}
      sourceFilter={sourceFilter}
      setSourceFilter={handleSourceChange}
      minVolume={minVolume}
      setMinVolume={handleMinVolumeChange}
      paginatedTransactions={paginatedTransactions}
      page={page}
      totalPages={totalPages}
      setPage={setPage}
      toggleSort={toggleSort}
    />
  );
}

export { TransactionsContainer as Transactions };
