import React from "react";
import Link from "next/link";
import { Button } from "@soustools/design-system";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent mb-4">
        404
      </h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        The page or resource you are looking for does not exist or has been
        moved.
      </p>
      <Link href="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
