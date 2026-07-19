import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PinInput } from './PinInput';

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;

describe('PinInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correct number of slots', () => {
    const handleChange = vi.fn();
    render(<PinInput value="" onChange={handleChange} length={4} />);
    
    // input-otp renders one hidden input and slots
    // Let's check for the visual slots (represented by the text "-")
    const emptySlots = screen.getAllByText('-');
    expect(emptySlots).toHaveLength(4);
  });

  it('displays entered value', () => {
    render(<PinInput value="123" onChange={vi.fn()} length={6} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    const emptySlots = screen.getAllByText('-');
    expect(emptySlots).toHaveLength(3);
  });
});
