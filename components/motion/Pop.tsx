"use client";

// Springy entrance used for message boxes (tips, warnings, errors, confirmations):
// the box rises a little and settles with a soft bounce, which draws the eye to it once and then stays still.
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface PopProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before popping in, for a box that should arrive after the content around it. */
  delay?: number;
}

export default function Pop({ children, className, delay = 0 }: PopProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 16, mass: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
}
