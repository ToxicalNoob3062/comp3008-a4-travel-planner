"use client";

// How every dialog opens and closes: it grows out from its centre with a slight overshoot, and
// shrinks away a little faster. Set once as the default for all dialogs in app/providers.tsx,
// so any new dialog gets it without doing anything.
import { forwardRef, type ReactElement, type Ref } from "react";
import Zoom from "@mui/material/Zoom";
import type { TransitionProps } from "@mui/material/transitions";
import { POPUP } from "./tokens";

const PopupTransition = forwardRef(function PopupTransition(
  props: TransitionProps & { children: ReactElement<unknown> },
  ref: Ref<unknown>,
) {
  return (
    <Zoom
      ref={ref}
      {...props}
      timeout={{ enter: POPUP.enterMs, exit: POPUP.exitMs }}
      easing={{ enter: POPUP.enterEasing, exit: POPUP.exitEasing }}
    />
  );
});

export default PopupTransition;
