import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'john@example.com',
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    error: 'Username is required',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    type: 'password',
    hint: 'Must be at least 8 characters long.',
  },
};

export const WithIconAndTrailing: Story = {
  args: {
    label: 'Search',
    icon: <span>🔍</span>,
    trailing: <span>⌘K</span>,
  },
};
