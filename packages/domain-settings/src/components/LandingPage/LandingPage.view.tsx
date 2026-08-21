/* eslint-disable max-lines */
"use client";

import { Button, Card, PrimaryLogo } from "@soustools/design-system";
import Link from "next/link";
import {
  ShieldCheck,
  CloudLightning,
  Download,
  Package,
  ListOrdered,
  ClipboardList,
  Tv,
} from "lucide-react";

export interface LandingPageViewProps {
  session: unknown | null;
  onNavigate: (path: string) => void;
}

export function LandingPageView({ session, onNavigate }: LandingPageViewProps) {
  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-sky-500/30">
      {/* Header / Nav */}
      <header className="border-border bg-card/85 sticky top-0 z-50 flex items-center justify-between border-b px-6 py-4 backdrop-blur-md md:px-12">
        <div className="flex items-center gap-2">
          <PrimaryLogo className="h-12 w-auto text-sky-400" />
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <Button onClick={() => onNavigate("/home")}>Go to Dashboard</Button>
          ) : (
            <Button onClick={() => onNavigate("/login")} variant="outline">
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl space-y-6 px-6 py-20 text-center">
        <h1 className="bg-gradient-to-r from-sky-400 via-sky-200 to-violet-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-6xl">
          Professional Kitchen Operations, Automated
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg font-light md:text-xl">
          Scale your menus, manage vendor inventory ledger, sync Square catalog
          instantly, and deploy real-time digital display signage.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button
            onClick={() => onNavigate(session ? "/home" : "/login")}
            variant="primary"
            className="mt-4 px-8 py-3 text-lg shadow-[0_0_20px_rgba(76,201,240,0.3)] hover:shadow-[0_0_30px_rgba(76,201,240,0.5)]"
          >
            Get Started Natively
          </Button>
        </div>
      </section>

      {/* Core Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Core Capabilities
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <Package className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold">Square Catalog Sync</h3>
            <p className="text-muted-foreground text-sm">
              Directly map POS categories, items, and discounts. Automatically
              trigger stock updates.
            </p>
          </Card>
          <Card className="flex flex-col gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <ListOrdered className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="text-lg font-bold">Real-Time KDS</h3>
            <p className="text-muted-foreground text-sm">
              Organize tickets instantly, track preparation states, and flag
              rush orders in a unified display interface.
            </p>
          </Card>
          <Card className="flex flex-col gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <ClipboardList className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">Baker's Math & Scaling</h3>
            <p className="text-muted-foreground text-sm">
              Dynamic recipe scaling and precise baker's percentage calculations
              for consistent kitchen output.
            </p>
          </Card>
          <Card className="flex flex-col gap-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
              <Tv className="h-5 w-5 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold">Digital Signage OS</h3>
            <p className="text-muted-foreground text-sm">
              Cast live prep lists, daily specials, and custom menu signage
              boards natively to any television or monitor.
            </p>
          </Card>
        </div>
      </section>

      {/* 3-Tiered Pricing Plans */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Flexible Pricing for Growing Kitchens
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="border-border flex flex-col justify-between p-8">
            <div>
              <h3 className="text-xl font-bold text-sky-500">Starter</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                For single-station cafes.
              </p>
              <div className="mt-6 text-4xl font-extrabold">
                $49
                <span className="text-muted-foreground text-base font-normal">
                  /mo
                </span>
              </div>
              <ul className="text-muted-foreground mt-8 space-y-4 text-sm">
                <li className="flex items-center gap-2">
                  ✔ 1 Active Signage Display
                </li>
                <li className="flex items-center gap-2">
                  ✔ Square Catalog Integration
                </li>
                <li className="flex items-center gap-2">
                  ✔ Basic Recipe Manager
                </li>
              </ul>
            </div>
            <Button
              onClick={() => onNavigate("/login")}
              className="mt-8 w-full justify-center"
              variant="outline"
            >
              Choose Starter
            </Button>
          </Card>

          <Card className="relative flex flex-col justify-between border-sky-500/50 p-8 shadow-[0_0_30px_rgba(56,189,248,0.1)]">
            <span className="absolute top-0 right-8 -translate-y-1/2 transform rounded-full bg-sky-500 px-3 py-1 text-xs font-extrabold text-zinc-950 uppercase">
              Popular
            </span>
            <div>
              <h3 className="text-xl font-bold text-sky-400">Pro</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                For busy full-service restaurants.
              </p>
              <div className="mt-6 text-4xl font-extrabold">
                $149
                <span className="text-muted-foreground text-base font-normal">
                  /mo
                </span>
              </div>
              <ul className="text-muted-foreground mt-8 space-y-4 text-sm">
                <li className="flex items-center gap-2">
                  ✔ Unlimited Signage Displays
                </li>
                <li className="flex items-center gap-2">
                  ✔ Real-time Inventory Ledger
                </li>
                <li className="flex items-center gap-2">
                  ✔ Dynamic Baker's Math Sync
                </li>
                <li className="flex items-center gap-2">
                  ✔ Automated PO Dispatch
                </li>
              </ul>
            </div>
            <Button
              onClick={() => onNavigate("/login")}
              className="mt-8 w-full justify-center bg-sky-500 text-white hover:bg-sky-600"
              variant="primary"
            >
              Upgrade to Pro
            </Button>
          </Card>

          <Card className="border-border flex flex-col justify-between p-8">
            <div>
              <h3 className="text-xl font-bold text-violet-400">Enterprise</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Multi-location hospitality groups.
              </p>
              <div className="mt-6 text-4xl font-extrabold">Custom</div>
              <ul className="text-muted-foreground mt-8 space-y-4 text-sm">
                <li className="flex items-center gap-2">
                  ✔ Custom API / Webhook Access
                </li>
                <li className="flex items-center gap-2">
                  ✔ Dedicated Integration Drivers
                </li>
                <li className="flex items-center gap-2">
                  ✔ 99.9% Uptime Kiosk SLA
                </li>
                <li className="flex items-center gap-2">
                  ✔ Tenant Isolation Control
                </li>
              </ul>
            </div>
            <Button
              onClick={() => onNavigate("/login")}
              className="mt-8 w-full justify-center"
              variant="outline"
            >
              Contact Sales
            </Button>
          </Card>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="border-border bg-card/40 border-t py-16">
        <div className="mx-auto max-w-4xl space-y-8 px-6 text-center">
          <h2 className="text-3xl font-bold">Deploy Anywhere Natively</h2>
          <p className="text-muted-foreground mx-auto max-w-md font-light">
            Install our persistent BOH app on tablets, kiosks, and display
            controllers for continuous 24/7 cookline status.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://github.com/conarwelsh/signage-os/releases/latest"
              className="bg-card hover:bg-accent border-border flex items-center gap-3 rounded-2xl border px-6 py-4 transition-all"
            >
              <Download className="h-5 w-5 text-sky-400" />
              <div className="text-left">
                <div className="text-muted-foreground text-xs">
                  Download for Desktop
                </div>
                <div className="text-sm font-bold">Windows & Mac App</div>
              </div>
            </a>
            <a
              href="https://github.com/conarwelsh/signage-os/releases/latest"
              className="bg-card hover:bg-accent border-border flex items-center gap-3 rounded-2xl border px-6 py-4 transition-all"
            >
              <CloudLightning className="h-5 w-5 text-sky-400" />
              <div className="text-left">
                <div className="text-muted-foreground text-xs">
                  Instant Progressive Web App
                </div>
                <div className="text-sm font-bold">Install PWA</div>
              </div>
            </a>
            <a
              href="https://github.com/conarwelsh/signage-os/releases/latest"
              className="bg-card hover:bg-accent border-border flex items-center gap-3 rounded-2xl border px-6 py-4 transition-all"
            >
              <ShieldCheck className="h-5 w-5 text-violet-400" />
              <div className="text-left">
                <div className="text-muted-foreground text-xs">
                  Download Controller App
                </div>
                <div className="text-sm font-bold">Android CLI Bundle</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-border text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t px-6 py-8 text-center text-xs md:flex-row">
        <div>
          &copy; 2026 SOUS.TOOLS. Empowering modern back-of-house operations.
          All rights reserved.
        </div>
        <div className="flex gap-4">
          <Link
            href="/privacy-policy"
            className="hover:text-foreground transition-colors hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
