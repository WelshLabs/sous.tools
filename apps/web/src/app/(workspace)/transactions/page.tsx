import React from "react";
import { TransactionsView } from "./TransactionsView";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  let initialTransactions = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos/transactions`, { cache: 'no-store' });
    if (res.ok) {
      initialTransactions = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
  }

  return <TransactionsView initialTransactions={initialTransactions} />;
}
