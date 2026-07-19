import type { Meta, StoryObj } from "@storybook/react";
import { ActiveKitchenView } from "./ActiveKitchen.view";
import { type Recipe } from "@soustools/api-types";

const mockRecipe: Recipe = {
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
    { stepNumber: 1, text: "Chop vegetables", timerDurationSeconds: undefined },
    { stepNumber: 2, text: "Boil water", timerDurationSeconds: 600 },
    { stepNumber: 3, text: "Cook pasta", timerDurationSeconds: undefined },
  ],
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const meta: Meta<typeof ActiveKitchenView> = {
  title: "Domain Recipes/ActiveKitchenView",
  component: ActiveKitchenView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ActiveKitchenView>;

export const Default: Story = {
  args: {
    recipe: mockRecipe,
    backHref: "/recipes",
    wakeLockActive: true,
    checkedSteps: { 1: true },
    onToggleStepCheck: () => {},
    onStartStepTimer: () => {},
    tickedTimers: [
      {
        id: "timer-1",
        stepIndex: 2,
        durationSeconds: 600,
        elapsedSeconds: 300,
        isActive: true,
        startedAt: new Date(Date.now() - 300000).toISOString(),
        pausedAt: null,
      },
    ],
    onStartPauseTimer: () => {},
    onResetTimer: () => {},
    onRemoveTimer: () => {},
  },
};
