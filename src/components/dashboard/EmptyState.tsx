import React from "react";
import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { LottieEmptyStateVisual } from "@/components/visuals/LottieMicro";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Apple-grade empty state with procedural Lottie micro-motion,
 * spring entrance, and subtle specular highlight.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className={`relative mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-card/40 p-8 text-center backdrop-blur-xl shadow-xs ${className}`}
    >
      {/* Specular hairline at top */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

      {/* Lottie Vector Graphic or Icon */}
      <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary/30 border border-border/40">
        <LottieEmptyStateVisual className="h-20 w-20" />
        {Icon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <Icon className="h-8 w-8 text-foreground" />
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>

      {actionLabel && onAction && (
        <div className="mt-6">
          <Button
            size="sm"
            onClick={onAction}
            className="rounded-xl px-4 py-2 font-semibold shadow-xs"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
