import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { InsightsSidebar } from './InsightsSidebar';

const meta: Meta<typeof InsightsSidebar> = {
  title: 'Components/InsightsSidebar',
  component: InsightsSidebar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InsightsSidebar>;

export const Default: Story = {
  args: {
    suppliers: [
      { id: '1', name: 'Fresh Produce Co', deliveryDays: [1, 3, 5] },
      { id: '2', name: 'Meat Pack Inc', deliveryDays: [2, 4] },
    ],
    onAddVendor: () => alert('Add Vendor clicked'),
  },
  render: (args) => (
    <div className="w-80">
      <InsightsSidebar {...args} />
    </div>
  ),
};

export const NoSuppliers: Story = {
  args: {
    suppliers: [],
    onAddVendor: () => alert('Add Vendor clicked'),
  },
  render: (args) => (
    <div className="w-80">
      <InsightsSidebar {...args} />
    </div>
  ),
};
