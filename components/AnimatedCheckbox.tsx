"use client";

// A Material UI checkbox whose tick animates when the user checks it (see motion/CheckDraw).
// Boxes that are already checked when the screen opens appear checked without animating.
import { useState } from "react";
import Checkbox, { type CheckboxProps } from "@mui/material/Checkbox";
import CheckDraw from "@/components/motion/CheckDraw";

export default function AnimatedCheckbox({ onChange, ...props }: CheckboxProps) {
  const [touched, setTouched] = useState(false);
  return (
    <Checkbox
      {...props}
      checkedIcon={<CheckDraw animate={touched} />}
      onChange={(event, checked) => {
        setTouched(true);
        onChange?.(event, checked);
      }}
    />
  );
}
