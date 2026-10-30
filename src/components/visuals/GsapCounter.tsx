import { useEffect, useRef } from "react";
import gsap from "gsap";

interface GsapCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * GSAP-powered smooth numeric odometer/counter with power3 easing and tabular numerals.
 */
export function GsapCounter({
  value,
  duration = 1.8,
  prefix = "",
  suffix = "",
  className = "",
}: GsapCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    const proxy = { val: 0 };
    const tween = gsap.to(proxy, {
      val: value,
      duration,
      ease: "power3.out",
      onUpdate: () => {
        if (el) {
          el.textContent = `${prefix}${Math.round(proxy.val).toLocaleString()}${suffix}`;
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, duration, prefix, suffix]);

  return (
    <span
      ref={nodeRef}
      className={`font-mono tabular-nums font-bold tracking-tight ${className}`}
    >
      {prefix}0{suffix}
    </span>
  );
}
