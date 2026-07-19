/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from 'react';
import { ActiveKitchenView } from "./ActiveKitchen.view";

describe("ActiveKitchenView", () => {
  const mockRecipe = {
    id: "rec-1",
    title: "Test Recipe",
    description: "A recipe for testing",
    authorId: "auth-1",
    difficulty: "easy",
    cuisine: "Test",
    cookTimeMinutes: 30,
    prepTimeMinutes: 10,
    ingredients: [],
    instructions: [
      { stepNumber: 1, text: "Boil water", timerDurationSeconds: 600 },
    ],
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any;

  it("renders correctly", () => {
    render(
      <ActiveKitchenView
        recipe={mockRecipe}
        backHref="/recipes"
        wakeLockActive={false}
        checkedSteps={{}}
        onToggleStepCheck={vi.fn()}
        onStartStepTimer={vi.fn()}
        tickedTimers={[]}
        onStartPauseTimer={vi.fn()}
        onResetTimer={vi.fn()}
        onRemoveTimer={vi.fn()}
      />
    );
    expect(screen.getByText("Test Recipe")).toBeDefined();
    expect(screen.getByText("Boil water")).toBeDefined();
  });
});
