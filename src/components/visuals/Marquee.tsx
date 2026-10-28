import type { ReactNode } from "react";

export function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {children}
        {children}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
