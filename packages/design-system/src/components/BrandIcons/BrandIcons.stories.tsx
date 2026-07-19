import React from 'react';
import type { Meta } from '@storybook/react';
import { GoogleIcon, GitHubIcon } from './BrandIcons';

const meta: Meta = {
  title: 'Components/BrandIcons',
  tags: ['autodocs'],
};
export default meta;

export const Default = {
  render: () => (
    <div className="flex items-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">Google</span>
        <GoogleIcon className="w-8 h-8" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">GitHub</span>
        <GitHubIcon className="w-8 h-8 text-foreground" />
      </div>
    </div>
  ),
};
