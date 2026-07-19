import type { Meta } from '@storybook/react';
import { AuroraBackground } from './AuroraBackground';

const meta: Meta<typeof AuroraBackground> = {
  title: 'Components/AuroraBackground',
  component: AuroraBackground,
  tags: ['autodocs'],
};
export default meta;

export const Default = () => (
  <div className="relative w-full h-[400px] overflow-hidden rounded-xl border border-border">
    <AuroraBackground />
    <div className="relative z-10 flex h-full items-center justify-center text-foreground font-black text-4xl">
      Neon Glass
    </div>
  </div>
);
