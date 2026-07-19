import React from 'react';
import { render } from '@testing-library/react';
import { SignageEditorView } from './SignageEditor.view';
import { describe, it, expect } from 'vitest';

describe('SignageEditorView', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <SignageEditorView
        layout={{}}
        setLayout={() => {}}
        selectedNodeId={null}
        setSelectedNodeId={() => {}}
      />
    );
    expect(getByText('Layout Builder Canvas')).toBeTruthy();
  });
});
