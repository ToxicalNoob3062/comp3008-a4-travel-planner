import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import ProgressBar, { resetProgress } from "../ProgressBar";
import { renderWithMotion } from "@/test/motion";

/** How full each segment is drawn right now: 0 = empty, 1 = full. */
function fills(bar: HTMLElement): number[] {
  return [...bar.querySelectorAll<HTMLElement>(":scope > div > div")].map((segment) => {
    const match = /scaleX\(([\d.]+)\)/.exec(segment.style.transform);
    return match ? Number(match[1]) : 1; // no transform means a full segment
  });
}

async function waitForFills(bar: HTMLElement, expected: number[]) {
  await waitFor(() => expect(fills(bar)).toEqual(expected), { timeout: 4000, interval: 20 });
}

describe("ProgressBar", () => {
  beforeEach(() => resetProgress());

  it("tells screen readers which step this is", () => {
    renderWithMotion(<ProgressBar step={2} total={4} />);
    const bar = screen.getByRole("progressbar", { name: "Planning progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "4");
    expect(bar).toHaveAttribute("aria-valuetext", "Step 2 of 4");
    expect(bar).toHaveAttribute("data-motion", "progress");
  });

  it("draws one segment per step", () => {
    renderWithMotion(<ProgressBar step={1} total={4} />);
    expect(fills(screen.getByRole("progressbar"))).toHaveLength(4);
  });

  it("starts a new trip empty and fills the first segment", async () => {
    renderWithMotion(<ProgressBar step={1} total={4} />);
    const bar = screen.getByRole("progressbar");
    expect(fills(bar)).toEqual([0, 0, 0, 0]);
    await waitForFills(bar, [1, 0, 0, 0]);
  });

  it("going forward keeps earlier segments full and fills only the new one", async () => {
    const first = renderWithMotion(<ProgressBar step={1} total={4} />);
    await waitForFills(screen.getByRole("progressbar"), [1, 0, 0, 0]);
    first.unmount(); // each step draws its own bar

    renderWithMotion(<ProgressBar step={2} total={4} />);
    const bar = screen.getByRole("progressbar");
    expect(fills(bar)).toEqual([1, 0, 0, 0]); // starts from where the last step left it
    await waitForFills(bar, [1, 1, 0, 0]);
  });

  it("going back drains the segment that was left", async () => {
    const third = renderWithMotion(<ProgressBar step={3} total={4} />);
    await waitForFills(screen.getByRole("progressbar"), [1, 1, 1, 0]);
    third.unmount();

    renderWithMotion(<ProgressBar step={2} total={4} />);
    const bar = screen.getByRole("progressbar");
    expect(fills(bar)).toEqual([1, 1, 1, 0]);
    await waitForFills(bar, [1, 1, 0, 0]);
  });

  it("resetProgress() makes the next bar start from empty again", async () => {
    const last = renderWithMotion(<ProgressBar step={4} total={4} />);
    await waitForFills(screen.getByRole("progressbar"), [1, 1, 1, 1]);
    last.unmount();
    resetProgress();

    renderWithMotion(<ProgressBar step={1} total={4} />);
    expect(fills(screen.getByRole("progressbar"))).toEqual([0, 0, 0, 0]);
  });

  it("fills gradually, not in one jump", async () => {
    renderWithMotion(<ProgressBar step={1} total={4} />);
    const bar = screen.getByRole("progressbar");
    const seen = new Set<number>();
    const watch = setInterval(() => seen.add(fills(bar)[0]), 4);
    await waitForFills(bar, [1, 0, 0, 0]);
    clearInterval(watch);
    expect([...seen].filter((value) => value > 0 && value < 1).length).toBeGreaterThan(3);
  });
});
