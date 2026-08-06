import { type KDSTicket, type KDSTicketItem } from "./kds.types";

interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function playChime(type: "new" | "complete", soundsEnabled: boolean, soundVolume: number) {
  if (typeof window === "undefined" || !soundsEnabled) return;
  try {
    const ctx = new (window.AudioContext || (window as WindowWithAudioContext).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(soundVolume, ctx.currentTime);

    if (type === "new") {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      osc.type = "triangle";
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
      osc.type = "sine";
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {
    // Audio Context fallback
  }
}

export function mapOrderToKDSTicket(o: Record<string, unknown>): KDSTicket {
  const rawItems = (o.pos_order_line_items as Record<string, unknown>[]) || [];
  const lineItems: KDSTicketItem[] = rawItems.map((li) => ({
    id: String(li.id || ""),
    name: String(li.name || "Item"),
    qty: Number(li.quantity || 1),
    notes: li.base_price_money ? `$${Number(li.base_price_money).toFixed(2)}` : undefined,
    status: li.status === "COMPLETED" ? "COMPLETED" : "OPEN",
  }));

  const rawExtId = String(o.external_id || o.id || "");
  const orderId = String(o.id || "");
  return {
    id: orderId,
    ticketNumber: rawExtId.length >= 4 ? rawExtId.substring(rawExtId.length - 4) : rawExtId,
    tableNumber: String(o.location_id || "Main Dining"),
    createdAt: String(o.created_at || new Date().toISOString()),
    isRush: false,
    status: o.state === "COMPLETED" ? "CLOSED" : "OPEN",
    items: lineItems.length > 0 ? lineItems : [{ id: `fallback-${orderId}`, name: "Order Total", qty: 1, notes: `$${o.total_money}`, status: "OPEN" }],
  };
}
