import type { Meta } from "@storybook/react";
import { Hamburger } from "./Hamburger";
import { useState } from "react";

const meta: Meta<typeof Hamburger> = {
  title: "Components/Hamburger",
  component: Hamburger,
  tags: ["autodocs"],
};
export default meta;

export const Interactive = () => {
  const [isOpen, setIsOpen] = useState(false);
  return <Hamburger isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />;
};

export const Open = () => <Hamburger isOpen={true} onClick={() => {}} />;
export const Closed = () => <Hamburger isOpen={false} onClick={() => {}} />;
