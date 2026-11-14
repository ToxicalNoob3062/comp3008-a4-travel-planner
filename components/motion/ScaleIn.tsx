"use client";

// A small element (an icon, a badge) that snaps into view to confirm something just happened,
// such as the check mark on the chosen Arrive by / Leave at card.
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { SPRING } from "./tokens";

export default function ScaleIn({ children, className = "flex" }: { children: ReactNode; className?: string }) {
  return (
    <m.span
      data-motion="scale-in"
      className={className}
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={SPRING.snap}
    >
      {children}
    </m.span>
  );
}
