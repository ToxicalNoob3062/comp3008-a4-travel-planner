import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import AnimatedCheckbox from "../AnimatedCheckbox";
import { renderWithMotion } from "@/test/motion";

function Service({ startChecked, onToggle }: { startChecked: boolean; onToggle?: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(startChecked);
  return (
    <label>
      <AnimatedCheckbox
        checked={checked}
        onChange={(_, value) => {
          setChecked(value);
          onToggle?.(value);
        }}
      />
      School routes
    </label>
  );
}

const tick = () => document.querySelector('[data-motion="check-draw"]');
const ring = () => tick()?.querySelector("circle") ?? null;

describe("AnimatedCheckbox", () => {
  it("is a normal, labelled checkbox", () => {
    renderWithMotion(<Service startChecked={false} />);
    expect(screen.getByRole("checkbox", { name: "School routes" })).not.toBeChecked();
    expect(tick()).toBeNull();
  });

  it("a box that is already checked is drawn checked without the celebration", () => {
    renderWithMotion(<Service startChecked />);
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(tick()).not.toBeNull();
    expect(ring()).toBeNull(); // no burst ring
  });

  it("ticking it plays the celebration and reports the change", async () => {
    const onToggle = vi.fn();
    renderWithMotion(<Service startChecked={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(ring()).not.toBeNull(); // the burst ring is drawn
    // The box starts small and is already growing.
    const scale = /scale\(([\d.]+)\)/.exec(tick()!.querySelector("rect")!.style.transform);
    expect(Number(scale?.[1])).toBeGreaterThanOrEqual(0.4);
    expect(Number(scale?.[1])).toBeLessThan(0.9);
  });

  it("unticking removes the tick straight away", async () => {
    renderWithMotion(<Service startChecked />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(tick()).toBeNull();
  });

  it("works from the keyboard", async () => {
    renderWithMotion(<Service startChecked={false} />);
    await userEvent.tab();
    expect(screen.getByRole("checkbox")).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("the tick is decoration: hidden from screen readers", () => {
    renderWithMotion(<Service startChecked />);
    expect(tick()).toHaveAttribute("aria-hidden", "true");
  });
});
