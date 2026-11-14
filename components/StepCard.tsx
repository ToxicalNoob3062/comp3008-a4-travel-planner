"use client";

// The white card every screen sits in: title, "Step N of 4", progress bar, content and actions.
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { EASE_OUT } from "@/components/motion/FadeUp";

interface StepCardProps {
  title: string;
  /** 1-4 for the wizard steps. Leave out for screens that are not a numbered step. */
  step?: number;
  /** Shown on the right of the title when there is no step number (e.g. the "Edit trip" button). */
  headerAction?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}

export const TOTAL_STEPS = 4;

// The step whose progress was last on screen. Each step draws its own bar, so this is what lets
// the bar animate from where it was (1 -> 2 fills the second segment; 3 -> 2 drains the third).
let lastShownStep = 0;

/** Called from the start screen so a new trip begins with an empty bar. */
export function resetProgress() {
  lastShownStep = 0;
}

function ProgressBar({ step }: { step: number }) {
  const [from] = useState(lastShownStep);
  useEffect(() => {
    lastShownStep = step;
  }, [step]);

  return (
    <div
      role="progressbar"
      aria-label="Planning progress"
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
      aria-valuenow={step}
      aria-valuetext={`Step ${step} of ${TOTAL_STEPS}`}
      className="flex gap-2"
    >
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full origin-left rounded-full bg-brand"
            initial={{ scaleX: i < from ? 1 : 0 }}
            animate={{ scaleX: i < step ? 1 : 0 }}
            // Starts just after the new screen has slid in, so the eye can follow it.
            transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.18 }}
          />
        </div>
      ))}
    </div>
  );
}

export default function StepCard({ title, step, headerAction, children, actions }: StepCardProps) {
  return (
    <section
      aria-labelledby="screen-title"
      className="flex min-h-[600px] w-full max-w-[760px] flex-col gap-6 rounded-xl border border-line bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] sm:p-8"
    >
      <div className="flex items-center gap-4">
        {/* tabIndex -1 lets the planner move keyboard focus here when the screen changes. */}
        <h1 id="screen-title" tabIndex={-1} data-screen-heading className="flex-1 text-[28px] font-medium text-ink outline-none">
          {title}
        </h1>
        {step ? (
          <p className="shrink-0 text-sm font-medium text-muted">
            Step {step} of {TOTAL_STEPS}
          </p>
        ) : (
          headerAction
        )}
      </div>

      {step ? <ProgressBar step={step} /> : null}

      {children}

      {actions ? (
        <>
          <div className="min-h-px flex-1" />
          <div className="flex flex-wrap items-center justify-between gap-3">{actions}</div>
        </>
      ) : null}
    </section>
  );
}
