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
  isRush?: boolean;
  status: "OPEN" | "CLOSED";
}
