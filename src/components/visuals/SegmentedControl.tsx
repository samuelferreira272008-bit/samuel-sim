import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
  name?: string;
}

/**
 * Apple-style tactile Segmented Control
 * Features:
 * - Fluid spring pill indicator (stiffness: 460, damping: 32)
 * - Tactile active micro-depression (active:scale-[0.97])
 * - Multi-layer frosted capsule frame with subtle specular hairline
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  name = "segmented-pill",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-2xl bg-secondary/40 border border-border/50 backdrop-blur-xl shadow-inner max-w-full overflow-x-auto no-scrollbar",
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 outline-none select-none rounded-xl active:scale-[0.96]",
              isActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground/90",
            )}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span className="whitespace-nowrap">{opt.label}</span>
            {typeof opt.count === "number" && (
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-semibold transition-colors",
                  isActive
                    ? "bg-foreground/15 text-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {opt.count}
              </span>
            )}

            {isActive && (
              <motion.span
                layoutId={`active-pill-${name}`}
                className="absolute inset-0 -z-10 rounded-xl bg-background/90 shadow-xs border border-border/70"
                transition={{
                  type: "spring",
                  stiffness: 480,
                  damping: 34,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
