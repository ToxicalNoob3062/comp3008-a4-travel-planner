import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScreenTransition from "../ScreenTransition";
import { renderWithMotion, transformOf } from "@/test/motion";

const Step = ({ title }: { title: string }) => (
  <h1 tabIndex={-1} data-screen-heading>
    {title}
  </h1>
);

/** The sliding wrapper around the screen that contains this text. */
const frameOf = (text: string) => screen.getByText(text).closest<HTMLElement>('[data-motion="screen"]')!;

// The tests in this file run in order and share one page history, like a real visit:
// the first screen ever shown must not move or take focus; later ones do both.
describe("ScreenTransition", () => {
  it("shows the first screen in place, without sliding it in or taking focus", () => {
    renderWithMotion(
      <ScreenTransition screenKey="start" direction={1}>
        <Step title="Plan a trip" />
      </ScreenTransition>,
    );
    expect(transformOf(frameOf("Plan a trip"))).toBe("none");
    expect(screen.getByText("Plan a trip")).not.toHaveFocus();
  });

  it("going forward: the old screen leaves, then the new one arrives from the right and gets focus", async () => {
    const { rerender } = renderWithMotion(
      <ScreenTransition screenKey="where" direction={1}>
        <Step title="Where are you going?" />
      </ScreenTransition>,
    );
    rerender(
      <ScreenTransition screenKey="when" direction={1}>
        <Step title="When do you need to travel?" />
      </ScreenTransition>,
    );
    // The old screen is still there while it leaves; the new one is not shown yet (one at a time).
    expect(screen.getByText("Where are you going?")).toBeInTheDocument();
    expect(screen.queryByText("When do you need to travel?")).not.toBeInTheDocument();

    const heading = await screen.findByText("When do you need to travel?");
    expect(screen.queryByText("Where are you going?")).not.toBeInTheDocument();
    // Arrives from the right: a positive horizontal offset that shrinks to nothing.
    const start = /translateX\((-?[\d.]+)px\)/.exec(transformOf(frameOf("When do you need to travel?")));
    expect(Number(start?.[1])).toBeGreaterThan(0);
    await waitFor(() => expect(transformOf(frameOf("When do you need to travel?"))).toBe("none"), { timeout: 3000 });
    // Accessibility: keyboard and screen-reader users land on the new step's heading.
    expect(heading).toHaveFocus();
  });

  it("going back: the new screen arrives from the left", async () => {
    const { rerender } = renderWithMotion(
      <ScreenTransition screenKey="services" direction={1}>
        <Step title="Which services can we use?" />
      </ScreenTransition>,
    );
    rerender(
      <ScreenTransition screenKey="when" direction={-1}>
        <Step title="When do you need to travel?" />
      </ScreenTransition>,
    );
    await screen.findByText("When do you need to travel?");
    const start = /translateX\((-?[\d.]+)px\)/.exec(transformOf(frameOf("When do you need to travel?")));
    expect(Number(start?.[1])).toBeLessThan(0);
  });

  it("does not replay when the same screen re-renders with new content", async () => {
    const { rerender } = renderWithMotion(
      <ScreenTransition screenKey="review" direction={1}>
        <Step title="Check your trip" />
      </ScreenTransition>,
    );
    await waitFor(() => expect(transformOf(frameOf("Check your trip"))).toBe("none"), { timeout: 3000 });
    rerender(
      <ScreenTransition screenKey="review" direction={1}>
        <Step title="Check your trip (searching)" />
      </ScreenTransition>,
    );
    expect(transformOf(frameOf("Check your trip (searching)"))).toBe("none");
  });
});
