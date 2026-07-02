"use client";

import React, { useState, useEffect } from "react";
import { ActiveKitchen } from "@soustools/domain-recipes";
import { Recipe, KitchenTimerState } from "@soustools/api-types";

export function KitchenClientPage({ recipe }: { recipe: Recipe }) {
  const [timers, setTimers] = useState<KitchenTimerState[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`timers_${recipe.id}`);
    if (saved) {
      try {
        setTimers(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse timers", err);
      }
    }
  }, [recipe.id]);

  const handleUpdateTimers = (newTimers: KitchenTimerState[]) => {
    setTimers(newTimers);
    localStorage.setItem(`timers_${recipe.id}`, JSON.stringify(newTimers));
  };

  return (
    <ActiveKitchen
      recipe={recipe}
      activeTimers={timers}
      onUpdateTimers={handleUpdateTimers}
      backHref={`/recipes/${recipe.id}`}
    />
  );
}
