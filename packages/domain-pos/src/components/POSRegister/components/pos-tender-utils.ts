import { CreditCard, DollarSign, Gift, QrCode } from "lucide-react";

export const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: DollarSign },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "gift_card", label: "Gift Card", icon: Gift },
  { id: "mobile_pay", label: "Mobile Pay", icon: QrCode },
];

export function getQuickCashOptions(due: number): number[] {
  const options = new Set<number>();
  options.add(due);

  const ceilDue = Math.ceil(due);
  if (ceilDue > due) options.add(ceilDue);

  const nextFive = Math.ceil(due / 5) * 5;
  if (nextFive >= due) options.add(nextFive);

  const nextTen = Math.ceil(due / 10) * 10;
  if (nextTen >= due) options.add(nextTen);

  [20, 50, 100].forEach((bill) => {
    if (bill >= due) options.add(bill);
  });

  return Array.from(options).slice(0, 4);
}

export function getUpdatedTenderedBuffer(prev: string, val: string): string {
  if (val === "C") {
    return "";
  }
  if (val === "⌫") {
    return prev.slice(0, -1);
  }
  if (val === "." && prev.includes(".")) return prev;
  return prev === "0" && val !== "." ? val : prev + val;
}
