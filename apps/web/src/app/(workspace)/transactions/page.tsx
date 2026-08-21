import React from "react";
import { TransactionsContainer } from "@soustools/domain-pos";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  let initialTransactions = [];

  try {
    const { data, error } = await (api.GET as any)("/pos/transactions", {
      cache: "no-store",
    });
    if (!error && data) {
      initialTransactions = (data as any).data || data;
    }
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
  }

  return <TransactionsContainer initialTransactions={initialTransactions} />;
}
