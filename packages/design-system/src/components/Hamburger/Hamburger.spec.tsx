import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Hamburger } from './Hamburger';

describe('Hamburger', () => {
  it('renders without crashing', () => {
    const { container } = render(<Hamburger isOpen={false} onClick={() => {}} />);
    expect(container).toBeTruthy();
  });
});
