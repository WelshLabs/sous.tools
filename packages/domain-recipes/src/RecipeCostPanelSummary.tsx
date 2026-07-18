import React from 'react';
import { DollarSign } from 'lucide-react';

interface RecipeCostTileProps {
  label: string;
  value: string;
  color: string;
}

const RecipeCostTile: React.FC<RecipeCostTileProps> = ({
  label,
  value,
  color,
}) => {
  const tileStyle: React.CSSProperties = {
    backgroundColor: "rgb(15 23 42 / 0.40)",
    border: "1px solid var(--color-border)",
  };

  return (
    <div className="p-2 rounded-lg" style={tileStyle}>
      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
        {label}
      </p>
      <p className="text-sm font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
};

interface RecipeCostPanelSummaryProps {
  costData: RecipeCostData;
  tileStyle: React.CSSProperties;
}

export function RecipeCostPanelSummary({
  costData,
  tileStyle,
}: RecipeCostPanelSummaryProps) {
  const {
    totalCostUsd,
    costPerServingUsd,
    linkedSalePrice,
    marginPct,
    suggestedSalePrice,
  } = costData;

  const marginColor: string =
    marginPct === undefined
      ? "var(--color-destructive)"
      : marginPct > 30
      ? "#10b981"
      : marginPct >= 10
      ? "#f59e0b"
      : "var(--color-destructive)";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-center">
      {
        [
          {
            label: "Batch Cost",
            value: `$${totalCostUsd.toFixed(2)}`,
            color: "var(--color-foreground)",
          },
          {
            label: "Plate Cost",
            value: `$${costPerServingUsd.toFixed(2)}`,
            color: "var(--color-foreground)",
          },
          {
            label: "Sug. Sale Price",
            value: suggestedSalePrice
              ? `$${suggestedSalePrice.toFixed(2)}`
              : "—",
            color: "#4cc9f0",
          },
          {
            label: "Linked POS",
            value: linkedSalePrice ? `$${linkedSalePrice.toFixed(2)}` : "—",
            color: "var(--color-foreground)",
          },
          {
            label: "Margin",
            value: marginPct !== undefined ? `${marginPct.toFixed(1)}%` : "—",
            color: marginColor,
          },
        ].map(({ label, value, color }) => (
          <RecipeCostTile key={label} label={label} value={value} color={color} />
        ))
      }
    </div>
  );
}
