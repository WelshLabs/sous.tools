import type { Meta } from "@storybook/react";
import { AuroraBackground } from "./AuroraBackground";

const meta: Meta<typeof AuroraBackground> = {
  title: "Components/AuroraBackground",
  component: AuroraBackground,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => (
  <div className="border-border relative h-[400px] w-full overflow-hidden rounded-xl border">
    <AuroraBackground />
    <div className="text-foreground relative z-10 flex h-full items-center justify-center text-4xl font-black">
      Neon Glass
    </div>
  </div>
);
