"use client";

// A Material UI popper whose contents drop in when it opens and fade out when it closes.
// Used for the place suggestions, so the list opens and closes the same way as the calendar.
// For a short moment after opening it marks its contents as "fresh", which lets the first options
// arrive one after another. That happens once per opening, not on every keystroke while typing.
import { useEffect, useState } from "react";
import Popper, { type PopperProps } from "@mui/material/Popper";
import DropIn from "./DropIn";
import { DROP } from "./tokens";

export default function DropInPopper({ children, open, ...rest }: PopperProps) {
  const [fresh, setFresh] = useState(false);
  // Noticing the change from closed to open while rendering avoids an extra effect.
  const [wasOpen, setWasOpen] = useState(false);
  if (!!open !== wasOpen) {
    setWasOpen(!!open);
    if (open) setFresh(true);
  }
  useEffect(() => {
    if (!fresh) return;
    const timer = setTimeout(() => setFresh(false), DROP.freshMs);
    return () => clearTimeout(timer);
  }, [fresh]);

  return (
    <Popper {...rest} open={open} transition>
      {({ TransitionProps }) => (
        <DropIn open={TransitionProps?.in ?? open} onOpening={TransitionProps?.onEnter} onClosed={TransitionProps?.onExited} fresh={fresh}>
          {typeof children === "function" ? null : children}
        </DropIn>
      )}
    </Popper>
  );
}
