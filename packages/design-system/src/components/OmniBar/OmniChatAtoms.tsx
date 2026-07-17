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
    <span className="flex items-center gap-1" aria-label="Agent is working">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1 w-1 rounded-full bg-primary"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.14 }}
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
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground ${isAgent ? "border-primary/25 text-primary" : ""}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

// ── MetricCard — single metric tile ───────────────────────────────────────

export function MetricCard({ metric }: { metric: OmniMetric }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/35 p-3">
      <p className="text-[10px] font-medium uppercase tracking-[.14em] text-muted-foreground">
        {metric.label}
      </p>
      <p className="mt-1 font-display text-lg font-bold text-foreground">
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
    <article className="flex gap-3 w-full">
      <EventIcon role="metrics" />
      <div className="min-w-0 flex-1 rounded-xl border border-border bg-card/82 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-[.14em]">
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
