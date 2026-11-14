"use client";

// A panel that opens downward from the control it belongs to: the calendar under the date pill,
// the suggestions under a place field. It drops a short way and settles softly, with no bounce.
// With `open={false}` it fades back up and then reports that it has finished closing.
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { DROP } from "./tokens";

interface DropInProps {
  children: ReactNode;
  /** False plays the closing fade. Leave out for a panel that is simply removed when it closes. */
  open?: boolean;
  /** Called once the opening has started (used by Material UI poppers). */
  onOpening?: () => void;
  /** Called when the closing fade has finished, so the panel can be removed. */
  onClosed?: () => void;
  /** True for a moment after opening; lets the contents play their own entrance once (see globals.css). */
  fresh?: boolean;
}

const hidden = { opacity: 0, y: -DROP.distance, scale: DROP.scale };

export default function DropIn({ children, open = true, onOpening, onClosed, fresh }: DropInProps) {
  return (
    <m.div
      data-motion="drop-in"
      data-fresh={fresh || undefined}
      initial={hidden}
      animate={open ? { opacity: 1, y: 0, scale: 1 } : { ...hidden, y: -DROP.distance / 2, transition: { duration: DROP.closeSeconds, ease: "easeIn" } }}
      transition={DROP.spring}
      onAnimationStart={() => {
        if (open) onOpening?.();
      }}
      onAnimationComplete={() => {
        if (!open) onClosed?.();
      }}
      style={{ transformOrigin: "top left" }}
    >
      {children}
    </m.div>
  );
}
