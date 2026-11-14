"use client";

// Date field that opens a Material UI calendar. The date is picked from the calendar, never typed,
// so only real dates can be entered. It shows the date as words, e.g. "Tue, Oct 6, 2026".
import { useRef, useState } from "react";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import TextField from "@mui/material/TextField";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { formatDate, isValidDate } from "@/lib/time";

interface DateFieldProps {
  label: string;
  /** YYYY-MM-DD, or "" when no date is chosen. */
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function DateField({ label, value, onChange, className }: DateFieldProps) {
  // The field the calendar is attached to; null while the calendar is closed.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const open = anchor !== null;
  const chosen = isValidDate(value);

  const close = (returnFocus: boolean) => {
    setAnchor(null);
    if (returnFocus) inputRef.current?.focus();
  };

  return (
    // The calendar is not a modal: a click outside it closes it AND still reaches whatever was clicked,
    // so the user never has to click twice.
    <ClickAwayListener onClickAway={() => open && close(false)}>
      <div
        className={className}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.stopPropagation();
            close(true);
          }
        }}
      >
        <TextField
          fullWidth
          label={label}
          variant="standard"
          focused={open || undefined}
          value={chosen ? formatDate(value) : ""}
          placeholder="Choose a date"
          inputRef={inputRef}
          onClick={(event) => (open ? close(false) : setAnchor(event.currentTarget))}
          onKeyDown={(event) => {
            if (!open && (event.key === "Enter" || event.key === " " || event.key === "ArrowDown")) {
              event.preventDefault();
              setAnchor(event.currentTarget);
            }
          }}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { readOnly: true, "aria-haspopup": "dialog", "aria-expanded": open, className: "cursor-pointer" },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label={chosen ? `Change date, ${formatDate(value, "long")}` : "Choose a date"} edge="end" size="small">
                    <CalendarMonth color={open ? "primary" : "inherit"} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        {/* Rendered next to the field (not at the end of the page) so Tab moves into it naturally. */}
        <Popper
          open={open}
          anchorEl={anchor}
          placement="bottom-start"
          disablePortal
          // Always open below the field, where the user is looking, instead of jumping above it.
          modifiers={[{ name: "flip", enabled: false }]}
          sx={{ zIndex: 1200 }}
        >
          <Paper elevation={8} role="dialog" aria-label="Choose a date" sx={{ borderRadius: 3, mt: 0.5 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                autoFocus
                value={chosen ? dayjs(value) : null}
                onChange={(picked, state) => {
                  if (!picked?.isValid()) return;
                  onChange(picked.format("YYYY-MM-DD"));
                  // Close once a day is picked (not while only the month or year is being changed).
                  if (state === "finish") close(true);
                }}
              />
            </LocalizationProvider>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  );
}
