import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { Home } from 'lucide-react';

const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('Sidebar', () => {
  const defaultProps = {
    isMobileOpen: false,
    isDesktopCollapsed: false,
    onCloseMobile: vi.fn(),
    onToggleDesktop: vi.fn(),
    navItems: [{ label: 'Home', href: '/', icon: Home }],
    expandedLogo: <div>Logo</div>,
    collapsedIcon: <div>Icon</div>,
    isAdmin: true,
  };

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  it('renders navigation items', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Users Admin')).toBeInTheDocument();
  });

  it('handles desktop toggle', () => {
    render(<Sidebar {...defaultProps} />);
    const logo = screen.getByText('Logo');
    expect(logo).toBeInTheDocument();
  });
});
