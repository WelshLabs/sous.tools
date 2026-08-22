"use client";
import type { Meta, StoryObj } from "@storybook/react";
import { POSRegisterView } from "./pos.view";

const meta = {
  title: "Domain POS/POSRegister",
  component: POSRegisterView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof POSRegisterView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    catalog: (
      <div className="h-full w-full bg-gray-100 p-4">Catalog Placeholder</div>
    ),
    ticket: (
      <div className="h-full w-full bg-gray-200 p-4">Ticket Placeholder</div>
    ),
    header: <div className="border-b p-2">Header Placeholder</div>,
  },
};
