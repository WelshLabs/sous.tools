import type { Meta } from "@storybook/react";
import { LoginButton } from "./LoginButton";

const meta: Meta<typeof LoginButton> = {
  title: "Components/LoginButton",
  component: LoginButton,
  tags: ["autodocs"],
};
export default meta;

export const States = () => (
  <div className="flex max-w-sm flex-col gap-4">
    <LoginButton state="idle" />
    <LoginButton state="loading" />
    <LoginButton state="success" />
    <LoginButton state="error" />
  </div>
);
