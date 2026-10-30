import React from "react";
import { useGsapMagnetic } from "@/hooks/useGsapMagnetic";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}

/**
 * Magnetic container component powered by GSAP spring physics
 * Pulls content toward cursor smoothly and snaps back with elastic spring
 */
export function Magnetic({
  children,
  strength = 0.28,
  radius = 90,
  className = "",
}: MagneticProps) {
  const magneticRef = useGsapMagnetic<HTMLDivElement>({ strength, radius });

  return (
    <div ref={magneticRef} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}
