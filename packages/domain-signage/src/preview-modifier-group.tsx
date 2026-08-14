"use client";
import * as React from "react";

export const PreviewModifierGroup = ({
  block,
  onFetchModifierOptions,
}: {
  block: any;
  onFetchModifierOptions?: (id: string) => Promise<any[]>;
}) => {
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchOptions() {
      if (!block.modifierGroupId || !onFetchModifierOptions) {
        setLoading(false);
        return;
      }
      try {
        const data = await onFetchModifierOptions(block.modifierGroupId);
        setOptions(data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchOptions();
  }, [block.modifierGroupId, onFetchModifierOptions]);

  if (loading) {
    return (
      <div className="w-full min-h-[60px] flex items-center justify-center p-4 bg-background border border-dashed border-border rounded text-muted-foreground italic text-[10px] animate-pulse">
        Loading Options...
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="p-3 bg-background border border-dashed border-border rounded text-[10px] text-muted-foreground italic flex items-center justify-center">
        Modifier Group: {block.modifierGroupId || "Dynamic"} (No options found)
      </div>
    );
  }

  const classes = [
    "w-full bg-background/5 dark:bg-background/40 rounded border border-border overflow-hidden",
    block.className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} data-unique-id={block.uniqueSelector}>
      <div className="px-3 py-2 bg-muted/50 border-b border-border font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
        Options
      </div>
      <div className="flex flex-col divide-y divide-white/5">
        {options.map((opt) => (
          <div
            key={opt.id}
            className="flex justify-between items-center px-3 py-2 text-[10px]"
          >
            <span className="text-foreground">{opt.name}</span>
            <span className="text-muted-foreground font-mono">
              {opt.price > 0 ? `+$${Number(opt.price).toFixed(2)}` : "Free"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
