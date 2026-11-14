// Helpers shared by the animation tests.
import { render, waitFor, type RenderOptions } from "@testing-library/react";
import { LazyMotion, MotionConfig, domMax } from "motion/react";
import type { ReactElement, ReactNode } from "react";

type ReducedMotion = "never" | "always";

/**
 * Renders inside the same Motion setup the app uses (slim components + features).
 * Animations really run, so tests can check both where an element starts and where it ends.
 */
export function renderWithMotion(ui: ReactElement, options: RenderOptions & { reducedMotion?: ReducedMotion } = {}) {
  const { reducedMotion = "never", ...rest } = options;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>
    </LazyMotion>
  );
  return render(ui, { wrapper, ...rest });
}

/** Current opacity of an element (1 when Motion has not set one). */
export function opacityOf(element: HTMLElement | SVGElement): number {
  return element.style.opacity === "" ? 1 : Number(element.style.opacity);
}

/** The element's inline transform, "none" when it is at rest. */
export function transformOf(element: HTMLElement | SVGElement): string {
  return element.style.transform || "none";
}

/** Resolves when the element has finished animating in: fully visible and back at its natural position. */
export async function waitUntilSettled(element: HTMLElement | SVGElement) {
  await waitFor(
    () => {
      if (opacityOf(element) !== 1) throw new Error(`opacity is still ${element.style.opacity}`);
      if (transformOf(element) !== "none") throw new Error(`transform is still ${element.style.transform}`);
    },
    { timeout: 4000, interval: 20 },
  );
}

/** Milliseconds from now until the element is fully visible. */
export async function timeToVisible(element: HTMLElement): Promise<number> {
  const start = performance.now();
  await waitFor(() => { if (opacityOf(element) < 0.999) throw new Error("not visible yet"); }, { timeout: 4000, interval: 10 });
  return performance.now() - start;
}
