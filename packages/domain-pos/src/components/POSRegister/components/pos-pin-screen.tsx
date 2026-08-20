"use client";

import { useState } from "react";
import { Lock, Delete, UserCheck } from "lucide-react";
import { Button } from "@soustools/design-system";
import { type POSUser } from "../pos.types";

export interface POSPinScreenProps {
  onUnlock: (user: POSUser) => void;
  correctPin?: string;
  users?: POSUser[];
}

export function POSPinScreen({
  onUnlock,
  correctPin = "1234",
  users = [
    {
      id: "u1",
      name: "Conar Welsh",
      initials: "CW",
      role: "admin",
      pin: "1234",
    },
    {
      id: "u2",
      name: "Cashier 1",
      initials: "C1",
      role: "cashier",
      pin: "1111",
    },
  ],
}: POSPinScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      // Check if matches user PIN or correctPin
      const matchedUser = users.find((u) => u.pin === nextPin);
      if (matchedUser) {
        setTimeout(() => {
          onUnlock(matchedUser);
        }, 150);
      } else if (nextPin === correctPin) {
        setTimeout(() => {
          onUnlock(users[0]);
        }, 150);
      } else if (
        nextPin.length >= 4 &&
        !users.some((u) => u.pin.startsWith(nextPin))
      ) {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 600);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin("");
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-zinc-950/95 p-6 text-white backdrop-blur-2xl select-none">
      <div className="animate-in fade-in zoom-in-95 flex w-full max-w-sm flex-col items-center space-y-6">
        {/* Terminal Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-3xl border border-sky-500/20 bg-sky-500/10 p-4 text-sky-400 shadow-[0_0_24px_rgba(76,201,240,0.2)]">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Terminal Locked
          </h2>
          <p className="text-muted-foreground text-xs">
            Enter 4-digit staff PIN to unlock POS Register
          </p>
        </div>

        {/* PIN Indicators */}
        <div
          className={`flex items-center justify-center gap-3 transition-transform ${
            error ? "animate-shake text-destructive" : ""
          }`}
        >
          {[0, 1, 2, 3].map((i) => {
            const hasDigit = pin.length > i;
            return (
              <div
                key={i}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl font-bold transition-all ${
                  hasDigit
                    ? "border-sky-400 bg-sky-400/20 text-sky-300 shadow-[0_0_12px_rgba(76,201,240,0.4)]"
                    : "border-white/10 bg-white/5 text-transparent"
                } ${error ? "border-destructive bg-destructive/20 text-destructive" : ""}`}
              >
                {hasDigit ? "•" : ""}
              </div>
            );
          })}
        </div>

        {error && (
          <p className="text-destructive animate-pulse text-xs font-bold">
            Invalid PIN. Please try again.
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid w-full max-w-[280px] grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="flex h-16 w-full cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-black text-white shadow-sm transition-all hover:scale-105 hover:bg-white/15 active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground flex h-16 w-full cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-black uppercase transition-all hover:bg-white/15 active:scale-95"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="flex h-16 w-full cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-black text-white shadow-sm transition-all hover:scale-105 hover:bg-white/15 active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="text-muted-foreground flex h-16 w-full cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all hover:bg-white/15 active:scale-95"
          >
            <Delete className="h-6 w-6" />
          </button>
        </div>

        {/* Quick Bypass Button for Testing */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUnlock(users[0])}
          className="text-muted-foreground text-xs font-bold hover:text-sky-400"
        >
          <UserCheck className="mr-1.5 h-3.5 w-3.5" />
          Bypass (Conar Welsh - Admin)
        </Button>
      </div>
    </div>
  );
}
POSPinScreen.displayName = "POSPinScreen";
