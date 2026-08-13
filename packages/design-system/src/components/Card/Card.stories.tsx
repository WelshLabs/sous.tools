import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";
import { Button } from "../Button/Button";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
};
export default meta;

export const Default: StoryObj<typeof Card> = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content Goes Here</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Cancel
        </Button>
        <Button className="w-full">Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const SolidNoGlass: StoryObj<typeof Card> = {
  render: () => (
    <Card glass={false} className="w-[350px]">
      <CardHeader>
        <CardTitle>Solid Card</CardTitle>
        <CardDescription>A card without the glass effect.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Solid content</p>
      </CardContent>
    </Card>
  ),
};

export const Glowing: StoryObj<typeof Card> = {
  render: () => (
    <Card glow className="w-[350px]">
      <CardHeader>
        <CardTitle>Glowing Card</CardTitle>
        <CardDescription>A card with a shadow glow.</CardDescription>
      </CardHeader>
    </Card>
  ),
};
