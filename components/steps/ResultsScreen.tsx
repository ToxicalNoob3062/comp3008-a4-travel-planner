"use client";

// Results: on-time routes, with the one closest to the requested time already selected.
import type { Dispatch } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import FadeUp from "@/components/motion/FadeUp";
import Pop from "@/components/motion/Pop";
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
    >
      <p className="-mt-3 text-sm text-muted">
        {formatDateShort(state.date)} · {origin} → {state.to?.name}
      </p>

      <fieldset className="flex flex-col gap-3" aria-busy={busy}>
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
              className={`flex flex-wrap items-center gap-3 rounded-lg px-4 py-3 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#1976d2] ${
                selected ? "border-2 border-brand bg-brand-tint" : "border border-line bg-white p-[13px_17px] hover:border-ink"
              }`}
            >
              <label className="flex min-w-[220px] flex-1 cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="route"
                  className="mt-1.5 size-4 accent-[#d30f1d]"
                  checked={selected}
                  onChange={() => dispatch({ type: "SELECT_ROUTE", id: route.id })}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-lg font-medium text-ink">
                    Leave {formatTime(route.leave)} <span aria-hidden="true">→</span>
                    <span className="visually-hidden">, </span> Arrive {formatTime(route.arrive)}
                  </span>
                  <span className="text-[13px] text-muted">{route.summary}</span>
                  <span className="text-[13px] font-medium text-[#1b5e20]">
                    {timingNote(route, mode)}
                    {route.id === bestId ? (mode === "arrive" ? ` · closest to ${formatTime(time)}` : " · arrives first") : ""}
                  </span>
                </span>
              </label>
              <Button variant="outlined" size="small" onClick={() => dispatch({ type: "OPEN_DETAILS", id: route.id })} aria-label={`Explore route leaving ${formatTime(route.leave)}`}>
                Explore route
              </Button>
            </FadeUp>
          );
        })}
      </fieldset>

      <div aria-live="polite" className="flex flex-col gap-3">
        {state.notice ? (
          <Pop key={state.notice}>
            <Alert severity="warning">{state.notice}</Alert>
          </Pop>
        ) : null}
        {send.status === "sent" && sentRoute ? (
          <Pop>
          <Alert severity="success">
            <AlertTitle sx={{ fontWeight: 500 }}>Route sent to your phone</AlertTitle>
            Leave {formatTime(sentRoute.leave)} from {state.from?.name}, arrive {formatTime(sentRoute.arrive)} ({timingNote(sentRoute, mode)}).
            Reference {send.code} ·{" "}
            <a className="font-medium underline" href={tripLink({
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

      <div className="min-h-px flex-1" />
      {send.status === "sent" ? (
        <Button variant="outlined" size="large" fullWidth onClick={onReset}>
          Plan another trip
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">Not quite right?</p>
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-w-[200px] flex-1"
              variant="contained"
              size="large"
              startIcon={<ChevronLeft />}
              disabled={busy || time - SHIFT_MINUTES < 0}
              onClick={() => onShift(-SHIFT_MINUTES)}
            >
              {shiftLabel(mode, time - SHIFT_MINUTES)}
            </Button>
            <Button
              className="min-w-[200px] flex-1"
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
      )}
    </StepCard>
  );
}
