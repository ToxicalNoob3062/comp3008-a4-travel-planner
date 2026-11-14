"use client";

// Step 4: Review. Every answer can be edited, and the search only runs when the user confirms.
import { useEffect, useRef, type Dispatch } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import EditOutlined from "@mui/icons-material/EditOutlined";
import Pop from "@/components/motion/Pop";
import SearchErrorPanel from "@/components/SearchErrorPanel";
import StepCard from "@/components/StepCard";
import { requestedTime, selectedServices, type Action, type EditableStep, type PlannerState } from "@/lib/plannerReducer";
import { serviceLabel } from "@/lib/services";
import { formatDate, formatTime } from "@/lib/time";
import type { ServiceId } from "@/lib/types";

interface ReviewStepProps {
  state: PlannerState;
  dispatch: Dispatch<Action>;
  onSearch: () => void;
  onUseStop: () => void;
  onAddService: (service: ServiceId) => void;
}

export default function ReviewStep({ state, dispatch, onSearch, onUseStop, onAddService }: ReviewStepProps) {
  const time = requestedTime(state);
  const searching = state.search.status === "loading";
  const error = state.search.status === "error" ? state.search.error : null;
  const errorRef = useRef<HTMLDivElement>(null);

  // Move focus to the error so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const viaStop = (which: "from" | "to") => {
    const stop = state.acceptedStops[which];
    return stop ? ` (${stop.walkMinutes}-min walk ${which === "from" ? "to" : "from"} ${stop.stopName})` : "";
  };

  const rows: { label: string; value: string; step: EditableStep }[] = [
    { label: "From", value: `${state.from?.name ?? ""}${viaStop("from")}`, step: "where" },
    { label: "To", value: `${state.to?.name ?? ""}${viaStop("to")}`, step: "where" },
    {
      label: state.mode === "leave" ? "Leave at" : "Arrive by",
      value: time === null ? "" : `${formatTime(time)}, ${formatDate(state.date)}`,
      step: "when",
    },
    { label: "Services", value: selectedServices(state).map(serviceLabel).join(", "), step: "services" },
  ];

  return (
    <StepCard
      title="Check your trip"
      step={4}
      actions={
        <>
          <Button variant="outlined" size="large" startIcon={<ChevronLeft />} onClick={() => dispatch({ type: "GO", screen: "services" })} disabled={searching}>
            Back
          </Button>
          <Button
            variant="contained"
            size="large"
            endIcon={searching ? <CircularProgress size={18} color="inherit" /> : <ChevronRight />}
            onClick={onSearch}
            disabled={searching}
          >
            {searching ? "Searching…" : "Find my routes"}
          </Button>
        </>
      }
    >
      <dl className="flex flex-col">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-4 border-b border-line py-3.5">
            <dt className="w-[90px] shrink-0 text-sm text-muted sm:w-[110px]">{row.label}</dt>
            <dd className="min-w-px flex-1 text-base font-medium text-ink">{row.value}</dd>
            <dd>
              <button
                type="button"
                className="press focus-ring flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium text-brand hover:bg-brand-tint disabled:opacity-50"
                onClick={() => dispatch({ type: "EDIT", step: row.step })}
                disabled={searching}
                aria-label={`Edit ${row.label.toLowerCase()}`}
              >
                <EditOutlined aria-hidden="true" sx={{ fontSize: 16 }} />
                Edit
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <div ref={errorRef} tabIndex={-1} role="alert" className="outline-none">
        {error ? (
          <Pop key={error.code}>
          <SearchErrorPanel
            error={error}
            busy={searching}
            onUseStop={onUseStop}
            onAddService={onAddService}
            onRetry={onSearch}
            onEdit={(step) => dispatch({ type: "EDIT", step })}
          />
          </Pop>
        ) : null}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {searching ? "Searching for routes" : ""}
      </p>
    </StepCard>
  );
}
