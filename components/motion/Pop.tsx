"use client";

// Springy entrance used for message boxes (tips, warnings, errors, confirmations):
// the box rises a little and settles with a soft bounce, which draws the eye to it once and then stays still.
// Give it a `key` at the call site to make it pop again when its content changes.
//
// Tips, notes and warnings then fade away by themselves after NOTICE_VISIBLE_MS and give their space back.
// Pass `stay` for a box the user has to act on or come back to (an error with a fix, a confirmation with a link).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { EASE_SMOOTH, NOTICE_EXIT, NOTICE_VISIBLE_MS, POP_DELAY, SPRING } from "./tokens";

interface PopProps {
  children: ReactNode;
  className?: string;
  /** Keep the box on screen until its content changes. */
  stay?: boolean;
  /** How long a box that does not stay is shown. Only tests change this. */
  visibleMs?: number;
}

// There is deliberately no per-box entrance timing: every box uses POP_DELAY, so they stay in step.
export default function Pop({ children, className, stay = false, visibleMs = NOTICE_VISIBLE_MS }: PopProps) {
  const [gone, setGone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const start = () => {
    stop();
    if (!stay) timer.current = setTimeout(() => setGone(true), visibleMs);
  };

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stay, visibleMs]);

  return (
    <AnimatePresence>
      {gone ? null : (
        <m.div
          data-motion="pop"
          className={className}
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          // Fades out, closes its height and takes back the gap above it, so what is below slides up smoothly.
          exit={{
            opacity: 0,
            height: 0,
            marginTop: "calc(var(--gap, 0px) * -1)",
            overflow: "hidden",
            transition: { duration: NOTICE_EXIT, ease: EASE_SMOOTH },
          }}
          transition={{ ...SPRING.pop, delay: POP_DELAY }}
          // The countdown waits while the pointer is on the box or something inside it has focus, so it never vanishes mid-read.
          onPointerEnter={stop}
          onPointerLeave={start}
          onFocus={stop}
          onBlur={start}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
}
