import type { Meta, StoryObj } from '@storybook/react';
import { GoogleIcon } from './BrandIcons';

const meta: Meta<typeof GoogleIcon> = {
  title: 'Components/BrandIcons',
  component: GoogleIcon,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {}
};
