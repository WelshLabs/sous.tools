import type { Meta } from "@storybook/react";
import { TopProgress } from "./TopProgress";
import { useState, useEffect } from "react";

const meta: Meta<typeof TopProgress> = {
  title: "Components/TopProgress",
  component: TopProgress,
  tags: ["autodocs"],
};
export default meta;

export const Interactive = () => {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setActive((a) => !a), 3000);
    return () => clearInterval(interval);
  }, []);
  return <TopProgress active={active} absolute />;
};
