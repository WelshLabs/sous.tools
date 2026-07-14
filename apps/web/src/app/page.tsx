"use client";

import React, { useEffect, useState } from "react";
import { Button, Card } from "@soustools/design-system";
import { useRouter } from "next/navigation";
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
import { PrimaryLogo } from "@soustools/design-system";

export default function HomePage() {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      // Session check placeholder (handled via middleware/cookies)
      setSession(null);
      setLoading(false);
    };
    fetchSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-sky-500/30">
      {/* Header / Nav */}
      <header className="border-b border-border py-4 px-6 md:px-12 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 bg-card/85">
        <div className="flex items-center gap-2">
          <PrimaryLogo className="text-sky-400 h-12 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <Button onClick={() => router.push("/home")}>
              Go to Dashboard
            </Button>
          ) : (
            <Button onClick={() => router.push("/login")} variant="outline">
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center px-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-sky-200 to-violet-400 bg-clip-text text-transparent">
          Professional Kitchen Operations, Automated
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light">
          Scale your menus, manage vendor inventory ledger, sync Square catalog
          instantly, and deploy real-time digital display signage.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button
            onClick={() => router.push(session ? "/home" : "/login")}
            variant="primary"
            className="px-8 py-3 text-lg mt-4 shadow-[0_0_20px_rgba(76,201,240,0.3)] hover:shadow-[0_0_30px_rgba(76,201,240,0.5)]"
          >
            Get Started Natively
          </Button>
        </div>
      </section>

      {/* Core Features / Product Details */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Core Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-bold text-lg">Square Catalog Sync</h3>
            <p className="text-sm text-muted-foreground">
              Directly map POS categories, items, and discounts. Automatically
              trigger stock updates.
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="font-bold text-lg">Real-Time KDS</h3>
            <p className="text-sm text-muted-foreground">
              Organize tickets instantly, track preparation states, and flag
              rush orders in a unified display interface.
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-lg">Baker's Math & Scaling</h3>
            <p className="text-sm text-muted-foreground">
              Dynamic recipe scaling and precise baker's percentage calculations
              for consistent kitchen output.
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
              <Tv className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="font-bold text-lg">Digital Signage OS</h3>
            <p className="text-sm text-muted-foreground">
              Cast live prep lists, daily specials, and custom menu signage
              boards natively to any television or monitor.
            </p>
          </Card>
        </div>
      </section>

      {/* 3-Tiered Pricing Plans */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Flexible Pricing for Growing Kitchens
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <Card className="p-8 flex flex-col justify-between border-border">
            <div>
              <h3 className="text-xl font-bold text-sky-500">Starter</h3>
              <p className="text-muted-foreground text-sm mt-1">
                For single-station cafes.
              </p>
              <div className="text-4xl font-extrabold mt-6">
                $49
                <span className="text-base font-normal text-muted-foreground">
                  /mo
                </span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
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
              onClick={() => router.push("/login")}
              className="mt-8 w-full justify-center"
              variant="outline"
            >
              Choose Starter
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 flex flex-col justify-between border-sky-500/50 relative shadow-[0_0_30px_rgba(56,189,248,0.1)]">
            <span className="absolute top-0 right-8 transform -translate-y-1/2 bg-sky-500 text-zinc-950 text-xs font-extrabold uppercase px-3 py-1 rounded-full">
              Popular
            </span>
            <div>
              <h3 className="text-xl font-bold text-sky-400">Pro</h3>
              <p className="text-muted-foreground text-sm mt-1">
                For busy full-service restaurants.
              </p>
              <div className="text-4xl font-extrabold mt-6">
                $149
                <span className="text-base font-normal text-muted-foreground">
                  /mo
                </span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
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
              onClick={() => router.push("/login")}
              className="mt-8 w-full justify-center bg-sky-500 hover:bg-sky-600 text-white"
              variant="primary"
            >
              Upgrade to Pro
            </Button>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-8 flex flex-col justify-between border-border">
            <div>
              <h3 className="text-xl font-bold text-violet-400">Enterprise</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Multi-location hospitality groups.
              </p>
              <div className="text-4xl font-extrabold mt-6">Custom</div>
              <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
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
              onClick={() => router.push("/login")}
              className="mt-8 w-full justify-center"
              variant="outline"
            >
              Contact Sales
            </Button>
          </Card>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="py-16 border-t border-border bg-card/40">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl font-bold">Deploy Anywhere Natively</h2>
          <p className="text-muted-foreground max-w-md mx-auto font-light">
            Install our persistent BOH app on tablets, kiosks, and display
            controllers for continuous 24/7 cookline status.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://github.com/conarwelsh/signage-os/releases/latest"
              className="flex items-center gap-3 bg-card hover:bg-accent border border-border px-6 py-4 rounded-2xl transition-all"
            >
              <Download className="w-5 h-5 text-sky-400" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">
                  Download for Desktop
                </div>
                <div className="font-bold text-sm">Windows & Mac App</div>
              </div>
            </a>
            <a
              href="https://github.com/conarwelsh/signage-os/releases/latest"
              className="flex items-center gap-3 bg-card hover:bg-accent border border-border px-6 py-4 rounded-2xl transition-all"
            >
              <CloudLightning className="w-5 h-5 text-sky-400" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">
                  Instant Progressive Web App
                </div>
                <div className="font-bold text-sm">Install PWA</div>
              </div>
            </a>
            <a
              href="https://github.com/conarwelsh/signage-os/releases/latest"
              className="flex items-center gap-3 bg-card hover:bg-accent border border-border px-6 py-4 rounded-2xl transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">
                  Download Controller App
                </div>
                <div className="font-bold text-sm">Android CLI Bundle</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-muted-foreground text-xs flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto gap-4">
        <div>
          &copy; 2026 SOUS.TOOLS. Empowering modern back-of-house operations.
          All rights reserved.
        </div>
        <div className="flex gap-4">
          <Link
            href="/privacy-policy"
            className="hover:text-foreground hover:underline transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
