"use client";

// A Material UI panel (Paper) that drops in. Used as the panel of dropdown lists,
// such as the place suggestions, so they open the same way as the calendar.
import Paper, { type PaperProps } from "@mui/material/Paper";
import DropIn from "./DropIn";

export default function DropInPaper(props: PaperProps) {
  return (
    <DropIn>
      <Paper {...props} />
    </DropIn>
  );
}
