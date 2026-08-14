const iconCls =
  "rounded border border-white/20 bg-background/10 dark:bg-background/10";

export const FullScreenIcon: React.FC = () => (
  <div className="flex h-12 w-20 items-center justify-center">
    <div className={`h-full w-full ${iconCls}`} />
  </div>
);

export const ColumnsIcon: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex h-12 w-20 gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`h-full flex-1 ${iconCls}`} />
    ))}
  </div>
);

type SplitRatioLabel = "50/50" | "60/40" | "40/60";

export const SplitIcon: React.FC<{ ratio: SplitRatioLabel }> = ({ ratio }) => {
  const parts = ratio.split("/").map(Number);
  const total = parts[0] + parts[1];
  return (
    <div className="flex h-12 w-20 gap-0.5">
      <div
        className={`h-full ${iconCls}`}
        style={{ width: `${(parts[0] / total) * 100}%` }}
      />
      <div
        className={`h-full ${iconCls}`}
        style={{ width: `${(parts[1] / total) * 100}%` }}
      />
    </div>
  );
};
