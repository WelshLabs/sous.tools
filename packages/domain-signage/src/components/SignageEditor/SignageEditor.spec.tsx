import React from 'react';
import { render, screen } from '@testing-library/react';
import { SignageEditor } from './SignageEditor.container';
import { describe, it, expect } from 'vitest';

describe('SignageEditor', () => {
  it('renders correctly', () => {
    render(
      <SignageEditor
        items={[]}
      />
    );
    expect(screen.getByDisplayValue('TV Signage')).toBeInTheDocument();
  });
});
