"use client";

// The four-segment progress bar. Moving forward fills the next segment; going back drains it.
import { useEffect, useState } from "react";
import * as m from "motion/react-m";
import { DURATION, EASE_OUT } from "./tokens";

// The step whose progress was last on screen. Each step draws its own bar, so this is what lets
// the bar animate from where it was (1 -> 2 fills the second segment; 3 -> 2 drains the third).
let lastShownStep = 0;

/** Called from the start screen so a new trip begins with an empty bar. */
export function resetProgress() {
  lastShownStep = 0;
}

export default function ProgressBar({ step, total }: { step: number; total: number }) {
  const [from] = useState(lastShownStep);
  useEffect(() => {
    lastShownStep = step;
  }, [step]);

  return (
    <div
      data-motion="progress"
      role="progressbar"
      aria-label="Planning progress"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-valuetext={`Step ${step} of ${total}`}
      className="flex gap-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <m.div
            className="h-full origin-left rounded-full bg-brand"
            initial={{ scaleX: i < from ? 1 : 0 }}
            animate={{ scaleX: i < step ? 1 : 0 }}
            // Starts just after the new screen has slid in, so the eye can follow it.
            transition={{ duration: DURATION.progress, ease: EASE_OUT, delay: 0.18 }}
          />
        </div>
      ))}
    </div>
  );
}
