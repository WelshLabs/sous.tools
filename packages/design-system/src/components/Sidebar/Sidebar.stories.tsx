import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Home, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SidebarLayout } from './SidebarLayout';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const SidebarWrapper = (args: Partial<React.ComponentProps<typeof Sidebar>>) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div className="h-screen w-full bg-background flex flex-col pt-16">
      <Sidebar
        {...args}
        isMobileOpen={isMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        onCloseMobile={() => setIsMobileOpen(false)}
        onToggleDesktop={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        navItems={navItems}
        isAdmin={true}
        expandedLogo={<div className="font-bold">SOUSTOOLS</div>}
        collapsedIcon={<div className="font-bold">ST</div>}
      />
      <div className="pl-64 p-8">Main Content Area</div>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <SidebarWrapper {...args} />,
};

export const LayoutStory: StoryObj<typeof SidebarLayout> = {
  render: () => {
    return (
      <SidebarLayout
        sidebarContent={<div className="p-4">Sidebar Content</div>}
        mainContent={<div className="p-4">Main Content</div>}
      />
    );
  }
};
