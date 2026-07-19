import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OmniBarPresentation } from './OmniBarPresentation';
import { OmniBarProvider } from './OmniBarProvider';

// Mock global fetch to prevent invalid URL or request failures
beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('/api/integrations/status')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      } as Response);
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
  });
});

// Mock browser dependencies that might not exist in jsdom using constructor classes
vi.stubGlobal(
  'webkitSpeechRecognition',
  class {
    start() {}
    stop() {}
  }
);

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

// Mock socket.io-client including the "io" export
vi.mock('socket.io-client', () => {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };
  return {
    io: vi.fn(() => mockSocket),
    default: vi.fn(() => mockSocket),
  };
});

describe('OmniBar', () => {
  it('renders OmniBarProvider and presentation components without crashing', () => {
    const { container } = render(
      <OmniBarProvider>
        <OmniBarPresentation />
      </OmniBarProvider>
    );
    expect(container).toBeTruthy();
    
    // Check that the trigger button is rendered
    const triggerButtons = screen.getAllByRole('button', { name: "Open sous chef" });
    expect(triggerButtons.length).toBeGreaterThan(0);
  });
});
