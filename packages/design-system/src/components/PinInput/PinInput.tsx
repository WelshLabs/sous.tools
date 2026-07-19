"use client";


import { OTPInput } from "input-otp";
import { cn } from "../../utils/cn";

export interface PinInputProps {
  /** Number of digits. @default 6 */
  length?: number;
  /** Current value of the input. */
  value: string;
  /** Callback when value changes. */
  onChange: (value: string) => void;
  className?: string;
}

export function PinInput({ length = 6, value, onChange, className }: PinInputProps) {
  return (
    <OTPInput
      maxLength={length}
      value={value}
      onChange={onChange}
      containerClassName={cn("flex space-x-2 justify-center", className)}
      render={({ slots }) => (
        <>
          {slots.map((slot, index) => (
            <Slot key={index} {...slot} />
          ))}
        </>
      )}
    />
  );
}

function Slot(props: { char: string | null; hasFakeCaret: boolean; isActive: boolean }) {
  return (
    <div
      className={cn(
        "relative flex w-12 h-14 sm:w-16 sm:h-20 items-center justify-center text-3xl sm:text-4xl font-semibold bg-card backdrop-blur-md border border-border rounded-xl text-zinc-100 transition-all shadow-inner",
        props.isActive && "border-cyan-400 ring-2 ring-cyan-400/50 z-10"
      )}
    >
      {props.char !== null ? props.char : <span className="text-zinc-700">-</span>}
      {props.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink">
          <div className="h-8 w-px bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
}
