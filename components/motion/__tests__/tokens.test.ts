import { describe, expect, it } from "vitest";
import { DURATION, POP_DELAY, POPUP, PRESS_SCALE, SLIDE_DISTANCE, SPRING, STAGGER } from "../tokens";

// These protect the feel of the interface: a value changed by accident shows up here.
describe("motion tokens", () => {
  it("makes leaving quicker than arriving, so a click never feels held up", () => {
    expect(DURATION.exit).toBeLessThan(DURATION.enter);
    expect(POPUP.exitMs).toBeLessThan(POPUP.enterMs);
  });

  it("keeps every animation short enough not to slow the task down", () => {
    for (const seconds of Object.values(DURATION)) expect(seconds).toBeLessThanOrEqual(0.6);
    expect(POPUP.enterMs).toBeLessThanOrEqual(400);
    expect(POP_DELAY).toBeLessThanOrEqual(0.3);
  });

  it("staggers list items by a visible but brief gap", () => {
    expect(STAGGER).toBeGreaterThan(0.05);
    expect(STAGGER).toBeLessThan(0.2);
  });

  it("presses buttons down only slightly", () => {
    expect(PRESS_SCALE).toBeGreaterThanOrEqual(0.9);
    expect(PRESS_SCALE).toBeLessThan(1);
  });

  it("slides screens a short distance", () => {
    expect(SLIDE_DISTANCE).toBeGreaterThan(0);
    expect(SLIDE_DISTANCE).toBeLessThanOrEqual(60);
  });

  it("gives message boxes a bounce and panels none", () => {
    // Lower damping = more bounce. Message boxes bounce; the calendar should not.
    expect(SPRING.pop.damping).toBeLessThan(SPRING.drop.damping);
  });
});
