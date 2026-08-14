import type { Meta } from "@storybook/react";
import { PrimaryLogo, MicroIcon, Lettermark, AnimatedLettermark } from "./Logo";

const meta: Meta = {
  title: "Components/Logos",
  tags: ["autodocs"],
};
export default meta;

export const AllLogos = () => (
  <div className="flex flex-col gap-8 items-start p-8 bg-zinc-950 text-white">
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-500">PrimaryLogo</h3>
      <PrimaryLogo className="h-12 w-auto" />
    </div>
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-500">MicroIcon</h3>
      <MicroIcon className="h-12 w-12" />
    </div>
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-500">Lettermark</h3>
      <Lettermark className="h-12 w-auto" />
    </div>
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-500">
        AnimatedLettermark
      </h3>
      <AnimatedLettermark className="h-12 w-auto" />
    </div>
  </div>
);
