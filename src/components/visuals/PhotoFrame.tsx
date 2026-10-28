import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface PhotoFrameProps {
  src: string;
  alt: string;
  photos?: string[];
  badge?: string;
  subtitle?: string;
  className?: string;
}

export function PhotoFrame({ src, alt, photos, badge, subtitle, className }: PhotoFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const gallery = photos && photos.length > 0 ? photos : [src];
  const [activeIdx, setActiveIdx] = useState(0);
  const currentSrc = gallery[activeIdx] ?? src;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);

  const rx = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 160, damping: 18 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    x.set(nx - 0.5);
    y.set(ny - 0.5);
    spotX.set(nx * 100);
    spotY.set(ny * 100);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className={cn("group relative select-none", className)}
    >
      {/* Subtle Monochrome Liquid-Glass Shadow */}
      <div className="pointer-events-none absolute -inset-2 rounded-[28px] bg-foreground/5 opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

      {/* Crisp Monochrome Glass Frame */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/90 p-2 shadow-glow backdrop-blur-2xl">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary">
          <img
            src={currentSrc}
            alt={alt}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Interactive Specular Glass Sheen */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: useTransform(
                [spotX, spotY],
                ([sx, sy]) =>
                  `radial-gradient(circle 160px at ${sx}% ${sy}%, rgba(255,255,255,0.28), transparent 70%)`,
              ),
            }}
          />

          {/* Bottom Liquid Glass Caption Bar */}
          {(badge || subtitle || gallery.length > 1) && (
            <div className="absolute inset-x-3 bottom-3 rounded-xl border border-border/80 bg-background/85 p-3 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  {badge && (
                    <p className="truncate text-xs font-bold tracking-wide text-foreground">
                      {badge}
                    </p>
                  )}
                  {subtitle && (
                    <p className="truncate text-[11px] text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                </div>
                {gallery.length > 1 && (
                  <div className="flex shrink-0 items-center gap-1">
                    {gallery.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveIdx(idx);
                        }}
                        aria-label={`Foto ${idx + 1}`}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          idx === activeIdx ? "w-5 bg-foreground" : "w-2 bg-foreground/30 hover:bg-foreground/60",
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
