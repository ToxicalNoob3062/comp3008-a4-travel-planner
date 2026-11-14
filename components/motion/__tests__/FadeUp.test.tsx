import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FadeUp from "../FadeUp";
import { opacityOf, renderWithMotion, timeToVisible, transformOf, waitUntilSettled } from "@/test/motion";

describe("FadeUp", () => {
  it("renders a div by default and a list item when asked", () => {
    renderWithMotion(
      <ul>
        <FadeUp>block</FadeUp>
        <FadeUp as="li">item</FadeUp>
      </ul>,
    );
    expect(screen.getByText("block").tagName).toBe("DIV");
    expect(screen.getByText("item").tagName).toBe("LI");
    expect(screen.getByText("item")).toHaveAttribute("data-motion", "fade-up");
  });

  it("starts hidden below its place and ends visible in place", async () => {
    renderWithMotion(<FadeUp>card</FadeUp>);
    const card = screen.getByText("card");
    expect(opacityOf(card)).toBe(0);
    expect(transformOf(card)).toContain("translateY(14px)");
    await waitUntilSettled(card);
  });

  it("comes from the left when asked", () => {
    renderWithMotion(<FadeUp from="left">step</FadeUp>);
    expect(transformOf(screen.getByText("step"))).toContain("translateX(-10px)");
  });

  it("brings list items in one after another, in order", async () => {
    renderWithMotion(
      <>
        <FadeUp order={0}>first</FadeUp>
        <FadeUp order={1}>second</FadeUp>
        <FadeUp order={2}>third</FadeUp>
      </>,
    );
    const [first, second, third] = await Promise.all(
      ["first", "second", "third"].map((text) => timeToVisible(screen.getByText(text))),
    );
    expect(first).toBeLessThan(second);
    expect(second).toBeLessThan(third);
  });

  it("waits for `delay` before starting", async () => {
    renderWithMotion(
      <>
        <FadeUp>now</FadeUp>
        <FadeUp delay={0.3}>later</FadeUp>
      </>,
    );
    const [now, later] = await Promise.all([timeToVisible(screen.getByText("now")), timeToVisible(screen.getByText("later"))]);
    expect(later - now).toBeGreaterThan(200);
  });

  it("hides decoration from screen readers and keeps labels", () => {
    renderWithMotion(
      <>
        <FadeUp decorative>art</FadeUp>
        <FadeUp aria-label="4:30: Walk 12 minutes">row</FadeUp>
      </>,
    );
    expect(screen.getByText("art")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByLabelText("4:30: Walk 12 minutes")).toBeInTheDocument();
  });

  it("does not slide when reduced motion is on", async () => {
    renderWithMotion(<FadeUp>card</FadeUp>, { reducedMotion: "always" });
    const card = screen.getByText("card");
    const start = transformOf(card);
    const seen = new Set<string>();
    const watch = setInterval(() => seen.add(transformOf(card)), 4);
    await waitUntilSettled(card);
    clearInterval(watch);
    expect([...seen].filter((value) => value !== start && value !== "none")).toEqual([]);
  });
});
