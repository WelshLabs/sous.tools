import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Star } from "lucide-react";
import { Chip } from "./Chip";

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    children: "Standard Chip",
  },
};

export const Selected: Story = {
  args: {
    children: "Selected Chip",
    selected: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: "With Icon",
    icon: <Star className="h-4 w-4" />,
  },
};

export const Removable: Story = {
  args: {
    children: "Removable Chip",
    onRemove: () => alert("Removed!"),
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Chip",
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Chip size="sm">Small</Chip>
      <Chip size="md">Medium</Chip>
      <Chip size="lg">Large</Chip>
    </div>
  ),
};
