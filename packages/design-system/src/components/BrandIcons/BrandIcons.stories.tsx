import React from "react";
import type { Meta } from "@storybook/react";
import { GoogleIcon, GitHubIcon } from "./BrandIcons";

const meta: Meta = {
  title: "Components/BrandIcons",
  tags: ["autodocs"],
};
export default meta;

export const Default = {
  render: () => (
    <div className="flex items-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-xs">Google</span>
        <GoogleIcon className="h-8 w-8" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-xs">GitHub</span>
        <GitHubIcon className="text-foreground h-8 w-8" />
      </div>
    </div>
  ),
};
