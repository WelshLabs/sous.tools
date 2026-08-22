"use client";
import { useState, useEffect, useRef } from "react";

type SaveState = "idle" | "saving" | "saved";

/** Tracks the save lifecycle and flashes a "Saved" state for 1.5s after completion. */
export function useSaveState(saving: boolean): SaveState {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const prevSaving = useRef(saving);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevSaving.current && !saving) {
      setSaveState("saved");
      flashTimer.current = setTimeout(() => setSaveState("idle"), 1500);
    } else if (saving) {
      setSaveState("saving");
    }
    prevSaving.current = saving;
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [saving]);

  return saveState;
}
