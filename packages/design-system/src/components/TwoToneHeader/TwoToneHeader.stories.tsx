import type { Meta } from '@storybook/react';
import { TwoToneHeader } from './TwoToneHeader';

const meta: Meta<typeof TwoToneHeader> = {
  title: 'Components/TwoToneHeader',
  component: TwoToneHeader,
  tags: ['autodocs'],
};
export default meta;

export const Default = () => <TwoToneHeader title="Order Manager" />;
export const WithBreadcrumb = () => <TwoToneHeader breadcrumb="Procurement / Active" title="Living Orders" />;
export const WithTrailing = () => <TwoToneHeader title="Inventory Check" trailing={<span className="bg-primary/20 text-primary px-2 py-1 rounded">Action</span>} />;
