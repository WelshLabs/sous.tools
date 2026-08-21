"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@soustools/design-system";

export function PrivacyPolicyView() {
  return (
    <div className="bg-background text-foreground mx-auto min-h-screen max-w-4xl space-y-8 px-6 py-16">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-sky-500 transition-colors hover:text-sky-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm">
          Last Updated: July 12, 2026
        </p>
      </div>

      <Card className="space-y-6 p-8">
        <section className="space-y-3">
          <h2 className="text-xl font-bold">1. Information We Collect</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We collect information when you register an account, configure your
            POS integrations (such as Square), and use our Kitchen Display
            Systems or Recipes features. This includes email address, business
            location information, menu catalog data, and device identifiers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">2. How We Use Information</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The data collected is strictly utilized to provide automated catalog
            synchronization, process order metrics, coordinate Back-of-House
            workflows, and improve application capabilities. We never sell your
            personal or business data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">3. Data Security & Storage</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            All database connections and credentials are secure, isolated via
            multi-tenant Row Level Security (RLS) policies, and encrypted.
            Direct token credentials for integrations (e.g., Square and Google
            Drive) are stored under cryptographic hashes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">4. Third-Party Integrations</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            By connecting Square or Google Drive, you authorize SOUS.TOOLS to
            access specified endpoints (such as catalog, items, and files).
            These integrations strictly respect the security guidelines of each
            respective platform and can be disconnected at any time.
          </p>
        </section>
      </Card>

      <footer className="text-muted-foreground pt-8 text-center text-xs">
        &copy; 2026 SOUS.TOOLS. All rights reserved.
      </footer>
    </div>
  );
}
