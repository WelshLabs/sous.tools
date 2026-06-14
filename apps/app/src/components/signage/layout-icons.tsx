import React from "react";

const iconCls = "rounded border border-white/20 bg-white/10";

export const FullScreenIcon: React.FC = () => (
  <div className="w-20 h-12 flex items-center justify-center">
    <div className={`w-full h-full ${iconCls}`} />
  </div>
);

export const ColumnsIcon: React.FC<{ count: number }> = ({ count }) => (
  <div className="w-20 h-12 flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`flex-1 h-full ${iconCls}`} />
    ))}
  </div>
);

type SplitRatioLabel = "50/50" | "60/40" | "40/60";

export const SplitIcon: React.FC<{ ratio: SplitRatioLabel }> = ({ ratio }) => {
  const parts = ratio.split("/").map(Number);
  const total = parts[0] + parts[1];
  return (
    <div className="w-20 h-12 flex gap-0.5">
      <div className={`h-full ${iconCls}`} style={{ width: `${(parts[0] / total) * 100}%` }} />
      <div className={`h-full ${iconCls}`} style={{ width: `${(parts[1] / total) * 100}%` }} />
    </div>
  );
};
