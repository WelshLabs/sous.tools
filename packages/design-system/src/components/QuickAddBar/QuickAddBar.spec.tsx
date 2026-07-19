import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QuickAddBar } from './QuickAddBar';

describe('QuickAddBar', () => {
  it('renders without crashing', () => {
    const { container } = render(<QuickAddBar value="" onChange={() => {}} suggestions={[]} onSelectSuggestion={() => {}} onAddFreeText={() => {}} />);
    expect(container).toBeTruthy();
  });
});
