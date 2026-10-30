import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

interface GsapRevealProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

/**
 * GSAP Timeline Choreography component
 * Provides high-precision staggered entrances with exponential ease.
 */
export function GsapReveal({
  children,
  stagger = 0.08,
  delay = 0.1,
  direction = "up",
  className = "",
}: GsapRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const items = el.children;
    if (!items.length) return;

    const yVal = direction === "up" ? 28 : direction === "down" ? -28 : 0;
    const xVal = direction === "left" ? 28 : direction === "right" ? -28 : 0;

    gsap.fromTo(
      items,
      {
        opacity: 0,
        y: yVal,
        x: xVal,
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 0.85,
        stagger,
        delay,
        ease: "power3.out",
        overwrite: "auto",
      },
    );
  }, [stagger, delay, direction]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
