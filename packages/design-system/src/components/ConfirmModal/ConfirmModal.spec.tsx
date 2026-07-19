import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmModal } from './ConfirmModal';

describe('ConfirmModal', () => {
  it('renders correctly when open', () => {
    render(
      <ConfirmModal
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('calls onCancel when cancel is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        title="Test"
        message="Test"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );
    
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm is clicked and shows loading state', async () => {
    const handleConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ConfirmModal
        isOpen={true}
        title="Test"
        message="Test"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );
    
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmBtn);
    
    expect(handleConfirm).toHaveBeenCalled();
    expect(screen.getByText('Working…')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
  });
});
