import { Delete } from "lucide-react";

interface POSTenderKeypadProps {
  onPress: (val: string) => void;
}

export function POSTenderKeypad({ onPress }: POSTenderKeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 pt-2">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map(
        (key) => (
          <button
            key={key}
            type="button"
            onClick={() => onPress(key)}
            className="border-border/50 bg-card/30 hover:bg-card/70 text-foreground flex h-12 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border text-sm font-bold transition-all"
          >
            {key === "⌫" ? (
              <Delete className="text-muted-foreground h-4 w-4" />
            ) : (
              key
            )}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPress("C")}
        className="border-border/50 bg-destructive/10 text-destructive hover:bg-destructive/20 col-span-3 mt-1 flex h-10 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border text-xs font-bold transition-all"
      >
        Clear Input
      </button>
    </div>
  );
}
