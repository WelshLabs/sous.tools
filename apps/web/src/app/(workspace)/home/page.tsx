import { PrimaryLogo } from "@soustools/design-system";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <PrimaryLogo className="text-sky-400 h-24 w-auto mb-8" />
    </div>
  );
}
