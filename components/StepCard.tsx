"use client";

// The surface every screen sits on: title, "Step N of 4", progress bar, content and actions.
import type { ReactNode } from "react";
import ProgressBar from "@/components/motion/ProgressBar";
import { ACTION_BAR, SCREEN_CARD } from "@/components/screenCard";

interface StepCardProps {
  title: string;
  /** 1-4 for the wizard steps. Leave out for screens that are not a numbered step. */
  step?: number;
  /** Shown on the right of the title when there is no step number (e.g. the "Edit trip" button). */
  headerAction?: ReactNode;
  children: ReactNode;
  /** The screen's buttons: a small "back" button first, the main button last, anything else in between. */
  actions?: ReactNode;
  /** Used instead of `actions` when the bottom bar needs its own layout. */
  footer?: ReactNode;
}

export const TOTAL_STEPS = 4;

export default function StepCard({ title, step, headerAction, children, actions, footer }: StepCardProps) {
  return (
    <section aria-labelledby="screen-title" className={SCREEN_CARD}>
      <div className="flex items-center gap-3 sm:gap-4">
        {/* tabIndex -1 lets the planner move keyboard focus here when the screen changes. */}
        <h1 id="screen-title" tabIndex={-1} data-screen-heading className="flex-1 text-lg font-medium text-ink outline-none sm:text-[28px]">
          {title}
        </h1>
        {step ? (
          <p className="shrink-0 text-[13px] font-medium text-muted sm:text-sm">
            Step {step} of {TOTAL_STEPS}
          </p>
        ) : (
          headerAction
        )}
      </div>

      {step ? <ProgressBar step={step} total={TOTAL_STEPS} /> : null}

      {children}

      {actions || footer ? (
        <>
          <div className="min-h-px flex-1" />
          <div className={ACTION_BAR}>
            {footer ?? (
              // Phone: Back (small) and the main button share one row; anything extra takes a full row above them.
              // Wide: Back on the left, the rest on the right.
              <div className="grid grid-cols-[auto_1fr] items-center gap-2 sm:flex sm:flex-wrap sm:justify-between sm:gap-3">{actions}</div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
