import React from "react";
import { useLottie } from "lottie-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Lightweight procedural Lottie animation data (vector keyframes)
// 1. Shimmering Star / Sparkle
const sparkLottieJson = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Spark",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "StarShape",
      sr: 1,
      ks: {
        o: {
          k: [
            { i: { x: [0.8], y: [0.8] }, o: { x: [0.2], y: [0.2] }, t: 0, s: [30] },
            { i: { x: [0.8], y: [0.8] }, o: { x: [0.2], y: [0.2] }, t: 30, s: [100] },
            { t: 60, s: [30] },
          ],
        },
        r: {
          k: [
            { i: { x: [0.8], y: [0.8] }, o: { x: [0.2], y: [0.2] }, t: 0, s: 0 },
            { t: 60, s: 90 },
          ],
        },
        p: { k: [50, 50, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { i: { x: [0.175, 0.175], y: [0.885, 0.885] }, o: { x: [0.77, 0.77], y: [0.175, 0.175] }, t: 0, s: [75, 75] },
            { i: { x: [0.175, 0.175], y: [0.885, 0.885] }, o: { x: [0.77, 0.77], y: [0.175, 0.175] }, t: 30, s: [115, 115] },
            { t: 60, s: [75, 75] },
          ],
        },
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sr",
              sy: 2,
              p: { k: [0, 0] },
              r: { k: 0 },
              ir: { k: 9 },
              is: { k: 0 },
              or: { k: 28 },
              os: { k: 0 },
              pt: { k: 4 },
            },
            {
              ty: "fl",
              c: { k: [0.95, 0.95, 0.98, 1] },
              o: { k: 100 },
            },
            {
              ty: "tr",
              p: { k: [0, 0] },
              a: { k: [0, 0] },
              s: { k: [100, 100] },
              r: { k: 0 },
              o: { k: 100 },
            },
          ],
        },
      ],
    },
  ],
};

// 2. Play / Run pulse wave
const playPulseJson = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 45,
  w: 80,
  h: 80,
  nm: "PulseWave",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "WaveRing",
      sr: 1,
      ks: {
        o: {
          k: [
            { i: { x: [0.8], y: [0.8] }, o: { x: [0.2], y: [0.2] }, t: 0, s: [90] },
            { t: 45, s: [0] },
          ],
        },
        r: { k: 0 },
        p: { k: [40, 40, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { i: { x: [0.2], y: [1] }, o: { x: [0.8], y: [0] }, t: 0, s: [40, 40] },
            { t: 45, s: [140, 140] },
          ],
        },
      },
      shapes: [
        {
          ty: "el",
          p: { k: [0, 0] },
          s: { k: [40, 40] },
        },
        {
          ty: "st",
          c: { k: [0.9, 0.9, 0.95, 1] },
          o: { k: 100 },
          w: { k: 3 },
        },
      ],
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "PlayTriangle",
      sr: 1,
      ks: {
        o: { k: 100 },
        r: { k: 0 },
        p: { k: [42, 40, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { i: { x: [0.2], y: [1] }, o: { x: [0.8], y: [0] }, t: 0, s: [95, 95] },
            { i: { x: [0.2], y: [1] }, o: { x: [0.8], y: [0] }, t: 22, s: [105, 105] },
            { t: 45, s: [95, 95] },
          ],
        },
      },
      shapes: [
        {
          ty: "sr",
          sy: 2,
          p: { k: [0, 0] },
          r: { k: 90 },
          ir: { k: 8 },
          is: { k: 0 },
          or: { k: 16 },
          os: { k: 0 },
          pt: { k: 3 },
        },
        {
          ty: "fl",
          c: { k: [1, 1, 1, 1] },
          o: { k: 100 },
        },
      ],
    },
  ],
};

/**
 * Interactive Lottie Sparkle Icon
 */
export function LottieSpark({ className }: { className?: string }) {
  const { View } = useLottie({
    animationData: sparkLottieJson,
    loop: true,
    autoplay: true,
  });

  return (
    <div className={cn("inline-flex items-center justify-center shrink-0", className)}>
      {View}
    </div>
  );
}

/**
 * Interactive Lottie Pulse Wave for Sandbox & App Run
 */
export function LottiePlayPulse({ className }: { className?: string }) {
  const { View } = useLottie({
    animationData: playPulseJson,
    loop: true,
    autoplay: true,
  });

  return (
    <div className={cn("inline-flex items-center justify-center shrink-0", className)}>
      {View}
    </div>
  );
}

/**
 * Apple-style tactile spring icon badge with hover expansion & haptic bounce
 */
export function TactileBadge({
  children,
  className,
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md shadow-xs transition-colors hover:border-foreground/40",
        active && "border-foreground/60 bg-foreground/5 shadow-sm",
        className,
      )}
    >
      {children}
    </motion.span>
  );
}

// 3. Floating Orb / Search Wave for Empty states
const emptyOrbJson = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 90,
  w: 120,
  h: 120,
  nm: "EmptyOrb",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "OuterPulse",
      sr: 1,
      ks: {
        o: {
          k: [
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: [35] },
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 45, s: [10] },
            { t: 90, s: [35] },
          ],
        },
        r: {
          k: [
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: 0 },
            { t: 90, s: 180 },
          ],
        },
        p: { k: [60, 60, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: [90, 90] },
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 45, s: [110, 110] },
            { t: 90, s: [90, 90] },
          ],
        },
      },
      shapes: [
        {
          ty: "el",
          p: { k: [0, 0] },
          s: { k: [70, 70] },
        },
        {
          ty: "st",
          c: { k: [0.8, 0.8, 0.9, 1] },
          o: { k: 80 },
          w: { k: 1.5 },
          d: [{ n: "d", nm: "dash", v: { k: 6 } }, { n: "g", nm: "gap", v: { k: 6 } }],
        },
      ],
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "InnerOrb",
      sr: 1,
      ks: {
        o: { k: 85 },
        r: { k: 0 },
        p: {
          k: [
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 0, s: [60, 63, 0] },
            { i: { x: 0.4, y: 1 }, o: { x: 0.6, y: 0 }, t: 45, s: [60, 57, 0] },
            { t: 90, s: [60, 63, 0] },
          ],
        },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: [95, 95] },
            { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 45, s: [105, 105] },
            { t: 90, s: [95, 95] },
          ],
        },
      },
      shapes: [
        {
          ty: "el",
          p: { k: [0, 0] },
          s: { k: [38, 38] },
        },
        {
          ty: "st",
          c: { k: [0.95, 0.95, 1, 1] },
          o: { k: 90 },
          w: { k: 2 },
        },
      ],
    },
  ],
};

export function LottieEmptyStateVisual({ className }: { className?: string }) {
  const { View } = useLottie({
    animationData: emptyOrbJson,
    loop: true,
    autoplay: true,
  });

  return (
    <div className={cn("inline-flex items-center justify-center shrink-0", className)}>
      {View}
    </div>
  );
}

