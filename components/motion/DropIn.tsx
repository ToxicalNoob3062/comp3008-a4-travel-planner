"use client";

// A panel that opens downward from the control it belongs to, such as the calendar under the date pill.
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { SPRING } from "./tokens";

export default function DropIn({ children }: { children: ReactNode }) {
  return (
    <m.div
      data-motion="drop-in"
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING.drop}
      style={{ transformOrigin: "top left" }}
    >
      {children}
    </m.div>
  );
}
