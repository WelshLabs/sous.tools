import type { Meta } from "@storybook/react";
import { BrandLoader, Spinner, DotsLoader, ProgressBar } from "./Loader";

const meta: Meta = {
  title: "Components/Loader",
  tags: ["autodocs"],
};
export default meta;

export const BrandLoaderVariants = () => (
  <div className="flex flex-col gap-4">
    <BrandLoader size="sm" />
    <BrandLoader size="md" />
    <BrandLoader size="lg" />
    <BrandLoader size="xl" />
  </div>
);

export const SpinnerVariants = () => (
  <div className="flex flex-col gap-4">
    <Spinner size="sm" />
    <Spinner size="md" />
    <Spinner size="lg" />
    <Spinner size="xl" />
  </div>
);

export const Dots = () => <DotsLoader />;
export const Progress = () => (
  <div className="w-full max-w-md space-y-4">
    <ProgressBar value={40} />
    <ProgressBar />
  </div>
);
