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
      <div className="p-4 bg-gray-100 h-full w-full">Catalog Placeholder</div>
    ),
    ticket: (
      <div className="p-4 bg-gray-200 h-full w-full">Ticket Placeholder</div>
    ),
    header: <div className="p-2 border-b">Header Placeholder</div>,
  },
};
