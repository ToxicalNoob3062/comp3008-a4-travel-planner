import Dialog from "@mui/material/Dialog";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PopupTransition from "../PopupTransition";
import { POPUP } from "../tokens";
import { renderWithMotion } from "@/test/motion";

const Popup = ({ open }: { open: boolean }) => (
  <Dialog open={open} slots={{ transition: PopupTransition }}>
    <p>Route details</p>
  </Dialog>
);

/** The element Material UI scales to open and close the dialog. */
const scaled = () => document.querySelector<HTMLElement>(".MuiDialog-container")!;

describe("PopupTransition", () => {
  it("shows nothing while the dialog is closed", () => {
    renderWithMotion(<Popup open={false} />);
    expect(screen.queryByText("Route details")).not.toBeInTheDocument();
  });

  it("grows the dialog in from its centre using the shared timing", async () => {
    renderWithMotion(<Popup open />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Route details")).toBeVisible();
    await waitFor(() => expect(scaled().style.transform).toBe("none"));
    expect(scaled().style.transition).toContain(`${POPUP.enterMs}ms`);
    expect(scaled().style.transition).toContain(POPUP.enterEasing);
  });

  it("shrinks it away faster when it closes, then removes it", async () => {
    const { rerender } = renderWithMotion(<Popup open />);
    await screen.findByRole("dialog");
    rerender(<Popup open={false} />);
    expect(scaled().style.transform).toBe("scale(0)");
    expect(scaled().style.transition).toContain(`${POPUP.exitMs}ms`);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), { timeout: 2000 });
  });
});
