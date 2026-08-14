"use client";

import { motion } from "framer-motion";
import {
  Bot,
  UserRound,
  Sparkles,
  FileCheck2,
  Gauge,
  Check,
  TrendingUp,
} from "lucide-react";
import type { OmniMessage } from "@soustools/api-types";

// ── OmniMetric shape (presentational — no fetching) ───────────────────────

export interface OmniMetric {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

// ── ActivityIndicator ─────────────────────────────────────────────────────

export function ActivityIndicator() {
  return (
    <span className="flex items-center gap-1.5" aria-label="Agent is working">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="bg-primary h-1.5 w-1.5 rounded-full"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: dot * 0.18,
          }}
        />
      ))}
    </span>
  );
}

// ── EventIcon — semantic icon per message role ─────────────────────────────

const ROLE_ICONS: Record<string, React.ElementType> = {
  user: UserRound,
  model: Bot,
  agent_step: Sparkles,
  ingestion: FileCheck2,
  metrics: Gauge,
  change: Check,
};

export function EventIcon({ role }: { role: OmniMessage["role"] | "metrics" }) {
  const Icon = ROLE_ICONS[role] ?? Bot;
  const isAgent = role === "model" || role === "agent_step";
  return (
    <span
      className={`border-border bg-card text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${isAgent ? "border-primary/25 text-primary" : ""}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

// ── MetricCard — single metric tile ───────────────────────────────────────

export function MetricCard({ metric }: { metric: OmniMetric }) {
  return (
    <div className="border-border/70 bg-muted/35 rounded-xl border p-3">
      <p className="text-muted-foreground text-[10px] font-medium tracking-[.14em] uppercase">
        {metric.label}
      </p>
      <p className="font-display text-foreground mt-1 text-lg font-bold">
        {metric.value}
      </p>
      {metric.change && (
        <p
          className={`text-xs font-medium ${metric.positive === false ? "text-destructive" : "text-success"}`}
        >
          {metric.change}
        </p>
      )}
    </div>
  );
}

// ── MetricEventCard — grid of metric tiles inside the chat stream ──────────
// Purely presentational. Data arrives via metricsData on the OmniMessage.

export function MetricEventCard({ metrics }: { metrics: OmniMetric[] }) {
  return (
    <article className="flex w-full gap-3">
      <EventIcon role="metrics" />
      <div className="border-border bg-card/82 min-w-0 flex-1 rounded-xl border p-4 backdrop-blur-xl">
        <div className="text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="text-primary h-4 w-4" />
          <span className="text-xs font-semibold tracking-[.14em] uppercase">
            Metrics snapshot
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>
      </div>
    </article>
  );
}
