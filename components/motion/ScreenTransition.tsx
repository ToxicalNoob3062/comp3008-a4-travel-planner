"use client";

// Slides one screen out and the next one in. Going forward the new screen arrives from the right,
// going back it arrives from the left, so the motion matches the direction of travel through the steps.
import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { DURATION, EASE_OUT, SLIDE_DISTANCE } from "./tokens";

const variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * SLIDE_DISTANCE }),
  center: { opacity: 1, x: 0, transition: { duration: DURATION.enter, ease: EASE_OUT } },
  // The outgoing screen leaves quickly so a click never feels held up.
  exit: (direction: number) => ({ opacity: 0, x: direction * -SLIDE_DISTANCE * 0.5, transition: { duration: DURATION.exit, ease: "easeIn" as const } }),
};

let firstScreenShown = false;

/** One screen. When it appears, keyboard focus moves to its heading (accessibility). */
function Screen({ direction, children }: { direction: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Not on the very first load: the page should not grab focus before the user has done anything.
    const moveFocus = firstScreenShown;
    firstScreenShown = true;
    if (!moveFocus) return;
    window.scrollTo({ top: 0 });
    // The heading is normally there at once. If the screen's code is still arriving, keep looking for a moment.
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const focusHeading = () => {
      const heading = ref.current?.querySelector<HTMLElement>("[data-screen-heading]");
      if (heading) heading.focus({ preventScroll: true });
      else if (++tries < 40) timer = setTimeout(focusHeading, 50);
    };
    focusHeading();
    return () => clearTimeout(timer);
  }, []);
  return (
    <m.div
      ref={ref}
      data-motion="screen"
      custom={direction}
      variants={variants}
      // The first screen after a page load does not slide in, but its own contents still animate.
      initial={firstScreenShown ? "enter" : false}
      animate="center"
      exit="exit"
      className="flex w-full flex-1 flex-col items-center"
    >
      {children}
    </m.div>
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
    <AnimatePresence mode="wait" custom={direction}>
      <Screen key={screenKey} direction={direction}>
        {children}
      </Screen>
    </AnimatePresence>
  );
}
