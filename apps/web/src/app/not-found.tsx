import React from "react";
import Link from "next/link";
import { Button } from "@soustools/design-system";

export default function NotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-4 bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent">
        404
      </h1>
      <h2 className="mb-2 text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">
        The page or resource you are looking for does not exist or has been
        moved.
      </p>
      <Link href="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
