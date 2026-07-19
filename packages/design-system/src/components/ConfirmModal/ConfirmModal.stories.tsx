import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { Button } from '../Button/Button';

const meta: Meta<typeof ConfirmModal> = {
  title: 'Components/ConfirmModal',
  component: ConfirmModal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfirmModal>;

const ConfirmModalDefaultWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <ConfirmModal
        isOpen={isOpen}
        title="Save Changes"
        message="Are you sure you want to save these changes?"
        onConfirm={() => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              setIsOpen(false);
              resolve();
            }, 1000);
          });
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <ConfirmModalDefaultWrapper />,
};

const ConfirmModalDestructiveWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8">
      <Button variant="destructive" onClick={() => setIsOpen(true)}>Delete Item</Button>
      <ConfirmModal
        isOpen={isOpen}
        title="Delete Recipe"
        message="This action cannot be undone. Are you sure you want to delete this recipe?"
        isDestructive
        confirmText="Delete"
        onConfirm={() => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              setIsOpen(false);
              resolve();
            }, 1000);
          });
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  );
};

export const Destructive: Story = {
  render: () => <ConfirmModalDestructiveWrapper />,
};
