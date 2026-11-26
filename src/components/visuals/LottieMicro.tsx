import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Lightweight SVG + CSS/Framer Sparkle Icon (replaces lottie-web engine cleanly)
 */
export function LottieSpark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center shrink-0", className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-full w-full animate-[spin_6s_linear_infinite]"
      >
        <path
          d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
          fill="currentColor"
          className="origin-center animate-pulse"
        />
      </svg>
    </span>
  );
}

/**
 * Lightweight Pulse Wave Icon for Sandbox & App Run
 */
export function LottiePlayPulse({ className }: { className?: string }) {
  return (
    <span
      className={cn("relative inline-flex items-center justify-center shrink-0", className)}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-full border border-current opacity-60 animate-ping" />
      <svg viewBox="0 0 24 24" fill="currentColor" className="relative h-[75%] w-[75%]">
        <path d="M8 5.5v13l10-6.5-10-6.5z" />
      </svg>
    </span>
  );
}

/**
 * Apple-style tactile spring icon badge with hover expansion & haptic bounce
 */
export function TactileBadge({
  children,
  className,
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md shadow-xs transition-colors hover:border-foreground/40",
        active && "border-foreground/60 bg-foreground/5 shadow-sm",
        className,
      )}
    >
      {children}
    </motion.span>
  );
}

/**
 * Lightweight Floating Orb / Search Wave for Empty states
 */
export function LottieEmptyStateVisual({ className }: { className?: string }) {
  return (
    <span
      className={cn("relative inline-flex items-center justify-center shrink-0", className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
        <circle
          cx="40"
          cy="40"
          r="28"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          className="origin-center opacity-35 animate-[spin_14s_linear_infinite]"
        />
        <circle
          cx="40"
          cy="40"
          r="15"
          stroke="currentColor"
          strokeWidth="2"
          className="origin-center opacity-75 animate-pulse"
        />
      </svg>
    </span>
  );
}
