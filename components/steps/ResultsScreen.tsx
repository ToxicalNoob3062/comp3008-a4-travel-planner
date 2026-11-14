"use client";

// Results: on-time routes, with the one closest to the requested time already selected.
import type { Dispatch } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import FadeUp from "@/components/motion/FadeUp";
import LayoutMotion from "@/components/motion/LayoutMotion";
import Pop from "@/components/motion/Pop";
import SelectionHighlight from "@/components/motion/SelectionHighlight";
import StepCard from "@/components/StepCard";
import { resultsTitle, shiftLabel, timingNote } from "@/lib/labels";
import { requestedTime, type Action, type PlannerState } from "@/lib/plannerReducer";
import { formatDateShort, formatTime } from "@/lib/time";
import { tripLink } from "@/lib/tripLink";

export const SHIFT_MINUTES = 15;

interface ResultsScreenProps {
  state: PlannerState;
  dispatch: Dispatch<Action>;
  onShift: (minutes: number) => void;
  onSend: () => void;
  onReset: () => void;
}

export default function ResultsScreen({ state, dispatch, onShift, onSend, onReset }: ResultsScreenProps) {
  const mode = state.mode ?? "arrive";
  const time = requestedTime(state) ?? 0;
  const busy = state.search.status === "loading";
  const { send } = state;
  const sentRoute = send.status === "sent" ? state.results.find((r) => r.id === send.itineraryId) : undefined;
  // The first result in arrive-by order is the earliest; the pre-selected "closest" one is the best match.
  const bestId = mode === "arrive" ? state.results[state.results.length - 1]?.id : state.results[0]?.id;
  const origin = state.acceptedStops.from?.stopName ?? state.from?.name ?? "";

  return (
    <StepCard
      title={resultsTitle(mode, time)}
      headerAction={
        <Button startIcon={<ChevronLeft />} onClick={() => dispatch({ type: "GO", screen: "review" })}>
          Edit trip
        </Button>
      }
      footer={
        send.status === "sent" ? (
          <Button variant="outlined" size="large" fullWidth onClick={onReset}>
            Plan another trip
          </Button>
        ) : (
          // Phone: the two buttons sit side by side in the bar at the bottom of the screen, always in reach.
          <div className="flex flex-col gap-1.5 sm:gap-3">
            <p className="text-xs text-muted sm:text-sm">Not quite right? Search 15 minutes earlier or later.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="!px-2 !text-[13px] !leading-tight sm:!px-[22px] sm:!text-[15px]"
                variant="contained"
                size="large"
                startIcon={<ChevronLeft />}
                disabled={busy || time - SHIFT_MINUTES < 0}
                onClick={() => onShift(-SHIFT_MINUTES)}
              >
                {shiftLabel(mode, time - SHIFT_MINUTES)}
              </Button>
              <Button
                className="!px-2 !text-[13px] !leading-tight sm:!px-[22px] sm:!text-[15px]"
                variant="contained"
                size="large"
                endIcon={<ChevronRight />}
                disabled={busy || time + SHIFT_MINUTES > 1439}
                onClick={() => onShift(SHIFT_MINUTES)}
              >
                {shiftLabel(mode, time + SHIFT_MINUTES)}
              </Button>
            </div>
          </div>
        )
      }
    >
      <p className="-mt-3 text-[13px] text-muted sm:text-sm">
        {formatDateShort(state.date)} · {origin} → {state.to?.name}
      </p>

      <LayoutMotion>
      <fieldset className="flex flex-col gap-2 sm:gap-3" aria-busy={busy}>
        <legend className="visually-hidden">Choose a route</legend>
        {state.results.map((route, i) => {
          const selected = route.id === state.selectedId;
          return (
            // Route cards arrive one after another, so the list reads top to bottom.
            <FadeUp
              // The requested time is part of the key, so an earlier/later search brings in a fresh,
              // staggered list even when some of the same routes are in it.
              key={`${time}-${route.id}`}
              order={i}
              delay={0.1}
              // Every card has the same size and border; the selected look is a separate layer that slides between cards.
              className={`relative flex flex-wrap items-center gap-3 rounded-lg border bg-white px-3 py-2.5 sm:px-4 sm:py-3 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#1976d2] ${
                selected ? "border-transparent" : "border-line hover:border-ink"
              }`}
            >
              {selected ? <SelectionHighlight group="route" className="rounded-lg border-2 border-brand bg-brand-tint" /> : null}
              <label className="relative flex min-w-[220px] flex-1 cursor-pointer items-start gap-2.5 sm:gap-3">
                <input
                  type="radio"
                  name="route"
                  className="mt-1 size-4 accent-[#d30f1d] sm:mt-1.5"
                  checked={selected}
                  onChange={() => dispatch({ type: "SELECT_ROUTE", id: route.id })}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-ink sm:text-lg">
                    Leave {formatTime(route.leave)} <span aria-hidden="true">→</span>
                    <span className="visually-hidden">, </span> Arrive {formatTime(route.arrive)}
                  </span>
                  {/* Phone: room is left on the right of these two lines for the Explore button. */}
                  <span className="pr-24 text-[13px] text-muted sm:pr-0">{route.summary}</span>
                  <span className="pr-24 text-[13px] font-medium text-[#1b5e20] sm:pr-0">
                    {timingNote(route, mode)}
                    {route.id === bestId ? (mode === "arrive" ? ` · closest to ${formatTime(time)}` : " · arrives first") : ""}
                  </span>
                </span>
              </label>
              {/* Phone: a compact button in the card's bottom-right corner, so a route is three lines tall. Wide: beside the text. */}
              <Button
                className="!absolute right-1.5 bottom-1.5 !min-h-9 sm:!relative sm:right-auto sm:bottom-auto sm:!min-h-0"
                variant="outlined"
                size="small"
                onClick={() => dispatch({ type: "OPEN_DETAILS", id: route.id })}
                aria-label={`Explore route leaving ${formatTime(route.leave)}`}
              >
                Explore<span className="hidden sm:inline">&nbsp;route</span>
              </Button>
            </FadeUp>
          );
        })}
      </fieldset>
      </LayoutMotion>

      <div aria-live="polite" className="contents">
        {state.notice ? (
          <Pop key={state.notice} stay>
            <Alert severity="warning">{state.notice}</Alert>
          </Pop>
        ) : null}
        {send.status === "sent" && sentRoute ? (
          <Pop stay>
          <Alert severity="success">
            <AlertTitle sx={{ fontWeight: 500 }}>Route sent to your phone</AlertTitle>
            Leave {formatTime(sentRoute.leave)} from {state.from?.name}, arrive {formatTime(sentRoute.arrive)} ({timingNote(sentRoute, mode)}).
            Reference {send.code}.
            {/* The link always starts its own line, so no separator is ever left dangling at a line break. */}
            <a className="mt-0.5 block font-medium underline" href={tripLink({
                code: send.code,
                fromName: state.from?.name ?? "",
                toName: state.to?.name ?? "",
                date: state.date,
                mode,
                time,
                itinerary: sentRoute,
              })} target="_blank" rel="noreferrer">
              See what was sent (opens in a new tab)
            </a>
          </Alert>
          </Pop>
        ) : null}
        {send.status === "error" ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={onSend}>
                Try again
              </Button>
            }
          >
            <AlertTitle sx={{ fontWeight: 500 }}>The route was not sent</AlertTitle>
            {send.message} Your route is still selected.
          </Alert>
        ) : null}
      </div>

    </StepCard>
  );
}
