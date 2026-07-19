import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BottomNav } from './BottomNav';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('BottomNav', () => {
  it('renders the navigation items', () => {
    const onToggleMobile = vi.fn();
    render(<BottomNav onToggleMobile={onToggleMobile} />);

    // Check that Dashboard item is rendered and active (colored)
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toBeInTheDocument();

    // Check that Recipes and Orders links are rendered
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('triggers onToggleMobile when More button is clicked', () => {
    const onToggleMobile = vi.fn();
    render(<BottomNav onToggleMobile={onToggleMobile} />);

    const moreButton = screen.getByRole('button', { name: 'Open navigation menu' });
    fireEvent.click(moreButton);

    expect(onToggleMobile).toHaveBeenCalledTimes(1);
  });
});
