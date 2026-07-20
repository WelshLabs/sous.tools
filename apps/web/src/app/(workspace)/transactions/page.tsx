import React from "react";
import { TransactionsView } from "./TransactionsView";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  let initialTransactions = [];

  try {
    const { data, error } = await (api.GET as any)("/pos/transactions", { cache: "no-store" });
    if (!error && data) {
      initialTransactions = (data as any).data || data;
    }
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
  }

  return <TransactionsView initialTransactions={initialTransactions} />;
}
