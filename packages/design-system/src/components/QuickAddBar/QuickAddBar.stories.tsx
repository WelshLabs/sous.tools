import type { Meta, StoryObj } from "@storybook/react";
import { QuickAddBar } from "./QuickAddBar";

const meta: Meta<typeof QuickAddBar> = {
  title: "Components/QuickAddBar",
  component: QuickAddBar,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
    onChange: () => {},
    suggestions: [],
    onSelectSuggestion: () => {},
    onAddFreeText: () => {},
  },
};
