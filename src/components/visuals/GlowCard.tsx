import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
}

/**
 * Apple-grade 3D Frosted Glass Card with physical spring tilt, specular reflection
 * and tactile micro-depression.
 */
export function GlowCard({ children, className, enableTilt = true }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apple spring physics (high stiffness, controlled damping)
  const springConfig = { stiffness: 320, damping: 25, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);

    if (enableTilt) {
      // Normalized from -0.5 to 0.5
      mouseX.set(x / rect.width - 0.5);
      mouseY.set(y / rect.height - 0.5);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (enableTilt) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-xs transition-shadow duration-300 hover:border-foreground/35 hover:shadow-elegant",
        className,
      )}
    >
      {/* Specular light flash following cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(460px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.08), transparent 50%)",
        }}
      />

      {/* Hairline top specular border (Apple glass bevel) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-white/10" />

      {/* Content wrapper with subtle 3D translation */}
      <div
        className="relative"
        style={{
          transform: isHovered && enableTilt ? "translateZ(12px)" : "translateZ(0px)",
          transition: "transform 0.25s ease-out",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
