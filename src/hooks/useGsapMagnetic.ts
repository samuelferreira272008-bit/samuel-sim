import { useEffect, useRef } from "react";
import gsap from "gsap";

interface MagneticOptions {
  strength?: number; // Distance multiplier (default: 0.3)
  radius?: number; // Active proximity radius in pixels (default: 80)
}

/**
 * GSAP Magnetic Hook (Apple & GreenSock precision)
 * Attracts the element toward the cursor within a proximity radius and releases
 * with an authentic physical spring bounce when leaving.
 */
export function useGsapMagnetic<T extends HTMLElement = HTMLButtonElement>(
  options: MagneticOptions = {},
) {
  const ref = useRef<T>(null);
  const { strength = 0.28, radius = 90 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect user's reduced motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

      if (dist < radius) {
        const dx = (e.clientX - centerX) * strength;
        const dy = (e.clientY - centerY) * strength;
        gsap.to(el, {
          x: dx,
          y: dy,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      } else {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: "elastic.out(1.15, 0.45)",
          overwrite: "auto",
        });
      }
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1.2, 0.4)",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      el?.removeEventListener("mouseleave", onMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [strength, radius]);

  return ref;
}
