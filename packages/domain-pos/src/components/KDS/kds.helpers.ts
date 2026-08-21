/* eslint-disable max-lines */
import {
  type KDSTicket,
  type KDSTicketItem,
  type KDSCompletedDateFilter,
} from "./kds.types";

interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export type ChimeType = "new" | "complete" | "alert" | "reopen" | "click";

export function playChime(
  type: ChimeType,
  soundsEnabled: boolean,
  soundVolume: number,
) {
  if (typeof window === "undefined" || !soundsEnabled) return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as WindowWithAudioContext).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(
      Math.max(0.01, Math.min(1, soundVolume)),
      ctx.currentTime,
    );

    if (type === "new") {
      // Upbeat double chime for new incoming order
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      osc.type = "triangle";
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "complete") {
      // Ascending major triad for ticket completion
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.type = "sine";
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "reopen") {
      // Descending tone for reopening/recalling a ticket
      osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.1); // D5
      osc.type = "sine";
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "alert") {
      // Urgent warning pulse
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1); // A4
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(Math.min(1, soundVolume * 0.8), ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // Subtle click
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.type = "sine";
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // Audio Context fallback
  }
}

export function formatTicketNumber(
  rawId: string,
  extId?: string | null,
): string {
  const target = extId || rawId || "";
  if (!target) return "---";
  // If it is a clean short token or uppercase alphanumeric
  if (target.length <= 6) return target.toUpperCase();
  // Return last 4-5 chars formatted nicely
  return target.substring(target.length - 5).toUpperCase();
}

export function formatLocationName(
  locId?: string | null,
  orderType?: string | null,
): string {
  if (orderType) {
    if (orderType === "to_go" || orderType.toLowerCase().includes("togo"))
      return "To Go / Takeout";
    if (orderType === "for_here" || orderType.toLowerCase().includes("dine"))
      return "Dine-In";
    if (orderType.toLowerCase().includes("bar")) return "Bar Station";
    if (orderType.toLowerCase().includes("delivery")) return "Delivery";
  }
  if (!locId) return "Main Station";
  if (locId.toLowerCase().includes("main")) return "Main Dining";
  if (locId.toLowerCase().includes("patio")) return "Patio";
  if (locId.toLowerCase().includes("bar")) return "Bar";
  if (locId.length > 20) return "Register Terminal";
  return locId;
}

export function mapOrderToKDSTicket(o: Record<string, unknown>): KDSTicket {
  const rawItems = (o.pos_order_line_items as Record<string, unknown>[]) || [];
  const lineItems: KDSTicketItem[] = rawItems.map((li) => ({
    id: String(li.id || ""),
    name: String(li.name || "Item"),
    qty: Number(li.quantity || 1),
    notes: li.base_price_money
      ? `$${Number(li.base_price_money).toFixed(2)}`
      : undefined,
    status: li.status === "COMPLETED" ? "COMPLETED" : "OPEN",
  }));

  const rawExtId = String(o.external_id || o.id || "");
  const orderId = String(o.id || "");
  const orderType = o.order_type ? String(o.order_type) : undefined;
  const isClosed =
    o.state === "COMPLETED" ||
    o.status === "COMPLETED" ||
    o.status === "CLOSED";

  return {
    id: orderId,
    ticketNumber: formatTicketNumber(orderId, rawExtId),
    tableNumber: formatLocationName(String(o.location_id || ""), orderType),
    createdAt: String(o.created_at || new Date().toISOString()),
    closedAt: o.closed_at ? String(o.closed_at) : null,
    isRush: Boolean(o.is_rush),
    status: isClosed ? "CLOSED" : "OPEN",
    externalId: rawExtId,
    totalMoney: Number(o.total_money || 0),
    orderType,
    source: String(o.pos_provider || o.source || "Square POS"),
    items:
      lineItems.length > 0
        ? lineItems
        : [
            {
              id: `fallback-${orderId}`,
              name: "Order Total",
              qty: 1,
              notes: o.total_money
                ? `$${Number(o.total_money).toFixed(2)}`
                : undefined,
              status: isClosed ? "COMPLETED" : "OPEN",
            },
          ],
  };
}

export function formatTicketAge(createdAt: string, nowMs = Date.now()): string {
  const createdMs = new Date(createdAt).getTime();
  if (isNaN(createdMs)) return "0m";

  const diffMs = Math.max(0, nowMs - createdMs);
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }
  if (hours > 0) {
    const remMinutes = minutes % 60;
    return `${hours}h ${remMinutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds < 10 ? "0" : ""}${seconds}s`;
  }
  return `${seconds}s`;
}

export function formatCompletedTime(
  closedAt?: string | null,
  createdAt?: string,
): string {
  const targetIso = closedAt || createdAt;
  if (!targetIso) return "Recently completed";

  const d = new Date(targetIso);
  if (isNaN(d.getTime())) return "Recently completed";

  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const timeStr = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  if (isYesterday) {
    return `Yesterday at ${timeStr}`;
  }

  const dateStr = d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  return `${dateStr} at ${timeStr}`;
}

export function formatFulfillmentDuration(
  createdAt: string,
  closedAt?: string | null,
): string {
  if (!closedAt) return "---";
  const start = new Date(createdAt).getTime();
  const end = new Date(closedAt).getTime();
  if (isNaN(start) || isNaN(end) || end < start) return "---";

  const totalSecs = Math.floor((end - start) / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const hours = Math.floor(mins / 60);

  if (hours > 0) {
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs > 0 ? `${secs}s` : ""}`.trim();
  }
  return `${secs}s`;
}

export function formatRelativeTimeAgo(
  isoString?: string | null,
  nowMs = Date.now(),
): string {
  if (!isoString) return "";
  const timeMs = new Date(isoString).getTime();
  if (isNaN(timeMs)) return "";

  const diffSecs = Math.floor((nowMs - timeMs) / 1000);
  if (diffSecs < 60) return "Just now";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoString).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function isDateToday(isoString: string): boolean {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export function isDateYesterday(isoString: string): boolean {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

export function isDateWithinDays(isoString: string, days: number): boolean {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return false;
  const cutoff = Date.now() - days * 24 * 3600 * 1000;
  return d.getTime() >= cutoff;
}

export function filterTicketsByDate(
  tickets: KDSTicket[],
  filter: KDSCompletedDateFilter,
): KDSTicket[] {
  return tickets.filter((ticket) => {
    const timestamp = ticket.closedAt || ticket.createdAt;
    if (!timestamp) return filter === "all";

    if (filter === "today") {
      return isDateToday(timestamp);
    }
    if (filter === "yesterday") {
      return isDateYesterday(timestamp);
    }
    if (filter === "last_7_days") {
      return isDateWithinDays(timestamp, 7);
    }
    return true;
  });
}

export function getTicketUrgency(
  createdAt: string,
  warningMinutes = 10,
  rushMinutes = 15,
  nowMs = Date.now(),
): "normal" | "warning" | "rush" {
  const createdMs = new Date(createdAt).getTime();
  if (isNaN(createdMs)) return "normal";

  const ageMinutes = (nowMs - createdMs) / (60 * 1000);
  if (ageMinutes >= rushMinutes) return "rush";
  if (ageMinutes >= warningMinutes) return "warning";
  return "normal";
}
