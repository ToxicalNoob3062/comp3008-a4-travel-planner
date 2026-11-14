"use client";

// Springy entrance used for message boxes (tips, warnings, errors, confirmations):
// the box rises a little and settles with a soft bounce, which draws the eye to it once and then stays still.
// Give it a `key` at the call site to make it pop again when its content changes.
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { POP_DELAY, SPRING } from "./tokens";

// There is deliberately no per-box timing option: every box uses POP_DELAY, so they stay in step.
export default function Pop({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      data-motion="pop"
      className={className}
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING.pop, delay: POP_DELAY }}
    >
      {children}
    </motion.div>
  );
}
