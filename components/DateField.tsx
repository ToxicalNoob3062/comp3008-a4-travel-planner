"use client";

// Date button that opens a Material UI calendar. The date is picked from the calendar, never typed,
// so only real dates can be entered. It shows the date as words, e.g. "Tue, Oct 6, 2026".
import { useRef, useState } from "react";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = anchor !== null;
  const chosen = isValidDate(value);

  const close = (returnFocus: boolean) => {
    setAnchor(null);
    if (returnFocus) buttonRef.current?.focus();
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
        {/* A pill in the same style as the time wheels, with its label inline. */}
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={chosen ? `${label}: ${formatDate(value, "long")}. Change date` : `${label}: choose a date`}
          onClick={(event) => (open ? close(false) : setAnchor(event.currentTarget))}
          onKeyDown={(event) => {
            if (!open && event.key === "ArrowDown") {
              event.preventDefault();
              setAnchor(event.currentTarget);
            }
          }}
          className={`flex h-10 w-full cursor-pointer items-center gap-2 rounded-full border px-4 text-left transition-colors focus-visible:border-2 focus-visible:border-brand focus-visible:bg-brand-tint focus-visible:outline-none ${
            open ? "border-2 border-brand bg-brand-tint" : "border-[#bdbdc2] bg-[#f2f2f4] hover:border-ink"
          }`}
        >
          {/* Icon first, then the value, then the label on the right: the same order as "9 hour" and "08 min".
              While empty it reads "Choose date". */}
          <CalendarMonth fontSize="small" color={open ? "primary" : "action"} />
          <span className={`flex-1 text-right text-base whitespace-nowrap ${chosen ? "font-semibold text-ink" : "text-[rgba(57,56,63,0.6)]"}`}>
            {chosen ? formatDate(value) : "Choose"}
          </span>
          <span className={`text-sm font-semibold ${open ? "text-brand" : "text-ink"}`}>{label.toLowerCase()}</span>
        </button>
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
