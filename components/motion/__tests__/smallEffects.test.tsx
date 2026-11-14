import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DropIn from "../DropIn";
import ScaleIn from "../ScaleIn";
import SelectionHighlight from "../SelectionHighlight";
import { opacityOf, renderWithMotion, transformOf, waitUntilSettled } from "@/test/motion";

describe("ScaleIn", () => {
  it("starts at nothing, turned, and snaps to full size", async () => {
    renderWithMotion(<ScaleIn>✓</ScaleIn>);
    const mark = screen.getByText("✓");
    expect(mark).toHaveAttribute("data-motion", "scale-in");
    expect(transformOf(mark)).toContain("scale(0)");
    expect(transformOf(mark)).toContain("rotate(-45deg)");
    await waitUntilSettled(mark);
  });
});

describe("DropIn", () => {
  it("starts hidden just above its place and opens downward from the top-left corner", async () => {
    renderWithMotion(<DropIn>calendar</DropIn>);
    const panel = screen.getByText("calendar");
    expect(panel).toHaveAttribute("data-motion", "drop-in");
    expect(opacityOf(panel)).toBe(0);
    expect(transformOf(panel)).toContain("translateY(-12px)");
    expect(panel.style.transformOrigin.split(" ").sort()).toEqual(["left", "top"]);
    await waitUntilSettled(panel);
  });

  it("fades out when closed and then reports that it has finished", async () => {
    let closed = 0;
    const { rerender } = renderWithMotion(<DropIn open>list</DropIn>);
    const panel = screen.getByText("list");
    await waitUntilSettled(panel);
    rerender(<DropIn open={false} onClosed={() => closed++}>list</DropIn>);
    await waitFor(() => expect(closed).toBe(1), { timeout: 3000 });
    expect(opacityOf(panel)).toBe(0);
  });

  it("marks its contents as fresh only when asked, so options can arrive in turn once per opening", () => {
    const { rerender } = renderWithMotion(<DropIn fresh>list</DropIn>);
    expect(screen.getByText("list")).toHaveAttribute("data-fresh");
    rerender(<DropIn>list</DropIn>);
    expect(screen.getByText("list")).not.toHaveAttribute("data-fresh");
  });
});

describe("SelectionHighlight", () => {
  it("is a decorative layer that fills its item and ignores clicks", () => {
    const { container } = renderWithMotion(
      <div className="relative">
        <SelectionHighlight group="route" className="bg-brand-tint" />
        Leave 4:30 PM
      </div>,
    );
    const highlight = container.querySelector('[data-motion="selection"]')!;
    expect(highlight).toHaveAttribute("aria-hidden", "true");
    expect(highlight).toHaveClass("absolute", "pointer-events-none", "bg-brand-tint");
  });

  it("is drawn only on the selected item, and moves when the selection changes", () => {
    const List = ({ selected }: { selected: number }) => (
      <>
        {[0, 1, 2].map((i) => (
          <div key={i} data-testid={`card-${i}`} className="relative">
            {selected === i ? <SelectionHighlight group="route" className="x" /> : null}
          </div>
        ))}
      </>
    );
    const { rerender, container } = renderWithMotion(<List selected={2} />);
    const holder = () => container.querySelector('[data-motion="selection"]')!.parentElement!;
    expect(container.querySelectorAll('[data-motion="selection"]')).toHaveLength(1);
    expect(holder()).toHaveAttribute("data-testid", "card-2");
    rerender(<List selected={0} />);
    expect(container.querySelectorAll('[data-motion="selection"]')).toHaveLength(1);
    expect(holder()).toHaveAttribute("data-testid", "card-0");
  });
});
