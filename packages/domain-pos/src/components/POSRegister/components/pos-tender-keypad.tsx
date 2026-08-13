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
            className="h-12 text-sm font-bold rounded-[var(--radius-sm)] border border-border/50 bg-card/30 hover:bg-card/70 text-foreground cursor-pointer flex items-center justify-center transition-all"
          >
            {key === "⌫" ? (
              <Delete className="h-4 w-4 text-muted-foreground" />
            ) : (
              key
            )}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPress("C")}
        className="col-span-3 h-10 text-xs font-bold rounded-[var(--radius-sm)] border border-border/50 bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer flex items-center justify-center transition-all mt-1"
      >
        Clear Input
      </button>
    </div>
  );
}
