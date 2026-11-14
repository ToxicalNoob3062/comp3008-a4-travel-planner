"use client";

// The white card every screen sits in: title, "Step N of 4", progress bar, content and actions.
import type { ReactNode } from "react";
import ProgressBar from "@/components/motion/ProgressBar";

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

      {step ? <ProgressBar step={step} total={TOTAL_STEPS} /> : null}

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
