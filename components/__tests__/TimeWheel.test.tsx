import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import TimeWheel from "../TimeWheel";
import { renderWithMotion } from "@/test/motion";

const HOURS = ["", ...Array.from({ length: 12 }, (_, i) => String(i + 1))];
const MINUTES = ["", ...Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))];

function Wheel({ options, label, start = "" }: { options: string[]; label: string; start?: string }) {
  const [value, setValue] = useState(start);
  return <TimeWheel label={label} unit="x" side="left" options={options} value={value} onChange={setValue} />;
}

const wheel = (name: string) => screen.getByRole("spinbutton", { name });

describe("TimeWheel", () => {
  it("starts with nothing chosen, so no time is picked for the user", () => {
    renderWithMotion(<Wheel options={HOURS} label="Hour" />);
    expect(wheel("Hour")).toHaveAttribute("aria-valuetext", "Not chosen");
    expect(wheel("Hour")).not.toHaveAttribute("aria-valuenow");
  });

  it("typing a digit jumps to that value", async () => {
    renderWithMotion(<Wheel options={HOURS} label="Hour" />);
    await userEvent.click(wheel("Hour"));
    await userEvent.keyboard("7");
    expect(wheel("Hour")).toHaveAttribute("aria-valuenow", "7");
  });

  it("two digits typed quickly are read as one number", async () => {
    renderWithMotion(
      <>
        <Wheel options={HOURS} label="Hour" />
        <Wheel options={MINUTES} label="Minute" />
      </>,
    );
    wheel("Hour").focus();
    await userEvent.keyboard("10");
    expect(wheel("Hour")).toHaveAttribute("aria-valuetext", "10");
    wheel("Minute").focus();
    await userEvent.keyboard("30");
    expect(wheel("Minute")).toHaveAttribute("aria-valuetext", "30");
  });

  it("a digit that cannot extend the number starts a new one", async () => {
    renderWithMotion(<Wheel options={HOURS} label="Hour" />);
    wheel("Hour").focus();
    await userEvent.keyboard("5");
    await userEvent.keyboard("9"); // 59 is not an hour, so this means 9
    expect(wheel("Hour")).toHaveAttribute("aria-valuetext", "9");
  });

  it("digits typed after a pause start a new number", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithMotion(<Wheel options={HOURS} label="Hour" />);
    wheel("Hour").focus();
    await user.keyboard("1");
    act(() => vi.advanceTimersByTime(1100));
    await user.keyboard("2"); // not 12: the pause ended the first number
    expect(wheel("Hour")).toHaveAttribute("aria-valuetext", "2");
    vi.useRealTimers();
  });

  it("arrow keys, Home, End and Page keys move the value", async () => {
    renderWithMotion(<Wheel options={MINUTES} label="Minute" start="10" />);
    wheel("Minute").focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(wheel("Minute")).toHaveAttribute("aria-valuetext", "11");
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(wheel("Minute")).toHaveAttribute("aria-valuetext", "09");
    await userEvent.keyboard("{PageDown}");
    expect(wheel("Minute")).toHaveAttribute("aria-valuetext", "14");
    await userEvent.keyboard("{End}");
    expect(wheel("Minute")).toHaveAttribute("aria-valuetext", "59");
    await userEvent.keyboard("{Home}");
    expect(wheel("Minute")).toHaveAttribute("aria-valuetext", "00");
  });

  it("cannot go past either end", async () => {
    renderWithMotion(<Wheel options={HOURS} label="Hour" start="12" />);
    wheel("Hour").focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(wheel("Hour")).toHaveAttribute("aria-valuetext", "12");
  });

  it("Backspace clears the value and Escape leaves the wheel", async () => {
    renderWithMotion(<Wheel options={HOURS} label="Hour" start="6" />);
    wheel("Hour").focus();
    await userEvent.keyboard("{Backspace}");
    expect(wheel("Hour")).toHaveAttribute("aria-valuetext", "Not chosen");
    await userEvent.keyboard("{Escape}");
    expect(wheel("Hour")).not.toHaveFocus();
  });

  it("clicking a value chooses it", async () => {
    renderWithMotion(<Wheel options={HOURS} label="Hour" />);
    await userEvent.click(screen.getByText("4"));
    expect(wheel("Hour")).toHaveAttribute("aria-valuetext", "4");
  });

  it("scrolling chooses the value in the middle straight away, without waiting for the wheel to stop", () => {
    renderWithMotion(<Wheel options={HOURS} label="Hour" />);
    const list = wheel("Hour");
    act(() => {
      list.scrollTop = 40 * 3; // three rows down
      list.dispatchEvent(new Event("scroll"));
    });
    expect(list).toHaveAttribute("aria-valuetext", "3");
  });

  it("is reachable with Tab", async () => {
    renderWithMotion(<Wheel options={HOURS} label="Hour" />);
    await userEvent.tab();
    expect(wheel("Hour")).toHaveFocus();
  });
});
