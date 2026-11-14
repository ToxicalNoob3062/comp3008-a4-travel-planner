"use client";

// Springy entrance used for message boxes (tips, warnings, errors, confirmations):
// the box rises a little and settles with a soft bounce, which draws the eye to it once and then stays still.
// Give it a `key` at the call site to make it pop again when its content changes.
//
// Up-front tips and cautions (things we tell the user before they have done anything) then fade out in place
// after NOTICE_VISIBLE_MS. The box keeps its space, so nothing else on the screen moves.
// Pass `stay` for feedback on something the user just did (the goal sentence, an error, a confirmation).
import { useEffect, useRef, useState, type ReactNode } from "react";
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
    <m.div
      data-motion="pop"
      className={className}
      // Once faded, the box is hidden from screen readers and clicks as well as from view.
      aria-hidden={gone || undefined}
      inert={gone}
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={
        gone
          ? // Fades out exactly where it is: no sliding, no shrinking.
            { opacity: 0, y: 0, scale: 1, transition: { duration: NOTICE_EXIT, ease: EASE_SMOOTH } }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{ ...SPRING.pop, delay: POP_DELAY }}
      // The countdown waits while the pointer is on the box or something inside it has focus, so it never vanishes mid-read.
      onPointerEnter={gone ? undefined : stop}
      onPointerLeave={gone ? undefined : start}
      onFocus={gone ? undefined : stop}
      onBlur={gone ? undefined : start}
    >
      {children}
    </m.div>
  );
}
