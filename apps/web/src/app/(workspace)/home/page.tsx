import React from "react";
import { AnswerView } from "@soustools/domain-inventory";
import { FinancialPulse } from "./components/FinancialPulse";
import { MenuProfitability } from "./components/MenuProfitability";
import { SystemHealth } from "./components/SystemHealth";
import { PurchasingAlerts } from "./components/PurchasingAlerts";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string; prompt?: string }>;
}) {
  const resolvedParams = await searchParams;

  if (resolvedParams?.chat) {
    return (
      <div className="w-full min-h-screen pt-28 px-4 md:px-8">
        <AnswerView
          initialQuery={resolvedParams?.prompt}
          initialReviewId={resolvedParams?.chat}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] p-6 space-y-6">
      <h1 className="text-3xl font-bold">Home Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialPulse />
        <MenuProfitability />
        <SystemHealth />
        <PurchasingAlerts />
      </div>
    </div>
  );
}
