"use client";

// Step 2: When. The user must choose "Arrive by" or "Leave at" first (nothing is pre-selected).
// Only then do the date and time fields appear, and Next unlocks once they are valid.
import type { Dispatch } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import AccessTime from "@mui/icons-material/AccessTime";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Flag from "@mui/icons-material/Flag";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import KeyboardOutlined from "@mui/icons-material/KeyboardOutlined";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import FadeUp from "@/components/motion/FadeUp";
import Pop from "@/components/motion/Pop";
import ScaleIn from "@/components/motion/ScaleIn";
import DateField from "@/components/DateField";
import StepActions from "@/components/StepActions";
import StepCard from "@/components/StepCard";
import TimeWheel from "@/components/TimeWheel";
import { isWhenComplete, requestedTime, type Action, type PlannerState } from "@/lib/plannerReducer";
import { format24, formatDate, formatTime, isValidDate } from "@/lib/time";
import type { Meridiem, TimeMode } from "@/lib/types";

const CHOICES: { mode: TimeMode; title: string; text: string; Icon: typeof Flag }[] = [
  { mode: "arrive", title: "Arrive by", text: "Get there by a set time", Icon: Flag },
  { mode: "leave", title: "Leave at", text: "Start out at a set time", Icon: AccessTime },
];

// "" is the wheel's starting position: nothing is chosen for the user.
const HOURS = ["", ...Array.from({ length: 12 }, (_, i) => String(i + 1))];
const MINUTES = ["", ...Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))];

export default function WhenStep({ state, dispatch }: { state: PlannerState; dispatch: Dispatch<Action> }) {
  const { mode, date, hour, minute, meridiem } = state;
  const time = requestedTime(state);
  const complete = isWhenComplete(state);

  let hint = "Choose Arrive by or Leave at to continue.";
  if (mode) {
    if (!isValidDate(date)) hint = "Choose a date to continue.";
    else if (hour === "" || minute === "") hint = "Scroll to the hour and minutes to continue.";
    else if (!meridiem) hint = "Choose AM or PM to continue.";
  }

  return (
    <StepCard
      title="When do you need to travel?"
      step={2}
      actions={
        <StepActions
          editing={state.editing}
          onBack={() => dispatch({ type: "GO", screen: state.editing ? "review" : "where" })}
          onNext={() => dispatch({ type: "GO", screen: state.editing ? "review" : "services" })}
          nextDisabled={!complete}
          hint={hint}
        />
      }
    >
      <fieldset className="grid grid-cols-2 gap-2 sm:flex sm:gap-4">
        <legend className="visually-hidden">Do you need to arrive by a time or leave at a time?</legend>
        {CHOICES.map(({ mode: choice, title, text, Icon }) => {
          const selected = mode === choice;
          return (
            <label
              key={choice}
              // Phone: two compact cards side by side (no icon tile). Wide: two roomy cards in a row.
              // The border is always 2px, so choosing a card never changes its size.
              className={`press flex flex-1 cursor-pointer items-center gap-2 rounded-[10px] border-2 px-3 py-2.5 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#1976d2] sm:gap-4 sm:px-5 sm:py-[18px] ${
                selected
                  ? "border-brand bg-brand-tint shadow-[0_4px_12px_rgba(212,15,28,0.18)]"
                  : "border-[#dcdcdf] bg-white hover:border-ink"
              }`}
            >
              <input
                type="radio"
                name="time-mode"
                value={choice}
                checked={selected}
                onChange={() => dispatch({ type: "SET_MODE", mode: choice })}
                className="visually-hidden"
              />
              <span className={`hidden size-11 shrink-0 items-center sm:flex justify-center rounded-[10px] ${selected ? "bg-brand text-white" : "bg-[#f2f2f4] text-ink"}`}>
                <Icon aria-hidden="true" />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className={`text-base font-semibold sm:text-lg ${selected ? "text-brand" : "text-ink"}`}>{title}</span>
                <span className="text-xs text-[#6b6a70] sm:text-sm">{text}</span>
              </span>
              {selected ? (
                // The check mark pops in to confirm the choice.
                <ScaleIn>
                  <CheckCircle aria-hidden="true" color="primary" sx={{ fontSize: 22 }} />
                </ScaleIn>
              ) : (
                <RadioButtonUnchecked aria-hidden="true" sx={{ fontSize: 22, color: "#8a8a8f" }} />
              )}
            </label>
          );
        })}
      </fieldset>

      {mode ? (
        // The date and time controls rise into place once Arrive by / Leave at is chosen.
        <FadeUp className="flex flex-col gap-4 [--gap:1rem] sm:gap-6 sm:[--gap:1.5rem]">
          {/* Phone: the date takes a full row, then the time wheels and AM/PM share the next row. Wide: all in one row. */}
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 sm:gap-x-5 sm:gap-y-4">
            <DateField
              label="Date"
              className="w-full sm:mt-10 sm:w-[210px]"
              value={date}
              onChange={(value) => dispatch({ type: "SET_FIELD", field: "date", value })}
            />
            <div role="group" aria-label="Time" className="flex items-start">
              <TimeWheel describedBy="time-hint" label="Hour" unit="hour" side="left" options={HOURS} value={hour} pageStep={3} onChange={(value) => dispatch({ type: "SET_FIELD", field: "hour", value })} />
              <TimeWheel describedBy="time-hint" label="Minute" unit="min" side="right" options={MINUTES} value={minute} onChange={(value) => dispatch({ type: "SET_FIELD", field: "minute", value })} />
            </div>
            {/* One pill with two halves, in the same style as the date and time pills. */}
            <div role="group" aria-label="AM or PM" className="flex h-10 min-[372px]:mt-10">
              {(["AM", "PM"] as Meridiem[]).map((value, i) => {
                const pressed = meridiem === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => dispatch({ type: "SET_MERIDIEM", meridiem: value })}
                    className={`focus-ring relative w-14 cursor-pointer border text-sm font-semibold press transition-colors focus-visible:z-10 ${
                      i === 0 ? "rounded-l-full" : "-ml-px rounded-r-full"
                    } ${
                      pressed
                        ? "z-[1] border-brand bg-brand text-white"
                        : "border-[#bdbdc2] bg-[#f2f2f4] text-ink hover:border-ink hover:z-[1]"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The wheels point at this text for screen readers; it stays after the visible tip has faded away. */}
          <p id="time-hint" className="visually-hidden">
            Scroll or swipe the wheel, type the number, or use the arrow keys.
          </p>
          <Pop className="-mt-2 sm:-mt-3">
          <Alert severity="info" icon={<KeyboardOutlined fontSize="small" />} sx={{ py: 0, fontSize: 13 }}>
            {/* The tip matches the device: touch screens swipe, a mouse and keyboard click and type. */}
            <span className="pointer-coarse:hidden">Click a wheel, then scroll, type the number or use the arrow keys. You can also click a value directly.</span>
            <span className="hidden pointer-coarse:inline">Swipe a wheel up or down, or tap a value.</span>
          </Alert>
          </Pop>

          {/* The system repeats the goal back in plain words so a wrong setting is noticed here.
              It pops in again whenever the date or time changes, then fades away like the other notes. */}
          <div aria-live="polite" className="contents">
            {complete && time !== null ? (
              <Pop key={`${mode}-${date}-${time}`}>
              <Alert severity="info" icon={<InfoOutlined color="primary" />} sx={{ bgcolor: "#f5f5f5", color: "text.primary" }}>
                <AlertTitle sx={{ fontWeight: 500, mb: 0.5 }}>
                  {mode === "arrive"
                    ? `You will ARRIVE at ${state.to?.name ?? "your destination"}`
                    : `You will LEAVE ${state.from?.name ?? "your start"}`}
                </AlertTitle>
                {mode === "arrive" ? "by" : "at"} {formatTime(time)} ({format24(time)}) on {formatDate(date, "long")}.
              </Alert>
              </Pop>
            ) : null}
          </div>
        </FadeUp>
      ) : (
        // A real message box (not a plain paragraph), so it pops in and wraps like every other one.
        <Pop>
          <Alert severity="info" icon={<InfoOutlined color="primary" />} sx={{ bgcolor: "#f5f5f5", color: "text.primary" }}>
            Pick one. The date and time appear after you choose, and nothing is chosen for you.
          </Alert>
        </Pop>
      )}
    </StepCard>
  );
}
