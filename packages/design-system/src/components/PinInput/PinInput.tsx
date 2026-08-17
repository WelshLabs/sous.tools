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
      containerClassName={cn("flex justify-center gap-2", className)}
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
        "ds-living-control text-foreground relative flex h-14 w-12 items-center justify-center rounded-xl border border-[var(--ds-glass-border)] bg-[var(--ds-glass-fill)] text-3xl font-semibold shadow-[inset_0_1px_0_var(--ds-glass-highlight),0_10px_28px_-24px_rgb(var(--ds-neon-primary-rgb)/0.65)] backdrop-blur-xl sm:h-20 sm:w-16 sm:text-4xl",
        props.isActive &&
          "border-primary/70 z-10 bg-[var(--ds-glass-fill-strong)] shadow-[0_0_0_3px_rgb(var(--ds-neon-primary-rgb)/0.12),0_0_26px_-8px_rgb(var(--ds-neon-accent-rgb)/0.62)]",
      )}
    >
      {props.char !== null ? (
        props.char
      ) : (
        <span className="text-muted-foreground/45">-</span>
      )}
      {props.hasFakeCaret && (
        <div className="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="bg-foreground h-8 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}
