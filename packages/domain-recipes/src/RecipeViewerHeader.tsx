"use client";

import type React from "react";
import { ArrowLeft, Play, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@soustools/design-system";

export interface RecipeViewerHeaderProps {
  recipeTitle: string;
  recipeId: string;
  backHref: string;
  onOpenHistory: () => void;
}

export function RecipeViewerHeader({
  recipeTitle,
  recipeId,
  backHref,
  onOpenHistory,
}: RecipeViewerHeaderProps) {
  return (
    <header
      className="flex justify-between items-center pb-4"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="p-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-extrabold font-brand tracking-wide">
          {recipeTitle}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 shadow-lg"
        >
          <History className="w-4 h-4" /> History
        </Button>
        <Link href={`/recipes/${recipeId}/kitchen`}>
          <Button
            size="sm"
            className="flex items-center gap-1.5 shadow-lg"
            style={{
              backgroundColor: "#10b981",
              color: "#fff",
              borderColor: "transparent",
            }}
          >
            <Play className="w-4 h-4 fill-current" /> Active Kitchen Mode
          </Button>
        </Link>
      </div>
    </header>
  );
}
