"use client";

// Slides one screen out and the next one in. Going forward the new screen arrives from the right,
// going back it arrives from the left, so the motion matches the direction of travel through the steps.
import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "./FadeUp";

const DISTANCE = 36;

const variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * DISTANCE }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_OUT } },
  // The outgoing screen leaves quickly so a click never feels held up.
  exit: (direction: number) => ({ opacity: 0, x: direction * -DISTANCE * 0.5, transition: { duration: 0.13, ease: "easeIn" as const } }),
};

let firstScreenShown = false;

/** One screen. When it appears, keyboard focus moves to its heading (accessibility). */
function Screen({ direction, children }: { direction: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Not on the very first load: the page should not grab focus before the user has done anything.
    if (firstScreenShown) {
      ref.current?.querySelector<HTMLElement>("[data-screen-heading]")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    }
    firstScreenShown = true;
  }, []);
  return (
    <motion.div
      ref={ref}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex w-full flex-col items-center"
    >
      {children}
    </motion.div>
  );
}

interface ScreenTransitionProps {
  /** Changes when the screen changes. */
  screenKey: string;
  /** 1 = moving forward through the steps, -1 = moving back. */
  direction: number;
  children: ReactNode;
}

export default function ScreenTransition({ screenKey, direction, children }: ScreenTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <Screen key={screenKey} direction={direction}>
        {children}
      </Screen>
    </AnimatePresence>
  );
}
