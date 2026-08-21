export interface KDSTicketItem {
  id: string;
  name: string;
  qty: number;
  notes?: string;
  status: "OPEN" | "COMPLETED";
}

export interface KDSTicket {
  id: string;
  ticketNumber: string;
  tableNumber: string;
  items: KDSTicketItem[];
  createdAt: string;
  closedAt?: string | null;
  isRush?: boolean;
  status: "OPEN" | "CLOSED";
  externalId?: string;
  totalMoney?: number;
  orderType?: string;
  source?: string;
}

export type KDSTextSize = "sm" | "md" | "lg";
export type KDSDensity = "compact" | "standard" | "spacious";
export type KDSSortOrder = "oldest_first" | "newest_first";
export type KDSCompletedDateFilter =
  "today" | "yesterday" | "last_7_days" | "all";
export type KDSStationFilter = "ALL" | "KITCHEN" | "BAR" | "EXPO" | string;

export interface KDSSettings {
  textSize: KDSTextSize;
  density: KDSDensity;
  soundsEnabled: boolean;
  soundVolume: number;
  timerAlertSounds: boolean;
  warningMinutes: number;
  rushMinutes: number;
  ticketSortOrder: KDSSortOrder;
  stationFilter: KDSStationFilter;
  autoRefreshInterval: number; // in seconds, 0 = disabled
}

export interface KDSUser {
  id: string;
  name: string;
  initials: string;
  role: "admin" | "manager" | "kitchen" | "staff";
}
