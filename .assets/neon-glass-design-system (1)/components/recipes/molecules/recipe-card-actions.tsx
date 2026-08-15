"use client"

import { Eye, Play, Pencil, Trash2 } from "lucide-react"
import { RecipeActionButton } from "../atoms/recipe-action-button"

export interface RecipeActionHandlers {
  onView: () => void
  onRun: () => void
  onEdit: () => void
  onDelete: () => void
}

/**
 * Molecule: the four recipe actions. "Run" is the emphasized primary (this is
 * a kitchen OS — firing a recipe is the hot path); View / Edit / Delete are
 * secondary icon controls. Delete carries the destructive tone on hover.
 */
export function RecipeCardActions({ onView, onRun, onEdit, onDelete }: RecipeActionHandlers) {
  return (
    <div className="flex items-center justify-between gap-2">
      <RecipeActionButton
        tone="run"
        showLabel
        label="Run"
        icon={<Play className="h-4 w-4 fill-current" />}
        onClick={onRun}
      />
      <div className="flex items-center gap-2">
        <RecipeActionButton tone="neutral" label="View" icon={<Eye className="h-4 w-4" />} onClick={onView} />
        <RecipeActionButton tone="neutral" label="Edit" icon={<Pencil className="h-4 w-4" />} onClick={onEdit} />
        <RecipeActionButton tone="danger" label="Delete" icon={<Trash2 className="h-4 w-4" />} onClick={onDelete} />
      </div>
    </div>
  )
}
