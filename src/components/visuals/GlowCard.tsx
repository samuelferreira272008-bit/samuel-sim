import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
}

/**
 * Clean card component without 3D tilt or specular cursor glare.
 */
export function GlowCard({ children, className }: GlowCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-200 hover:border-border hover:shadow-sm",
        className,
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}
