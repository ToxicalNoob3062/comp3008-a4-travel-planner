"use client";

// The highlight behind the selected item in a list. When the selection changes it glides from the
// old item to the new one instead of jumping, so the eye can follow where the selection went.
// Put it inside a `relative` item, and render it only for the selected one. Items that share
// the same `group` name share one highlight.
import * as m from "motion/react-m";
import { SPRING } from "./tokens";

export default function SelectionHighlight({ group, className }: { group: string; className: string }) {
  return (
    <m.span
      data-motion="selection"
      aria-hidden="true"
      layoutId={`selection-${group}`}
      transition={SPRING.drop}
      className={`pointer-events-none absolute -inset-px ${className}`}
    />
  );
}
