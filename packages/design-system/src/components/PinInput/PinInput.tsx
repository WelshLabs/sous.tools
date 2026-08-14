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

export function PinInput({
  length = 6,
  value,
  onChange,
  className,
}: PinInputProps) {
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

function Slot(props: {
  char: string | null;
  hasFakeCaret: boolean;
  isActive: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card border-border relative flex h-14 w-12 items-center justify-center rounded-xl border text-3xl font-semibold text-zinc-100 shadow-inner backdrop-blur-md transition-all sm:h-20 sm:w-16 sm:text-4xl",
        props.isActive && "z-10 border-cyan-400 ring-2 ring-cyan-400/50",
      )}
    >
      {props.char !== null ? (
        props.char
      ) : (
        <span className="text-zinc-700">-</span>
      )}
      {props.hasFakeCaret && (
        <div className="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-foreground h-8 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}
