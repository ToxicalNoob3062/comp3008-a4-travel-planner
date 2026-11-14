import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Pop from "../Pop";
import { opacityOf, renderWithMotion, transformOf, waitUntilSettled } from "@/test/motion";

describe("Pop", () => {
  it("shows its content and marks itself for tests", () => {
    renderWithMotion(<Pop>Route sent</Pop>);
    const box = screen.getByText("Route sent");
    expect(box).toHaveAttribute("data-motion", "pop");
  });

  it("starts hidden, lowered and slightly small", () => {
    renderWithMotion(<Pop>Route sent</Pop>);
    const box = screen.getByText("Route sent");
    expect(opacityOf(box)).toBe(0);
    expect(transformOf(box)).toContain("translateY(12px)");
    expect(transformOf(box)).toContain("scale(0.94)");
  });

  it("ends fully visible at its natural size and position", async () => {
    renderWithMotion(<Pop>Route sent</Pop>);
    await waitUntilSettled(screen.getByText("Route sent"));
  });

  it("overshoots its final size once on the way in (the bounce)", async () => {
    renderWithMotion(<Pop>Route sent</Pop>);
    const box = screen.getByText("Route sent");
    let largest = 0;
    const watch = setInterval(() => {
      const match = /scale\(([\d.]+)\)/.exec(box.style.transform);
      if (match) largest = Math.max(largest, Number(match[1]));
    }, 4);
    await waitUntilSettled(box);
    clearInterval(watch);
    expect(largest).toBeGreaterThan(1);
  });

  it("keeps two boxes that appear together exactly in step", async () => {
    renderWithMotion(
      <>
        <Pop>Tip</Pop>
        <Pop>Goal</Pop>
      </>,
    );
    const tip = screen.getByText("Tip");
    const goal = screen.getByText("Goal");
    let outOfStep = 0;
    const watch = setInterval(() => {
      if (tip.style.transform !== goal.style.transform || tip.style.opacity !== goal.style.opacity) outOfStep++;
    }, 4);
    await waitUntilSettled(tip);
    await waitUntilSettled(goal);
    clearInterval(watch);
    expect(outOfStep).toBe(0);
  });

  it("passes a className through for layout", () => {
    renderWithMotion(<Pop className="-mt-3">Tip</Pop>);
    expect(screen.getByText("Tip")).toHaveClass("-mt-3");
  });

  it("does not slide or bounce when reduced motion is on: it only fades", async () => {
    renderWithMotion(<Pop>Route sent</Pop>, { reducedMotion: "always" });
    const box = screen.getByText("Route sent");
    const start = transformOf(box);
    const seen = new Set<string>();
    const watch = setInterval(() => seen.add(transformOf(box)), 4);
    await waitUntilSettled(box);
    clearInterval(watch);
    // The position changes in one step (start -> rest) with no frames in between, so nothing travels or overshoots.
    expect([...seen].filter((value) => value !== start && value !== "none")).toEqual([]);
  });

  it("fades away by itself and leaves the page once its time is up", async () => {
    renderWithMotion(<Pop visibleMs={150}>Tip</Pop>);
    expect(screen.getByText("Tip")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Tip")).not.toBeInTheDocument(), { timeout: 3000 });
  });

  it("closes its height on the way out, so what is below slides up", async () => {
    renderWithMotion(<Pop visibleMs={50}>Tip</Pop>);
    const box = screen.getByText("Tip");
    let sawClosing = false;
    const watch = setInterval(() => {
      if (box.style.height !== "" && box.style.height !== "auto") sawClosing = true;
    }, 4);
    await waitFor(() => expect(screen.queryByText("Tip")).not.toBeInTheDocument(), { timeout: 3000 });
    clearInterval(watch);
    expect(sawClosing).toBe(true);
  });

  it("stays on screen when told to (errors with a fix, confirmations with a link)", async () => {
    renderWithMotion(<Pop stay visibleMs={50}>Route sent</Pop>);
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(screen.getByText("Route sent")).toBeInTheDocument();
  });

  it("waits while the pointer is on it, then starts counting again", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    renderWithMotion(<Pop visibleMs={150}>Tip</Pop>);
    const box = screen.getByText("Tip");
    await user.hover(box);
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(box).toBeInTheDocument();
    await user.unhover(box);
    await waitFor(() => expect(screen.queryByText("Tip")).not.toBeInTheDocument(), { timeout: 3000 });
  });
});
