"use client";

import type { OpenFoodFactsProduct } from "./ComplianceSearch";

export interface ComplianceSearchResultItemProps {
  prod: OpenFoodFactsProduct;
  onSelectProduct: (prod: OpenFoodFactsProduct) => void;
}

export function ComplianceSearchResultItem({
  prod,
  onSelectProduct,
}: ComplianceSearchResultItemProps) {
  return (
    <button
      onClick={() => onSelectProduct(prod)}
      className="w-full text-left p-3 rounded-lg transition-all cursor-pointer flex justify-between items-center gap-4"
      style={{
        backgroundColor: "rgb(30 41 59 / 0.50)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div>
        <h4
          className="text-sm font-bold line-clamp-1"
          style={{ color: "var(--color-foreground)" }}
        >
          {prod.product_name || prod.product_name_en || "Unnamed Product"}
        </h4>
        <p
          className="text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {prod.brands || "Unknown Brand"}
        </p>
      </div>
      <div
        className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap"
        style={{
          backgroundColor: "rgb(76 201 240 / 0.10)",
          border: "1px solid rgb(76 201 240 / 0.20)",
          color: "var(--color-primary)",
        }}
      >
        Select &amp; Auto-fill
      </div>
    </button>
  );
}
