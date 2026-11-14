"use client";

// Loads Motion the light way. The motion components in this folder use the slim `m` elements, which
// contain no animation code of their own; this provider supplies it. `domAnimation` covers everything
// except layout animations. The one screen that needs those (Results) adds them itself, so that code
// is only downloaded with that screen.
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    // strict: using the full `motion` component by mistake throws, so the saving cannot be lost silently.
    <LazyMotion features={domAnimation} strict>
      {/* reducedMotion="user": people who ask their system for less motion get fades only. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
