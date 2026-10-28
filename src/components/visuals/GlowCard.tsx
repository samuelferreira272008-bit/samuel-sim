import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

export function GlowCard({ children, className }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-elegant",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(400px circle at var(--mx) var(--my), hsl(var(--primary) / 0.15), transparent 40%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
