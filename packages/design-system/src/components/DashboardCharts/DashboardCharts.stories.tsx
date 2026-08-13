import type { Meta, StoryObj } from "@storybook/react";
import { RevenueChart } from "./DashboardCharts";

const meta: Meta<typeof RevenueChart> = {
  title: "Components/DashboardCharts",
  component: RevenueChart,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { data: [{ name: "Mon", value: 100 }] },
};
