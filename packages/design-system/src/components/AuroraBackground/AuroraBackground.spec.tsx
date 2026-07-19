import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuroraBackground } from './AuroraBackground';

describe('AuroraBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<AuroraBackground />);
    expect(container).toBeTruthy();
  });
});
