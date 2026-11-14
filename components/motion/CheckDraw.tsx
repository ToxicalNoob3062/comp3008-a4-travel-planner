"use client";

// The "checked" icon for a checkbox, with a small celebration when the user ticks it:
// the box bounces in, the check mark draws itself, and a ring bursts outward and fades.
// With `animate={false}` it is simply drawn checked (used for boxes that were already ticked).
import { motion } from "motion/react";
import { DURATION, EASE_OUT, SPRING } from "./tokens";

export default function CheckDraw({ animate }: { animate: boolean }) {
  return (
    <svg data-motion="check-draw" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" style={{ overflow: "visible" }}>
      {/* Ring that bursts outward once. */}
      {animate ? (
        <motion.circle
          cx="12"
          cy="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ r: 8, opacity: 0.55 }}
          animate={{ r: 19, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        />
      ) : null}
      {/* The filled box bounces in. */}
      <motion.rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2.5"
        fill="currentColor"
        style={{ transformOrigin: "12px 12px", transformBox: "view-box" }}
        initial={animate ? { scale: 0.4 } : false}
        animate={{ scale: 1 }}
        transition={SPRING.snap}
      />
      {/* The check mark draws itself from left to right. */}
      <motion.path
        d="M7 12.4l3.4 3.4L17.2 8.8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: 0.08 }}
      />
    </svg>
  );
}
