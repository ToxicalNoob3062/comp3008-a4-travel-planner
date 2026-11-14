"use client";

// Step 2: When. The user must choose "Arrive by" or "Leave at" first (nothing is pre-selected).
// Only then do the date and time fields appear, and Next unlocks once they are valid.
import type { Dispatch } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import AccessTime from "@mui/icons-material/AccessTime";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Flag from "@mui/icons-material/Flag";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
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
      <fieldset className="flex flex-col gap-4 sm:flex-row">
        <legend className="visually-hidden">Do you need to arrive by a time or leave at a time?</legend>
        {CHOICES.map(({ mode: choice, title, text, Icon }) => {
          const selected = mode === choice;
          return (
            <label
              key={choice}
              className={`flex flex-1 cursor-pointer items-center gap-4 rounded-[10px] px-5 py-[18px] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#1976d2] ${
                selected
                  ? "border-2 border-brand bg-brand-tint shadow-[0_4px_12px_rgba(212,15,28,0.18)]"
                  : "border border-[#dcdcdf] bg-white p-[19px] hover:border-ink"
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
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-[10px] ${selected ? "bg-brand text-white" : "bg-[#f2f2f4] text-ink"}`}>
                <Icon aria-hidden="true" />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className={`text-lg font-semibold ${selected ? "text-brand" : "text-ink"}`}>{title}</span>
                <span className="text-sm text-[#6b6a70]">{text}</span>
              </span>
              {selected ? (
                <CheckCircle aria-hidden="true" color="primary" sx={{ fontSize: 22 }} />
              ) : (
                <RadioButtonUnchecked aria-hidden="true" sx={{ fontSize: 22, color: "#8a8a8f" }} />
              )}
            </label>
          );
        })}
      </fieldset>

      {mode ? (
        <>
          <div className="flex flex-wrap items-start gap-x-5 gap-y-4">
            <DateField
              label="Date"
              className="min-w-[220px] flex-1 max-sm:basis-full sm:mt-[50px]"
              value={date}
              onChange={(value) => dispatch({ type: "SET_FIELD", field: "date", value })}
            />
            <div role="group" aria-label="Time" className="flex items-start gap-3">
              <TimeWheel label="Hour" options={HOURS} value={hour} pageStep={3} onChange={(value) => dispatch({ type: "SET_FIELD", field: "hour", value })} />
              <TimeWheel label="Min" options={MINUTES} value={minute} onChange={(value) => dispatch({ type: "SET_FIELD", field: "minute", value })} />
            </div>
            <div role="group" aria-label="AM or PM" className="flex gap-3 pt-[58px]">
              {(["AM", "PM"] as Meridiem[]).map((value) => (
                <Button
                  key={value}
                  variant={meridiem === value ? "contained" : "outlined"}
                  aria-pressed={meridiem === value}
                  onClick={() => dispatch({ type: "SET_MERIDIEM", meridiem: value })}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>

          {/* The system repeats the goal back in plain words so a wrong setting is noticed here.
              Its space is reserved so the buttons below do not move when it appears. */}
          <div aria-live="polite" className="min-h-[78px]">
            {complete && time !== null ? (
              <Alert severity="info" icon={<InfoOutlined color="primary" />} sx={{ bgcolor: "#f5f5f5", color: "text.primary" }}>
                <AlertTitle sx={{ fontWeight: 500, mb: 0.5 }}>
                  {mode === "arrive"
                    ? `You will ARRIVE at ${state.to?.name ?? "your destination"}`
                    : `You will LEAVE ${state.from?.name ?? "your start"}`}
                </AlertTitle>
                {mode === "arrive" ? "by" : "at"} {formatTime(time)} ({format24(time)}) on {formatDate(date, "long")}.
              </Alert>
            ) : null}
          </div>
        </>
      ) : (
        <p className="rounded bg-[#f5f5f5] px-4 py-3 text-sm text-ink">
          Pick one. The date and time appear after you choose, and nothing is chosen for you.
        </p>
      )}
    </StepCard>
  );
}
