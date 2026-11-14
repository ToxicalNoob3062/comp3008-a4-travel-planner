"use client";

// Adds Motion's layout-animation features to the part of the page that needs them
// (the sliding SelectionHighlight). Kept separate so the extra code loads only with that screen.
import { LazyMotion, domMax } from "motion/react";
import type { ReactNode } from "react";

export default function LayoutMotion({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
