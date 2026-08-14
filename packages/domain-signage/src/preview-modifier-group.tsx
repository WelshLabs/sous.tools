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
      <div className="bg-background border-border text-muted-foreground flex min-h-[60px] w-full animate-pulse items-center justify-center rounded border border-dashed p-4 text-[10px] italic">
        Loading Options...
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="bg-background border-border text-muted-foreground flex items-center justify-center rounded border border-dashed p-3 text-[10px] italic">
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
      <div className="bg-muted/50 border-border text-muted-foreground border-b px-3 py-2 text-[10px] font-semibold tracking-wider uppercase">
        Options
      </div>
      <div className="flex flex-col divide-y divide-white/5">
        {options.map((opt) => (
          <div
            key={opt.id}
            className="flex items-center justify-between px-3 py-2 text-[10px]"
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
