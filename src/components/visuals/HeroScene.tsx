import { useEffect, useRef } from "react";

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  tone: number;
  alpha: number;
  phase: number;
}

/**
 * Full-section responsive Monochrome Liquid Glass Bubbles & Interactive Dot-Field Canvas.
 * Integrates seamlessly with the Black & White palette.
 */
export function HeroBubblesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<{
    x: number;
    y: number;
    active: boolean;
    ripples: { x: number; y: number; r: number; alpha: number }[];
  }>({
    x: -999,
    y: -999,
    active: false,
    ripples: [],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let bubbles: Bubble[] = [];

    const initBubbles = (w: number, h: number) => {
      const isMobile = w < 640;
      const count = isMobile ? 14 : w < 1024 ? 22 : 32;
      bubbles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.22 - Math.random() * 0.48,
        r: isMobile ? 6 + Math.random() * 18 : 8 + Math.random() * 30,
        tone: i % 3 === 0 ? 15 : i % 3 === 1 ? 45 : 75, // monochrome charcoal / silver / pearl lightness
        alpha: 0.08 + Math.random() * 0.14,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (bubbles.length === 0) {
        initBubbles(width, height);
      }
    };

    resize();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (ro && canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener("resize", resize);

    const parent = canvas.parentElement;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
      pointerRef.current.active = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = e.touches[0].clientX - rect.left;
      pointerRef.current.y = e.touches[0].clientY - rect.top;
      pointerRef.current.active = true;
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        r: 6,
        alpha: 0.45,
      });
    };

    parent?.addEventListener("mousemove", onMove, { passive: true });
    parent?.addEventListener("touchmove", onTouchMove, { passive: true });
    parent?.addEventListener("mouseleave", onLeave);
    parent?.addEventListener("click", onClick);

    let t = 0;

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      const { x: px, y: py, active, ripples } = pointerRef.current;
      const spacing = width < 640 ? 36 : 30;
      const maxRadius = width < 640 ? 100 : 145;

      // 1. Subtle monochrome interactive dot-matrix across the Hero background
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);
      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = offsetX + c * spacing;
          const by = offsetY + r * spacing;

          const dx = bx - px;
          const dy = by - py;
          const dist = Math.hypot(dx, dy);

          let ox = Math.sin(t + c * 0.35 + r * 0.25) * 1.4;
          let oy = Math.cos(t + r * 0.35 + c * 0.25) * 1.4;
          let scale = 1;

          if (active && dist < maxRadius && dist > 0.1) {
            const force = Math.pow(1 - dist / maxRadius, 2);
            ox += (dx / dist) * force * 13;
            oy += (dy / dist) * force * 13;
            scale = 1 + force * 1.4;
          }

          ctx.beginPath();
          ctx.arc(bx + ox, by + oy, 1.2 * scale, 0, Math.PI * 2);
          ctx.fillStyle =
            active && dist < maxRadius
              ? "rgba(15, 15, 15, 0.38)"
              : "rgba(15, 15, 15, 0.10)";
          ctx.fill();
        }
      }

      // 2. Floating Monochrome Liquid Glass Bubbles across the section
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.x += b.vx + Math.sin(t * 0.9 + b.phase) * 0.25;
        b.y += b.vy;

        if (active) {
          const dx = b.x - px;
          const dy = b.y - py;
          const dist = Math.hypot(dx, dy);
          const interactRadius = maxRadius + b.r;
          if (dist < interactRadius && dist > 0.1) {
            const push = Math.pow(1 - dist / interactRadius, 2) * 2.0;
            b.x += (dx / dist) * push;
            b.y += (dy / dist) * push;
          }
        }

        if (b.y + b.r < -10) {
          b.y = height + b.r + 10;
          b.x = Math.random() * width;
        }
        if (b.x - b.r > width + 10) b.x = -b.r;
        if (b.x + b.r < -10) b.x = width + b.r;

        const grad = ctx.createRadialGradient(
          b.x - b.r * 0.32,
          b.y - b.r * 0.32,
          b.r * 0.08,
          b.x,
          b.y,
          b.r,
        );
        grad.addColorStop(0, `hsla(0, 0%, 100%, ${b.alpha * 1.8})`);
        grad.addColorStop(0.55, `hsla(0, 0%, ${b.tone}%, ${b.alpha * 0.65})`);
        grad.addColorStop(1, `hsla(0, 0%, 10%, 0.01)`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Crisp monochrome glass rim
        ctx.strokeStyle = `hsla(0, 0%, 12%, ${b.alpha * 0.75})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // Specular reflection dot
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.34, b.y - b.r * 0.34, Math.max(1.2, b.r * 0.14), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.85, b.alpha * 3.2)})`;
        ctx.fill();
      }

      // 3. Expanding monochrome click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 3.0;
        rp.alpha *= 0.95;
        if (rp.alpha < 0.02) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(20, 20, 20, ${rp.alpha})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
      parent?.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("touchmove", onTouchMove);
      parent?.removeEventListener("mouseleave", onLeave);
      parent?.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
