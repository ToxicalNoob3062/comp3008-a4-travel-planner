"use client";

// Fade-and-move entrance for content that appears, alone or in sequence.
//   <FadeUp>                      one block rising into place
//   <FadeUp order={i}>            item i of a staggered list
//   <FadeUp as="li" from="left">  a list item sliding in from the left
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE_SMOOTH, STAGGER } from "./tokens";

const TAGS = { div: motion.div, li: motion.li } as const;
const OFFSET = { below: { y: 14 }, left: { x: -10 } } as const;

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  /** HTML element to render. */
  as?: keyof typeof TAGS;
  /** Where the content comes from. */
  from?: keyof typeof OFFSET;
  /** Position in a staggered list: 0 first, then 1, 2... */
  order?: number;
  /** Seconds to wait before the first item starts. */
  delay?: number;
  /** True for decoration that screen readers should skip. */
  decorative?: boolean;
  "aria-label"?: string;
}

export default function FadeUp({ children, className, as = "div", from = "below", order = 0, delay = 0, decorative, ...rest }: FadeUpProps) {
  const Tag = TAGS[as];
  return (
    <Tag
      data-motion="fade-up"
      className={className}
      aria-hidden={decorative || undefined}
      aria-label={rest["aria-label"]}
      initial={{ opacity: 0, ...OFFSET[from] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: DURATION.item, ease: EASE_SMOOTH, delay: delay + order * STAGGER }}
    >
      {children}
    </Tag>
  );
}
