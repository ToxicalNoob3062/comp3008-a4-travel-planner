"use client";

// Gentle fade-and-rise for content that appears in sequence. `order` staggers items: 0 first, then 1, 2...
import { motion } from "motion/react";
import type { ReactNode } from "react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  order?: number;
  /** Seconds between one item and the next. */
  step?: number;
  /** True for decoration that screen readers should skip. */
  decorative?: boolean;
}

export default function FadeUp({ children, className, order = 0, step = 0.06, decorative }: FadeUpProps) {
  return (
    <motion.div
      className={className}
      aria-hidden={decorative || undefined}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT, delay: order * step }}
    >
      {children}
    </motion.div>
  );
}
