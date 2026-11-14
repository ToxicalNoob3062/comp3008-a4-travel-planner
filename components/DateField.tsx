"use client";

// Date field that opens a Material UI calendar. The date is picked from the calendar, never typed,
// so only real dates can be entered. It shows the date as words, e.g. "Tue, Oct 6, 2026".
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Popover from "@mui/material/Popover";
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
  const open = anchor !== null;
  const close = () => setAnchor(null);
  const chosen = isValidDate(value);

  return (
    <>
      <TextField
        label={label}
        variant="standard"
        focused={open || undefined}
        className={className}
        value={chosen ? formatDate(value) : ""}
        placeholder="Choose a date"
        onClick={(event) => setAnchor(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
            event.preventDefault();
            setAnchor(event.currentTarget);
          }
        }}
        slotProps={{
          inputLabel: { shrink: true },
          htmlInput: { readOnly: true, "aria-haspopup": "dialog", className: "cursor-pointer" },
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
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { role: "dialog", "aria-label": "Choose a date", sx: { borderRadius: 3, mt: 0.5 } } }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            autoFocus
            value={chosen ? dayjs(value) : null}
            onChange={(picked, state) => {
              if (!picked?.isValid()) return;
              onChange(picked.format("YYYY-MM-DD"));
              // Close once a day is picked (not while only the month or year is being changed).
              if (state === "finish") close();
            }}
          />
        </LocalizationProvider>
      </Popover>
    </>
  );
}
